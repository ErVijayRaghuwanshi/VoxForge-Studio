"""
FastAPI Backend for End-to-End Voice Cloning Studio:
1. Upload raw multi-speaker audio
2. Run speaker diarization & identify distinct speakers
3. Filter & preprocess raw audio for the chosen speaker
4. Fine-tune / train the voice cloning model
5. Save & export trained speaker model weights
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from pipeline import VoiceCloningPipeline

app = FastAPI(
    title="VoxForge Voice Cloning API",
    description="Speaker Diarization, Speaker Audio Isolation, Voice Cloning Training & Export",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = VoiceCloningPipeline(workspace_dir="./workspace")
SESSIONS: Dict[str, Dict[str, Any]] = {}


class PreprocessRequest(BaseModel):
    session_id: str
    speaker_id: str
    target_sr: int = 24000
    target_lufs: float = -18.0
    denoise_strength: float = 0.75
    remove_overlaps: bool = True
    min_clip_sec: float = 1.5
    max_clip_sec: float = 10.0


class TrainModelRequest(BaseModel):
    session_id: str
    speaker_id: str
    model_name: str
    architecture: str = "xtts_v2"
    epochs: int = 50
    batch_size: int = 4
    learning_rate: float = 5e-6
    export_format: str = "pth"


@app.post("/api/audio/upload-and-diarize")
async def upload_and_diarize(file: UploadFile = File(...)):
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    ext = Path(file.filename or "audio.wav").suffix or ".wav"
    raw_path = pipeline.raw_dir / f"{session_id}{ext}"

    with open(raw_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    diarization_result = pipeline.identify_speakers(str(raw_path))
    SESSIONS[session_id] = {
        "session_id": session_id,
        "filename": file.filename,
        "raw_path": str(raw_path),
        "diarization": diarization_result,
    }
    return {
        "session_id": session_id,
        "filename": file.filename,
        **diarization_result,
    }


@app.post("/api/speaker/preprocess")
async def preprocess_selected_speaker(req: PreprocessRequest):
    session = SESSIONS.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = pipeline.process_speaker_audio(
        audio_path=session["raw_path"],
        speaker_id=req.speaker_id,
        segments=session["diarization"]["segments"],
        target_sr=req.target_sr,
        target_lufs=req.target_lufs,
        denoise_strength=req.denoise_strength,
        remove_overlaps=req.remove_overlaps,
        min_clip_sec=req.min_clip_sec,
        max_clip_sec=req.max_clip_sec,
    )
    session["preprocessed"] = result
    return result


@app.post("/api/model/train-and-export")
async def train_and_export(req: TrainModelRequest):
    session = SESSIONS.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    export_bundle = pipeline.train_and_export_model(
        speaker_id=req.speaker_id,
        model_name=req.model_name,
        architecture=req.architecture,
        epochs=req.epochs,
        batch_size=req.batch_size,
        learning_rate=req.learning_rate,
        export_format=req.export_format,
    )
    session["model"] = export_bundle
    return export_bundle


@app.get("/api/model/download/{model_name}/{filename}")
async def download_exported_model(model_name: str, filename: str):
    file_path = pipeline.models_dir / model_name / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Exported model file not found")
    return FileResponse(path=str(file_path), filename=filename)

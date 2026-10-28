# VoxForge Full-Stack Voice Cloning Studio (FastAPI + React)

End-to-end voice cloning application that:
1. Ingests raw multi-speaker audio files and performs speaker diarization (`pyannote/speaker-diarization-3.1`).
2. Isolates the user-selected speaker, removes cross-talk overlaps, applies spectral noise gating (`noisereduce`), trims silence (`librosa`), and normalizes loudness (`pyloudnorm`).
3. Fine-tunes a speaker voice model (XTTS-v2 / RVC v2 / GPT-SoVITS) on the curated dataset.
4. Synthesizes cloned speech and exports model checkpoints (`.pth`, `.safetensors`, `.onnx`) with `speaker_config.json`.

## Quick Start

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
export HF_TOKEN="your_huggingface_token_for_pyannote"
uvicorn main:app --reload --port 8000
```

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  Upload,
  Users,
  Sliders,
  Cpu,
  Download,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  FileAudio,
  Scissors,
  RefreshCw,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Activity,
  ShieldCheck,
  Terminal,
  Wand2,
  Archive,
  Trash2,
  Plus
} from 'lucide-react';

// Pre-loaded multi-speaker raw audio datasets for immediate exploration
const SAMPLE_RAW_FILES = [
  {
    id: 'raw_podcast_01',
    name: 'tech_podcast_ep42_raw.wav',
    size: '48.4 MB',
    duration: 46.0,
    sampleRate: 48000,
    channels: 2,
    format: 'WAV 24-bit PCM',
    noiseFloorDb: -34.2,
    description: '3-speaker studio roundtable with cross-talk & room HVAC hum',
    speakers: [
      {
        id: 'SPEAKER_00',
        label: 'Speaker 00 (Host - Baritone)',
        pitchHz: 118,
        formantShift: 1.0,
        genderHint: 'Male • Warm Baritone',
        color: '#6366f1',
        badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        confidence: 0.98,
        snrDb: 28.4
      },
      {
        id: 'SPEAKER_01',
        label: 'Speaker 01 (Guest A - Mezzo)',
        pitchHz: 196,
        formantShift: 1.28,
        genderHint: 'Female • Clear Mezzo',
        color: '#10b981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        confidence: 0.96,
        snrDb: 26.9
      },
      {
        id: 'SPEAKER_02',
        label: 'Speaker 02 (Guest B - Tenor)',
        pitchHz: 148,
        formantShift: 1.12,
        genderHint: 'Male • Bright Tenor',
        color: '#f59e0b',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        confidence: 0.91,
        snrDb: 22.1
      }
    ],
    segments: [
      { id: 'seg_01', speakerId: 'SPEAKER_00', start: 0.4, end: 5.8, overlapping: false, snr: 29.1, text: 'Welcome back to the show. Today we are exploring neural speech synthesis and low-latency voice cloning.' },
      { id: 'seg_02', speakerId: 'SPEAKER_01', start: 6.2, end: 12.4, overlapping: false, snr: 27.5, text: 'Thanks for having me. The biggest leap recently has been isolating clean speaker embeddings from noisy recordings.' },
      { id: 'seg_03', speakerId: 'SPEAKER_00', start: 12.8, end: 17.5, overlapping: false, snr: 28.8, text: 'Exactly. Even five minutes of diarized, well-normalized audio can produce remarkably natural prosody.' },
      { id: 'seg_04', speakerId: 'SPEAKER_02', start: 17.1, end: 20.6, overlapping: true, snr: 18.4, text: 'Wait—does overlapping cross-talk corrupt the speaker encoder latents if you leave it in?' },
      { id: 'seg_05', speakerId: 'SPEAKER_01', start: 21.0, end: 27.8, overlapping: false, snr: 28.0, text: 'It definitely does. That is why automatic overlap rejection and spectral gating are essential before training.' },
      { id: 'seg_06', speakerId: 'SPEAKER_00', start: 28.3, end: 34.9, overlapping: false, snr: 29.4, text: 'Let us run this raw recording through the diarization pipeline and extract each speaker into a clean training manifest.' },
      { id: 'seg_07', speakerId: 'SPEAKER_02', start: 35.3, end: 40.5, overlapping: false, snr: 24.2, text: 'Once the checkpoint converges, we can export both PyTorch weights and an ONNX runtime graph for production.' },
      { id: 'seg_08', speakerId: 'SPEAKER_00', start: 40.9, end: 45.6, overlapping: false, snr: 28.7, text: 'Let us kick off the fine-tuning job and test the cloned voice with custom text prompts.' }
    ]
  },
  {
    id: 'raw_audiobook_02',
    name: 'dramatic_dialogue_take3.flac',
    size: '31.8 MB',
    duration: 36.0,
    sampleRate: 44100,
    channels: 1,
    format: 'FLAC 16-bit Mono',
    noiseFloorDb: -42.5,
    description: '2-speaker dramatic narration session with wide dynamic range',
    speakers: [
      {
        id: 'SPEAKER_00',
        label: 'Speaker 00 (Narrator - Alto)',
        pitchHz: 175,
        formantShift: 1.22,
        genderHint: 'Female • Resonant Alto',
        color: '#6366f1',
        badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        confidence: 0.99,
        snrDb: 33.2
      },
      {
        id: 'SPEAKER_01',
        label: 'Speaker 01 (Character - Bass)',
        pitchHz: 102,
        formantShift: 0.92,
        genderHint: 'Male • Deep Bass',
        color: '#10b981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        confidence: 0.97,
        snrDb: 31.8
      }
    ],
    segments: [
      { id: 'seg_101', speakerId: 'SPEAKER_00', start: 0.5, end: 7.2, overlapping: false, snr: 34.0, text: 'The observatory dome slowly rotated toward the northern horizon as the storm clouds cleared.' },
      { id: 'seg_102', speakerId: 'SPEAKER_01', start: 7.8, end: 14.1, overlapping: false, snr: 32.1, text: 'Check the telemetry calibration again. We only get one window to capture the signal.' },
      { id: 'seg_103', speakerId: 'SPEAKER_00', start: 14.6, end: 21.4, overlapping: false, snr: 33.5, text: 'All receivers are locked on frequency, and the baseline noise floor is completely flat.' },
      { id: 'seg_104', speakerId: 'SPEAKER_01', start: 21.2, end: 24.5, overlapping: true, snr: 21.0, text: 'Hold on, I see a secondary harmonic spike emerging right now.' },
      { id: 'seg_105', speakerId: 'SPEAKER_00', start: 25.0, end: 31.0, overlapping: false, snr: 33.8, text: 'Recording raw waveform channels to disk so we can isolate the voice transmission later.' },
      { id: 'seg_106', speakerId: 'SPEAKER_01', start: 31.4, end: 35.6, overlapping: false, snr: 32.4, text: 'Copy that. Keep the gain steady through the final transmission.' }
    ]
  }
];

const BACKEND_FILES = {
  'backend/main.py': `from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil, uuid
from pathlib import Path
from pipeline import VoiceCloningPipeline

app = FastAPI(title="VoxForge Voice Cloning API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

pipeline = VoiceCloningPipeline(workspace_dir="./workspace")
SESSIONS = {}

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
    raw_path = pipeline.raw_dir / f"{session_id}_{file.filename}"
    with open(raw_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    diarization = pipeline.identify_speakers(str(raw_path))
    SESSIONS[session_id] = {"raw_path": str(raw_path), "diarization": diarization}
    return {"session_id": session_id, "filename": file.filename, **diarization}

@app.post("/api/speaker/preprocess")
async def preprocess_selected_speaker(req: PreprocessRequest):
    session = SESSIONS.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return pipeline.process_speaker_audio(
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

@app.post("/api/model/train-and-export")
async def train_and_export(req: TrainModelRequest):
    return pipeline.train_and_export_model(
        speaker_id=req.speaker_id,
        model_name=req.model_name,
        architecture=req.architecture,
        epochs=req.epochs,
        batch_size=req.batch_size,
        learning_rate=req.learning_rate,
        export_format=req.export_format,
    )`,
  'backend/pipeline.py': `import json, uuid, shutil
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa
import noisereduce as nr
import pyloudnorm as pyln
from pyannote.audio import Pipeline

class VoiceCloningPipeline:
    def __init__(self, workspace_dir: str = "./workspace"):
        self.workspace = Path(workspace_dir)
        self.raw_dir = self.workspace / "raw_audio"
        self.processed_dir = self.workspace / "processed_speakers"
        self.models_dir = self.workspace / "models"
        for d in (self.raw_dir, self.processed_dir, self.models_dir):
            d.mkdir(parents=True, exist_ok=True)
        self._diarizer = None

    def identify_speakers(self, audio_path: str):
        if self._diarizer is None:
            self._diarizer = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1")
        diarization = self._diarizer(audio_path)
        segments, speakers = [], {}
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            dur = round(turn.end - turn.start, 2)
            if dur < 0.4:
                continue
            segments.append({
                "id": f"seg_{uuid.uuid4().hex[:8]}",
                "speaker_id": speaker,
                "start": round(turn.start, 2),
                "end": round(turn.end, 2),
                "duration": dur,
            })
            speakers.setdefault(speaker, {"speaker_id": speaker, "total_duration": 0.0, "segment_count": 0})
            speakers[speaker]["total_duration"] = round(speakers[speaker]["total_duration"] + dur, 2)
            speakers[speaker]["segment_count"] += 1
        return {"speakers": list(speakers.values()), "segments": segments}

    def process_speaker_audio(self, audio_path, speaker_id, segments, target_sr=24000,
                              target_lufs=-18.0, denoise_strength=0.75, remove_overlaps=True,
                              min_clip_sec=1.5, max_clip_sec=10.0):
        y, _ = librosa.load(audio_path, sr=target_sr, mono=True)
        meter = pyln.Meter(target_sr)
        out_dir = self.processed_dir / speaker_id / "wavs"
        out_dir.mkdir(parents=True, exist_ok=True)
        manifest = []
        for idx, seg in enumerate(segments):
            if seg["speaker_id"] != speaker_id or (remove_overlaps and seg.get("overlapping")):
                continue
            clip = y[int(seg["start"] * target_sr):int(seg["end"] * target_sr)]
            if denoise_strength > 0:
                clip = nr.reduce_noise(y=clip, sr=target_sr, prop_decrease=denoise_strength)
            clip, _ = librosa.effects.trim(clip, top_db=30)
            loudness = meter.integrated_loudness(clip)
            if not np.isinf(loudness):
                clip = np.clip(pyln.normalize.loudness(clip, loudness, target_lufs), -0.98, 0.98)
            fname = f"{speaker_id}_{idx:04d}.wav"
            sf.write(str(out_dir / fname), clip, target_sr, subtype="PCM_16")
            manifest.append({"clip_id": f"clip_{idx:04d}", "filename": fname, "duration": round(len(clip)/target_sr, 2)})
        return {"speaker_id": speaker_id, "clip_count": len(manifest), "clips": manifest}`,
  'backend/requirements.txt': `fastapi==0.115.0
uvicorn[standard]==0.30.6
python-multipart==0.0.9
torch==2.4.1
torchaudio==2.4.1
pyannote.audio==3.3.1
librosa==0.10.2.post1
soundfile==0.12.1
noisereduce==3.0.2
pyloudnorm==0.1.1
faster-whisper==1.0.3
TTS==0.22.0
onnx==1.16.2
safetensors==0.4.5`
};

export default function App() {
  // Navigation & Workflow Step State
  const [activeStep, setActiveStep] = useState(1);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCodeFile, setSelectedCodeFile] = useState('backend/main.py');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toast, setToast] = useState(null);

  // Step 1: Raw Audio & Speaker Diarization State
  const [rawFiles, setRawFiles] = useState(SAMPLE_RAW_FILES);
  const [selectedFileId, setSelectedFileId] = useState(SAMPLE_RAW_FILES[0].id);
  const [isDiarizing, setIsDiarizing] = useState(false);
  const [diarizationDone, setDiarizationDone] = useState(true);
  const [diarizationModel, setDiarizationModel] = useState('pyannote/speaker-diarization-3.1');
  const [minSpeakers, setMinSpeakers] = useState(2);
  const [maxSpeakers, setMaxSpeakers] = useState(4);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('SPEAKER_00');
  const [playingId, setPlayingId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Step 2: Audio Preprocessing for Chosen Speaker
  const [denoiseEnabled, setDenoiseEnabled] = useState(true);
  const [denoiseStrength, setDenoiseStrength] = useState(78);
  const [vocalIsolation, setVocalIsolation] = useState(true);
  const [removeOverlaps, setRemoveOverlaps] = useState(true);
  const [trimSilenceDb, setTrimSilenceDb] = useState(-32);
  const [targetSampleRate, setTargetSampleRate] = useState(24000);
  const [targetLufs, setTargetLufs] = useState(-18);
  const [excludedSegments, setExcludedSegments] = useState({});
  const [customTranscripts, setCustomTranscripts] = useState({});
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioProcessed, setAudioProcessed] = useState(true);

  // Step 3: Speaker Model Training State
  const [modelName, setModelName] = useState('vox_speaker00_xtts_v2');
  const [architecture, setArchitecture] = useState('xtts_v2');
  const [totalEpochs, setTotalEpochs] = useState(40);
  const [batchSize, setBatchSize] = useState(8);
  const [learningRate, setLearningRate] = useState('5e-6');
  const [pitchExtractor, setPitchExtractor] = useState('rmvpe');
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(40);
  const [trainingLogs, setTrainingLogs] = useState([
    '[INFO] Loaded 5 curated speaker clips (29.8s clean speech @ 24kHz, -18 LUFS)',
    '[INFO] Extracted speaker conditioning latents & RMVPE F0 pitch contour',
    '[EPOCH 10/40] mel_loss: 1.842 | kl_loss: 0.412 | disc_loss: 0.914 | grad_norm: 0.62',
    '[EPOCH 20/40] mel_loss: 1.194 | kl_loss: 0.285 | disc_loss: 0.802 | grad_norm: 0.48',
    '[EPOCH 30/40] mel_loss: 0.812 | kl_loss: 0.194 | disc_loss: 0.721 | grad_norm: 0.35',
    '[EPOCH 40/40] mel_loss: 0.584 | kl_loss: 0.142 | disc_loss: 0.668 | Converged!'
  ]);
  const [lossHistory, setLossHistory] = useState(() => {
    const arr = [];
    for (let e = 1; e <= 40; e++) {
      arr.push({
        epoch: e,
        melLoss: Number((2.6 * Math.exp(-0.042 * e) + 0.15).toFixed(3)),
        klLoss: Number((0.65 * Math.exp(-0.038 * e) + 0.04).toFixed(3))
      });
    }
    return arr;
  });

  // Step 4: Synthesis & Model Export State
  const [ttsPrompt, setTtsPrompt] = useState(
    'Hello! This voice was cloned from the selected speaker after automatic diarization, spectral denoising, and fine-tuning.'
  );
  const [temperature, setTemperature] = useState(0.65);
  const [speedRate, setSpeedRate] = useState(1.0);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedResult, setSynthesizedResult] = useState({
    generatedAt: 'Ready to audition',
    durationSec: 6.4,
    rtf: 0.14,
    similarityScore: 96.4
  });
  const [exportFormat, setExportFormat] = useState('pth');
  const [includeFaissIndex, setIncludeFaissIndex] = useState(true);
  const [quantization, setQuantization] = useState('fp16');
  const [exportedBundles, setExportedBundles] = useState([
    {
      id: 'exp_01',
      name: 'vox_speaker00_xtts_v2',
      speakerId: 'SPEAKER_00',
      architecture: 'Coqui XTTS-v2',
      format: 'pth',
      quantization: 'fp16',
      sizeMb: '142.6 MB',
      sha256: '8f94e2c1a04d73b8...4910e2b',
      timestamp: 'Today, 22:10'
    }
  ]);

  const audioCtxRef = useRef(null);
  const activeOscRef = useRef(null);
  const trainingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 3500);
  };

  const currentFile = useMemo(
    () => rawFiles.find((f) => f.id === selectedFileId) || rawFiles[0],
    [rawFiles, selectedFileId]
  );

  const currentSpeaker = useMemo(
    () =>
      currentFile.speakers.find((s) => s.id === selectedSpeakerId) ||
      currentFile.speakers[0],
    [currentFile, selectedSpeakerId]
  );

  // Sync model name when speaker or architecture changes
  useEffect(() => {
    if (currentSpeaker) {
      const cleanSpk = currentSpeaker.id.toLowerCase();
      setModelName(`vox_${cleanSpk}_${architecture}`);
    }
  }, [selectedSpeakerId, architecture, currentSpeaker]);

  // Filtered segments for the selected speaker
  const speakerSegments = useMemo(() => {
    return currentFile.segments.filter((seg) => seg.speakerId === currentSpeaker.id);
  }, [currentFile, currentSpeaker]);

  const activeSpeakerSegments = useMemo(() => {
    return speakerSegments.filter((seg) => {
      if (excludedSegments[seg.id]) return false;
      if (removeOverlaps && seg.overlapping) return false;
      return true;
    });
  }, [speakerSegments, excludedSegments, removeOverlaps]);

  const datasetStats = useMemo(() => {
    const totalCleanSec = activeSpeakerSegments.reduce(
      (acc, seg) => acc + (seg.end - seg.start),
      0
    );
    const avgSnr =
      activeSpeakerSegments.length > 0
        ? activeSpeakerSegments.reduce((acc, s) => acc + s.snr, 0) /
          activeSpeakerSegments.length
        : 0;
    const boostedSnr = avgSnr + (denoiseEnabled ? (denoiseStrength / 100) * 9.5 : 0) + (vocalIsolation ? 4.2 : 0);
    return {
      clipCount: activeSpeakerSegments.length,
      totalCleanSec: totalCleanSec.toFixed(1),
      effectiveSnr: boostedSnr.toFixed(1),
      qualityGrade:
        activeSpeakerSegments.length >= 3 && boostedSnr >= 32
          ? 'Studio Grade (A+)'
          : activeSpeakerSegments.length >= 2
          ? 'Good (B+)'
          : 'Low Data Warning'
    };
  }, [activeSpeakerSegments, denoiseEnabled, denoiseStrength, vocalIsolation]);

  // Stop any playing Web Audio synth
  const stopAudio = () => {
    if (activeOscRef.current) {
      try {
        activeOscRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      activeOscRef.current = null;
    }
    setPlayingId(null);
  };

  // Synthesize realistic vowel-formant speech contour in Web Audio API for auditioning speakers & TTS output
  const playVoiceSample = (id, baseFreq = 130, durationSec = 2.8, pitchShiftSemi = 0) => {
    if (playingId === id) {
      stopAudio();
      return;
    }
    stopAudio();
    if (isMuted) {
      showToast('Audio is currently muted. Unmute in the top bar to hear playback.', 'info');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const playDur = Math.min(Math.max(durationSec, 1.4), 4.0);
      const shiftedFreq = baseFreq * Math.pow(2, pitchShiftSemi / 12);

      // Fundamental glottal source (sawtooth + triangle)
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      osc.type = 'sawtooth';
      subOsc.type = 'triangle';

      // Create natural prosody cadence across syllables
      const steps = 14;
      for (let i = 0; i <= steps; i++) {
        const t = now + (i / steps) * playDur;
        const contour =
          shiftedFreq *
          (1 + 0.12 * Math.sin(i * 1.4) + 0.06 * Math.cos(i * 2.3) - (i / steps) * 0.08);
        osc.frequency.setValueAtTime(contour, t);
        subOsc.frequency.setValueAtTime(contour * 0.5, t);
      }

      // Formant filters (F1 & F2 vocal tract resonance)
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(520, now);
      f1.Q.setValueAtTime(5.5, now);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(1480, now);
      f2.Q.setValueAtTime(6.0, now);

      // Animate vowel formants
      for (let i = 0; i < 8; i++) {
        const t = now + (i / 8) * playDur;
        f1.frequency.linearRampToValueAtTime(420 + ((i * 137) % 340), t);
        f2.frequency.linearRampToValueAtTime(1150 + ((i * 293) % 950), t);
      }

      // Syllable amplitude envelope
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, now);
      const syllables = Math.floor(playDur * 3.8);
      for (let s = 0; s < syllables; s++) {
        const sStart = now + (s / syllables) * playDur;
        const sPeak = sStart + (0.35 / syllables) * playDur;
        const sEnd = sStart + (0.85 / syllables) * playDur;
        env.gain.linearRampToValueAtTime(0.24, sPeak);
        env.gain.linearRampToValueAtTime(0.03, sEnd);
      }
      env.gain.linearRampToValueAtTime(0.0001, now + playDur);

      osc.connect(f1);
      subOsc.connect(f1);
      osc.connect(f2);
      f1.connect(env);
      f2.connect(env);
      env.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + playDur);
      subOsc.stop(now + playDur);

      activeOscRef.current = osc;
      setPlayingId(id);

      osc.onended = () => {
        setPlayingId((current) => (current === id ? null : current));
      };
    } catch (err) {
      showToast('Browser audio playback initialized.', 'info');
    }
  };

  // Handle custom raw audio file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const newId = 'raw_custom_' + Date.now();
    const newFileObj = {
      id: newId,
      name: file.name,
      size: sizeMb,
      duration: 38.0,
      sampleRate: 44100,
      channels: 2,
      format: file.type || 'Audio Stream',
      noiseFloorDb: -36.8,
      description: 'Uploaded custom multi-speaker recording',
      speakers: [
        {
          id: 'SPEAKER_00',
          label: 'Speaker 00 (Primary Voice)',
          pitchHz: 132,
          formantShift: 1.05,
          genderHint: 'Detected Primary Speaker',
          color: '#6366f1',
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          confidence: 0.97,
          snrDb: 29.2
        },
        {
          id: 'SPEAKER_01',
          label: 'Speaker 01 (Secondary Voice)',
          pitchHz: 188,
          formantShift: 1.24,
          genderHint: 'Detected Secondary Speaker',
          color: '#10b981',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          confidence: 0.94,
          snrDb: 26.5
        }
      ],
      segments: [
        { id: `cseg_${Date.now()}_1`, speakerId: 'SPEAKER_00', start: 0.6, end: 7.4, overlapping: false, snr: 29.8, text: `Extracted opening utterance from ${file.name} with clear vocal fundamentals.` },
        { id: `cseg_${Date.now()}_2`, speakerId: 'SPEAKER_01', start: 7.9, end: 13.8, overlapping: false, snr: 26.9, text: 'Secondary speaker turn detected and separated via pyannote embedding clustering.' },
        { id: `cseg_${Date.now()}_3`, speakerId: 'SPEAKER_00', start: 14.2, end: 22.5, overlapping: false, snr: 30.1, text: 'Primary speaker continuation with balanced prosody and high signal-to-noise ratio.' },
        { id: `cseg_${Date.now()}_4`, speakerId: 'SPEAKER_01', start: 22.1, end: 25.4, overlapping: true, snr: 19.2, text: 'Brief overlapping cross-talk segment flagged for automatic removal.' },
        { id: `cseg_${Date.now()}_5`, speakerId: 'SPEAKER_00', start: 26.0, end: 37.2, overlapping: false, snr: 29.5, text: 'Final clean speaker segment ready for 24kHz LUFS normalization and model training.' }
      ]
    };

    setRawFiles((prev) => [newFileObj, ...prev]);
    setSelectedFileId(newId);
    setSelectedSpeakerId('SPEAKER_00');
    runDiarizationSimulation(file.name);
  };

  const runDiarizationSimulation = (filename = currentFile.name) => {
    setIsDiarizing(true);
    setDiarizationDone(false);
    setTimeout(() => {
      setIsDiarizing(false);
      setDiarizationDone(true);
      showToast(`Identified ${currentFile.speakers.length} distinct speakers in ${filename}`);
    }, 900);
  };

  const runPreprocessingPipeline = () => {
    setIsProcessingAudio(true);
    setTimeout(() => {
      setIsProcessingAudio(false);
      setAudioProcessed(true);
      showToast(
        `Processed ${activeSpeakerSegments.length} clean clips (${datasetStats.totalCleanSec}s) for ${currentSpeaker.id}`
      );
      setActiveStep(3);
    }, 800);
  };

  // Interactive training loop
  const startTrainingRun = () => {
    if (trainingTimerRef.current) {
      clearInterval(trainingTimerRef.current);
    }
    setIsTraining(true);
    setCurrentEpoch(0);
    setLossHistory([]);
    setTrainingLogs([
      `[INIT] Starting ${architecture.toUpperCase()} training for ${currentSpeaker.id} (${activeSpeakerSegments.length} clips, ${datasetStats.totalCleanSec}s)...`,
      `[CONFIG] batch_size=${batchSize}, lr=${learningRate}, f0_extractor=${pitchExtractor}, sr=${targetSampleRate}Hz`
    ]);

    let ep = 0;
    trainingTimerRef.current = setInterval(() => {
      ep += 2;
      if (ep >= totalEpochs) {
        ep = totalEpochs;
        clearInterval(trainingTimerRef.current);
        trainingTimerRef.current = null;
        setIsTraining(false);
        setTrainingLogs((prev) => [
          ...prev,
          `[EPOCH ${ep}/${totalEpochs}] mel_loss: 0.542 | kl_loss: 0.134 | Checkpoint saved -> ${modelName}.${exportFormat}`
        ]);
        showToast(`Speaker model "${modelName}" trained and ready for synthesis & export!`);
      } else {
        const mel = Number((2.5 * Math.exp(-0.045 * ep) + 0.18).toFixed(3));
        const kl = Number((0.62 * Math.exp(-0.04 * ep) + 0.05).toFixed(3));
        if (ep % 8 === 0) {
          setTrainingLogs((prev) => [
            ...prev,
            `[EPOCH ${ep}/${totalEpochs}] mel_loss: ${mel} | kl_loss: ${kl} | grad_norm: ${(0.7 - (ep / totalEpochs) * 0.4).toFixed(2)}`
          ]);
        }
      }

      setCurrentEpoch(ep);
      setLossHistory((prev) => [
        ...prev,
        {
          epoch: ep,
          melLoss: Number((2.5 * Math.exp(-0.045 * ep) + 0.18).toFixed(3)),
          klLoss: Number((0.62 * Math.exp(-0.04 * ep) + 0.05).toFixed(3))
        }
      ]);
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (trainingTimerRef.current) clearInterval(trainingTimerRef.current);
      stopAudio();
    };
  }, []);

  const handleSynthesizeSpeech = () => {
    if (!ttsPrompt.trim()) {
      showToast('Please enter a text prompt to synthesize.', 'error');
      return;
    }
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      const wordCount = ttsPrompt.trim().split(/\s+/).length;
      const estDur = Number(Math.max(1.8, (wordCount / 2.6) / speedRate).toFixed(1));
      setSynthesizedResult({
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationSec: estDur,
        rtf: 0.12,
        similarityScore: 97.1
      });
      playVoiceSample('tts_output', currentSpeaker.pitchHz, estDur, pitchSemitones);
      showToast(`Synthesized ${estDur}s of cloned speech using ${modelName}`);
    }, 550);
  };

  const handleExportModel = () => {
    const newExport = {
      id: 'exp_' + Date.now(),
      name: modelName || `vox_${currentSpeaker.id.toLowerCase()}`,
      speakerId: currentSpeaker.id,
      architecture:
        architecture === 'xtts_v2'
          ? 'Coqui XTTS-v2'
          : architecture === 'rvc_v2'
          ? 'RVC v2 (RMVPE)'
          : 'GPT-SoVITS v2',
      format: exportFormat,
      quantization: quantization,
      sizeMb:
        exportFormat === 'onnx'
          ? '94.2 MB'
          : exportFormat === 'safetensors'
          ? '128.4 MB'
          : '142.6 MB',
      sha256:
        Math.random().toString(16).substring(2, 10) +
        'c49b10e8...' +
        Math.random().toString(16).substring(2, 8),
      timestamp: 'Just now'
    };

    setExportedBundles((prev) => [newExport, ...prev]);

    // Trigger real browser file download of the speaker model manifest & configuration bundle
    const exportPayload = {
      model_name: newExport.name,
      speaker_id: currentSpeaker.id,
      speaker_label: currentSpeaker.label,
      architecture: architecture,
      quantization: quantization,
      export_format: exportFormat,
      include_faiss_index: includeFaissIndex,
      audio_preprocessing: {
        sample_rate: targetSampleRate,
        target_lufs: targetLufs,
        denoise_strength_pct: denoiseEnabled ? denoiseStrength : 0,
        htdemucs_vocal_isolation: vocalIsolation,
        remove_speaker_overlaps: removeOverlaps,
        curated_clips_count: activeSpeakerSegments.length,
        total_clean_duration_sec: Number(datasetStats.totalCleanSec)
      },
      training_summary: {
        epochs_completed: currentEpoch,
        batch_size: batchSize,
        learning_rate: learningRate,
        pitch_extractor: pitchExtractor,
        final_mel_loss: lossHistory[lossHistory.length - 1]?.melLoss || 0.584
      },
      artifacts: [
        `${newExport.name}.${exportFormat}`,
        ...(includeFaissIndex ? [`${newExport.name}_added.index`] : []),
        'speaker_config.json'
      ]
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${newExport.name}_export_manifest.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported & downloaded ${newExport.name} (${exportFormat.toUpperCase()})`);
  };

  const handleCopyCode = () => {
    const text = BACKEND_FILES[selectedCodeFile] || '';
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast(`Copied ${selectedCodeFile} to clipboard`);
    } catch (e) {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const steps = [
    { id: 1, title: '1. Raw Audio & Diarization', subtitle: 'Identify speakers from raw input', icon: Users },
    { id: 2, title: '2. Speaker Audio Prep', subtitle: 'Isolate, denoise & slice speaker', icon: Scissors },
    { id: 3, title: '3. Train Voice Model', subtitle: 'Fine-tune speaker checkpoint', icon: Cpu },
    { id: 4, title: '4. Synthesize & Export', subtitle: 'Test TTS & export weights', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl text-sm text-slate-100 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">VoxForge Studio</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  FastAPI + React Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Speaker Diarization • Speaker Isolation • Neural Voice Cloning & Model Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Active Target Speaker Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Target Speaker:</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSpeaker?.color || '#6366f1' }}
              />
              <span className="font-semibold text-slate-200">{currentSpeaker?.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-medium">{datasetStats.totalCleanSec}s clean</span>
            </div>

            <button
              onClick={() => {
                stopAudio();
                setIsMuted((m) => !m);
              }}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>FastAPI Backend Code</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 4-Stage Pipeline Stepper */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{step.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{step.subtitle}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* STEP 1: RAW AUDIO INPUT & SPEAKER IDENTIFICATION (DIARIZATION) */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Audio Source & Diarization Config */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Raw Input Audio Files</span>
                  </h2>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Audio</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rawFiles.map((file) => {
                    const selected = file.id === selectedFileId;
                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setSelectedFileId(file.id);
                          setSelectedSpeakerId(file.speakers[0].id);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          selected
                            ? 'bg-indigo-500/10 border-indigo-500/50'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileAudio className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-white truncate">
                              {file.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {file.duration}s • {file.size}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">{file.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {file.format}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {file.speakers.length} Speakers Detected
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diarization Engine Settings */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Speaker Diarization Engine</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Diarization Pipeline</label>
                    <select
                      value={diarizationModel}
                      onChange={(e) => setDiarizationModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="pyannote/speaker-diarization-3.1">
                        pyannote/speaker-diarization-3.1 (ECAPA-TDNN)
                      </option>
                      <option value="nvidia/sortformer-diarizer-v1">
                        NVIDIA NeMo Sortformer Diarizer
                      </option>
                      <option value="whisperx-pyannote-vad">
                        WhisperX + Pyannote Word-Level Alignment
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Min Speakers</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={minSpeakers}
                        onChange={(e) => setMinSpeakers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Max Speakers</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={maxSpeakers}
                        onChange={(e) => setMaxSpeakers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => runDiarizationSimulation(currentFile.name)}
                    disabled={isDiarizing}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isDiarizing ? 'animate-spin' : ''}`} />
                    <span>
                      {isDiarizing ? 'Clustering Speaker Embeddings...' : 'Re-Run Speaker Identification'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Speaker Timeline & Speaker Cards */}
            <div className="lg:col-span-8 space-y-5">
              {/* Multi-Track Diarization Timeline */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Multi-Speaker Diarization Timeline — <span className="text-indigo-400">{currentFile.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Click any speaker track or card below to select that voice for audio isolation and model cloning
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {currentFile.segments.length} Utterances • {currentFile.duration}s Total
                  </span>
                </div>

                {/* Timeline Tracks per Speaker */}
                <div className="space-y-3 bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
                  {currentFile.speakers.map((spk) => {
                    const isSelected = spk.id === selectedSpeakerId;
                    const spkSegs = currentFile.segments.filter((s) => s.speakerId === spk.id);
                    return (
                      <div
                        key={spk.id}
                        onClick={() => setSelectedSpeakerId(spk.id)}
                        className={`p-2.5 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-indigo-500/60'
                            : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: spk.color }}
                            />
                            <span className="font-semibold text-white">{spk.label}</span>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Selected Target
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {spkSegs.length} segments • F0 ~{spk.pitchHz} Hz
                          </span>
                        </div>

                        {/* Horizontal segment bar */}
                        <div className="relative h-7 bg-slate-900 rounded-md overflow-hidden border border-slate-800/80">
                          {spkSegs.map((seg) => {
                            const leftPct = (seg.start / currentFile.duration) * 100;
                            const widthPct = ((seg.end - seg.start) / currentFile.duration) * 100;
                            return (
                              <div
                                key={seg.id}
                                title={`${seg.start}s - ${seg.end}s: "${seg.text}"`}
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${Math.max(widthPct, 2)}%`,
                                  backgroundColor: seg.overlapping ? '#f43f5e' : spk.color
                                }}
                                className="absolute top-1 bottom-1 rounded opacity-85 hover:opacity-100 transition"
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
                    <span>0.0s</span>
                    <span>{(currentFile.duration * 0.25).toFixed(1)}s</span>
                    <span>{(currentFile.duration * 0.5).toFixed(1)}s</span>
                    <span>{(currentFile.duration * 0.75).toFixed(1)}s</span>
                    <span>{currentFile.duration.toFixed(1)}s</span>
                  </div>
                </div>
              </div>

              {/* Identified Speakers Selection Grid */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Choose Speaker to Process & Clone ({currentFile.speakers.length} Identified)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Audition each voice profile before isolating segments
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentFile.speakers.map((spk) => {
                    const isChosen = spk.id === selectedSpeakerId;
                    const segs = currentFile.segments.filter((s) => s.speakerId === spk.id);
                    const totalDur = segs.reduce((acc, s) => acc + (s.end - s.start), 0).toFixed(1);
                    const isPlayingThis = playingId === `spk_preview_${spk.id}`;

                    return (
                      <div
                        key={spk.id}
                        onClick={() => setSelectedSpeakerId(spk.id)}
                        className={`rounded-xl p-4 border transition flex flex-col justify-between cursor-pointer ${
                          isChosen
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${spk.badgeBg}`}
                            >
                              {spk.id}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {(spk.confidence * 100).toFixed(0)}% conf
                            </span>
                          </div>

                          <div>
                            <div className="text-sm font-bold text-white">{spk.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{spk.genderHint}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                              <div className="text-[10px] text-slate-400">Speaking Time</div>
                              <div className="font-semibold text-white">{totalDur}s ({segs.length} clips)</div>
                            </div>
                            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                              <div className="text-[10px] text-slate-400">Mean Pitch / SNR</div>
                              <div className="font-semibold text-white">{spk.pitchHz}Hz • {spk.snrDb}dB</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoiceSample(`spk_preview_${spk.id}`, spk.pitchHz, 2.5, 0);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition"
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="w-3.5 h-3.5 text-amber-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Audition</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSpeakerId(spk.id);
                              setActiveStep(2);
                            }}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                              isChosen
                                ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            <span>Select</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESS AUDIO FOR CHOSEN SPEAKER */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Audio Enhancement & Normalization Controls */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Speaker Audio Preprocessing</span>
                  </h2>
                  <span className="text-xs font-semibold text-indigo-300">{currentSpeaker.id}</span>
                </div>

                {/* Switch target speaker inline if needed */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Selected Target Speaker</label>
                  <select
                    value={selectedSpeakerId}
                    onChange={(e) => setSelectedSpeakerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {currentFile.speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.genderHint})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-3 pt-1 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-medium text-slate-200">HTDemucs Vocal Stem Isolation</div>
                      <div className="text-[11px] text-slate-400">Strip background music & room reverb</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vocalIsolation}
                      onChange={(e) => setVocalIsolation(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
                    <div>
                      <div className="font-medium text-slate-200">Reject Overlapping Cross-Talk</div>
                      <div className="text-[11px] text-slate-400">Drop segments where multiple speakers collide</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={removeOverlaps}
                      onChange={(e) => setRemoveOverlaps(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">Spectral Noise Gating</span>
                      <span className="text-indigo-400 font-semibold">{denoiseStrength}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={denoiseStrength}
                      onChange={(e) => {
                        setDenoiseStrength(Number(e.target.value));
                        setDenoiseEnabled(Number(e.target.value) > 0);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Sample Rate</label>
                      <select
                        value={targetSampleRate}
                        onChange={(e) => setTargetSampleRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                      >
                        <option value={24000}>24,000 Hz (XTTS-v2)</option>
                        <option value={40000}>40,000 Hz (RVC v2)</option>
                        <option value={44100}>44,100 Hz (SoVITS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Loudness Target</label>
                      <select
                        value={targetLufs}
                        onChange={(e) => setTargetLufs(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                      >
                        <option value={-16}>-16 LUFS (Broadcast)</option>
                        <option value={-18}>-18 LUFS (TTS Optimal)</option>
                        <option value={-23}>-23 LUFS (EBU R128)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">VAD Silence Trim Threshold</span>
                      <span className="text-emerald-400 font-semibold">{trimSilenceDb} dB</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={-20}
                      value={trimSilenceDb}
                      onChange={(e) => setTrimSilenceDb(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <button
                  onClick={runPreprocessingPipeline}
                  disabled={isProcessingAudio || activeSpeakerSegments.length === 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <Wand2 className={`w-4 h-4 ${isProcessingAudio ? 'animate-spin' : ''}`} />
                  <span>
                    {isProcessingAudio
                      ? 'Slicing & Normalizing Speaker Clips...'
                      : 'Process Speaker Dataset & Proceed to Training'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Curated Speaker Clips & Transcript Verification */}
            <div className="lg:col-span-8 space-y-5">
              {/* Dataset Readiness Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Curated Speaker Clips</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {datasetStats.clipCount} <span className="text-xs font-normal text-slate-400">/ {speakerSegments.length}</span>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Clean Speech Duration</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{datasetStats.totalCleanSec}s</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Post-Denoise SNR</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{datasetStats.effectiveSnr} dB</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Cloning Readiness</div>
                  <div className="text-sm font-bold text-amber-300 mt-2">{datasetStats.qualityGrade}</div>
                </div>
              </div>

              {/* Extracted Utterances List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Extracted Clips for {currentSpeaker.label}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Audition normalized slices, edit Whisper ASR transcripts, or exclude noisy segments before training
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    Format: {targetSampleRate / 1000}kHz Mono PCM • {targetLufs} LUFS
                  </span>
                </div>

                <div className="space-y-3">
                  {speakerSegments.map((seg, idx) => {
                    const isAutoDropped = removeOverlaps && seg.overlapping;
                    const isManuallyExcluded = !!excludedSegments[seg.id];
                    const isKept = !isAutoDropped && !isManuallyExcluded;
                    const transcriptText =
                      customTranscripts[seg.id] !== undefined ? customTranscripts[seg.id] : seg.text;
                    const isPlayingClip = playingId === `clip_${seg.id}`;

                    return (
                      <div
                        key={seg.id}
                        className={`p-3.5 rounded-xl border transition ${
                          isKept
                            ? 'bg-slate-950/80 border-slate-800'
                            : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isKept}
                              disabled={isAutoDropped}
                              onChange={() =>
                                setExcludedSegments((prev) => ({
                                  ...prev,
                                  [seg.id]: !prev[seg.id]
                                }))
                              }
                              className="w-4 h-4 accent-indigo-500 rounded"
                            />
                            <span className="text-xs font-mono font-semibold text-indigo-300">
                              {currentSpeaker.id}_000{idx + 1}.wav
                            </span>
                            <span className="text-xs text-slate-400">
                              {seg.start.toFixed(1)}s – {seg.end.toFixed(1)}s ({(seg.end - seg.start).toFixed(1)}s)
                            </span>
                            {seg.overlapping && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Overlap {removeOverlaps ? '(Filtered Out)' : '(Warning)'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-400 font-mono">
                              SNR {(seg.snr + (denoiseEnabled ? 6.5 : 0)).toFixed(1)} dB
                            </span>
                            <button
                              onClick={() =>
                                playVoiceSample(
                                  `clip_${seg.id}`,
                                  currentSpeaker.pitchHz,
                                  seg.end - seg.start,
                                  0
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 transition"
                            >
                              {isPlayingClip ? (
                                <>
                                  <Pause className="w-3 h-3 text-amber-400" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-indigo-400" />
                                  <span>Play Slice</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={transcriptText}
                          onChange={(e) =>
                            setCustomTranscripts((prev) => ({
                              ...prev,
                              [seg.id]: e.target.value
                            }))
                          }
                          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TRAIN SPEAKER VOICE CLONING MODEL */}
        {activeStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Model Architecture & Hyperparameters */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Voice Model Training Setup</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Model Checkpoint Identifier</label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Cloning Architecture</label>
                    <select
                      value={architecture}
                      onChange={(e) => setArchitecture(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    >
                      <option value="xtts_v2">Coqui XTTS-v2 (GPT + HiFi-GAN Latents)</option>
                      <option value="rvc_v2">RVC v2 (Retrieval-Based Voice Conversion)</option>
                      <option value="gpt_sovits">GPT-SoVITS v2 (Few-Shot Prosody & Timbre)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Training Epochs</label>
                      <input
                        type="number"
                        min={10}
                        max={200}
                        step={10}
                        value={totalEpochs}
                        onChange={(e) => setTotalEpochs(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Batch Size</label>
                      <select
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      >
                        <option value={4}>4 (8 GB VRAM)</option>
                        <option value={8}>8 (12 GB VRAM)</option>
                        <option value={16}>16 (24 GB VRAM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Learning Rate</label>
                      <select
                        value={learningRate}
                        onChange={(e) => setLearningRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      >
                        <option value="1e-5">1e-5 (Fast Adapt)</option>
                        <option value="5e-6">5e-6 (Recommended)</option>
                        <option value="2e-6">2e-6 (Conservative)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">F0 Pitch Extractor</label>
                      <select
                        value={pitchExtractor}
                        onChange={(e) => setPitchExtractor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                      >
                        <option value="rmvpe">RMVPE (Noise Robust)</option>
                        <option value="crepe">TorchCREPE (Full)</option>
                        <option value="harvest">Harvest + DIO</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={startTrainingRun}
                      disabled={isTraining}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
                      <span>
                        {isTraining
                          ? `Training Epoch ${currentEpoch}/${totalEpochs}...`
                          : 'Start Fine-Tuning Speaker Model'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveStep(4)}
                      className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Proceed to Voice Synthesis & Export</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Training Telemetry, Loss Curve & Console Logs */}
            <div className="lg:col-span-8 space-y-5">
              {/* Progress & Loss Metrics */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Speaker Model Convergence — <span className="text-indigo-400 font-mono">{modelName}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Training on {datasetStats.clipCount} curated clips from {currentSpeaker.label}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Epoch {currentEpoch} / {totalEpochs} ({Math.round((currentEpoch / totalEpochs) * 100)}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, (currentEpoch / totalEpochs) * 100)}%` }}
                  />
                </div>

                {/* Interactive SVG Loss Chart */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        Mel-Spectrogram Loss:{' '}
                        {lossHistory[lossHistory.length - 1]?.melLoss ?? '0.584'}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        KL Divergence Loss:{' '}
                        {lossHistory[lossHistory.length - 1]?.klLoss ?? '0.142'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Cosine Speaker Similarity: 96.8%</span>
                  </div>

                  <svg viewBox="0 0 600 170" className="w-full h-44 overflow-visible">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
                      <line
                        key={i}
                        x1={0}
                        y1={g * 150}
                        x2={600}
                        y2={g * 150}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {/* Mel Loss Polyline */}
                    {lossHistory.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2.5"
                        points={lossHistory
                          .map((pt, idx) => {
                            const x = (idx / Math.max(1, lossHistory.length - 1)) * 590;
                            const y = 150 - Math.min(145, (pt.melLoss / 2.8) * 145);
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}
                    {/* KL Loss Polyline */}
                    {lossHistory.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2.5"
                        points={lossHistory
                          .map((pt, idx) => {
                            const x = (idx / Math.max(1, lossHistory.length - 1)) * 590;
                            const y = 150 - Math.min(145, (pt.klLoss / 1.2) * 145);
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Training Logs Terminal */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>PyTorch Trainer Worker Logs</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400">CUDA FP16 Mixed Precision</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 space-y-1.5 max-h-44 overflow-y-auto">
                  {trainingLogs.map((line, i) => (
                    <div key={i} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SYNTHESIZE SPEECH & SAVE / EXPORT MODEL */}
        {activeStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Cloned Voice Synthesis Playground */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Test Cloned Speaker Model</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Synthesize new speech with <span className="text-indigo-300 font-mono">{modelName}</span> ({currentSpeaker.label})
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Similarity: {synthesizedResult.similarityScore}%
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Input Text Prompt for Synthesis</label>
                  <textarea
                    rows={3}
                    value={ttsPrompt}
                    onChange={(e) => setTtsPrompt(e.target.value)}
                    placeholder="Type any sentence to synthesize in the cloned speaker's voice..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Temp</span>
                      <span className="text-indigo-300 font-mono">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Speed</span>
                      <span className="text-indigo-300 font-mono">{speedRate}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.4}
                      step={0.05}
                      value={speedRate}
                      onChange={(e) => setSpeedRate(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Pitch Shift</span>
                      <span className="text-indigo-300 font-mono">{pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} st</span>
                    </div>
                    <input
                      type="range"
                      min={-6}
                      max={6}
                      step={1}
                      value={pitchSemitones}
                      onChange={(e) => setPitchSemitones(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSynthesizeSpeech}
                    disabled={isSynthesizing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                  >
                    <Wand2 className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>{isSynthesizing ? 'Synthesizing Audio...' : 'Synthesize & Play Cloned Speech'}</span>
                  </button>

                  {playingId === 'tts_output' && (
                    <button
                      onClick={stopAudio}
                      className="py-2.5 px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>

                {/* Output Waveform Preview Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        playVoiceSample(
                          'tts_output',
                          currentSpeaker.pitchHz,
                          synthesizedResult.durationSec,
                          pitchSemitones
                        )
                      }
                      className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 hover:bg-indigo-500/30 transition"
                    >
                      {playingId === 'tts_output' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        cloned_{currentSpeaker.id.toLowerCase()}_output.wav
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Duration: {synthesizedResult.durationSec}s • RTF: {synthesizedResult.rtf}x • {targetSampleRate / 1000}kHz
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">{synthesizedResult.generatedAt}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Save & Export Trained Speaker Model */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Archive className="w-4 h-4 text-emerald-400" />
                      <span>Save & Export Trained Speaker Model</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Package model checkpoint, speaker conditioning latents, and index files
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Serialization Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    >
                      <option value="pth">PyTorch Checkpoint (.pth + config.json)</option>
                      <option value="safetensors">HuggingFace SafeTensors (.safetensors)</option>
                      <option value="onnx">ONNX Runtime Graph (.onnx)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Weight Quantization</label>
                    <select
                      value={quantization}
                      onChange={(e) => setQuantization(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    >
                      <option value="fp16">FP16 Half Precision (Recommended)</option>
                      <option value="fp32">FP32 Full Precision</option>
                      <option value="int8">INT8 Dynamic Quantization (Edge/CPU)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs cursor-pointer">
                  <div>
                    <div className="font-medium text-slate-200">Bundle Faiss Speaker Retrieval Index (.index)</div>
                    <div className="text-[11px] text-slate-400">
                      Includes speaker timbre embedding index & speaker_config.json
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeFaissIndex}
                    onChange={(e) => setIncludeFaissIndex(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <button
                  onClick={handleExportModel}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Save & Export Model Package ({exportFormat.toUpperCase()})</span>
                </button>

                {/* Exported Models Registry */}
                <div className="pt-2 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-300">Exported Speaker Models</div>
                  {exportedBundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-mono font-semibold text-white flex items-center gap-2">
                          <span>{bundle.name}.{bundle.format}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {bundle.quantization.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {bundle.architecture} • Speaker: {bundle.speakerId} • {bundle.sizeMb} • SHA256: {bundle.sha256}
                        </div>
                      </div>
                      <button
                        onClick={handleExportModel}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FastAPI Backend Source Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  Full-Stack FastAPI Backend Reference Code
                </span>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                {Object.keys(BACKEND_FILES).map((fileKey) => (
                  <button
                    key={fileKey}
                    onClick={() => setSelectedCodeFile(fileKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      selectedCodeFile === fileKey
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fileKey}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            <pre className="p-5 text-xs font-mono text-slate-200 overflow-auto flex-1 bg-slate-950 leading-relaxed">
              <code>{BACKEND_FILES[selectedCodeFile]}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

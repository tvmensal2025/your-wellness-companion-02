#!/bin/bash
# 🦾 Script para atualizar YOLO com endpoints de Pose na VPS
# Execute: ssh root@45.67.221.216 'bash -s' < update-yolo-pose.sh

echo "🦾 Atualizando YOLO Service com Pose Estimation"
echo "================================================"

# Parar container atual
echo "⏹️ Parando container..."
docker stop yolo11-service 2>/dev/null || true

# Backup do main.py atual
echo "📦 Fazendo backup..."
docker cp yolo11-service:/app/main.py /tmp/main.py.backup 2>/dev/null || true

# Criar novo main.py com endpoints de pose
echo "📝 Criando novo main.py..."
cat > /tmp/main_updated.py << 'ENDOFFILE'
#!/usr/bin/env python3
"""
🦾 Serviço YOLO para Detecção de Alimentos e Pose Estimation
Versão 2.2 - Janeiro 2026
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import numpy as np
from PIL import Image
import io
import base64
import logging
import time
import os
import math
import requests
from contextlib import asynccontextmanager
from collections import deque

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

YOLO_MODEL = os.getenv('YOLO_MODEL', 'yolo11s-seg.pt')
YOLO_POSE_MODEL = os.getenv('YOLO_POSE_MODEL', 'yolo11n-pose.pt')
YOLO_CONF = float(os.getenv('YOLO_CONF', '0.35'))

model = None
model_pose = None
pose_session_states: Dict[str, Any] = {}

POSE_KEYPOINTS = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
]

EXERCISE_THRESHOLDS = {
    'squat': {'rep_down_angle': 100, 'rep_up_angle': 160, 'safe_zone': 15, 'debounce_ms': 500},
    'pushup': {'rep_down_angle': 90, 'rep_up_angle': 160, 'safe_zone': 15, 'debounce_ms': 500},
    'situp': {'rep_down_angle': 30, 'rep_up_angle': 80, 'safe_zone': 10, 'debounce_ms': 600},
    'plank': {'rep_down_angle': 160, 'rep_up_angle': 180, 'safe_zone': 10, 'debounce_ms': 1000},
    'lunge': {'rep_down_angle': 90, 'rep_up_angle': 160, 'safe_zone': 15, 'debounce_ms': 600},
    'jumping_jack': {'rep_down_angle': 30, 'rep_up_angle': 150, 'safe_zone': 20, 'debounce_ms': 300}
}

FOOD_CLASS_IDS = {
    46: 'banana', 47: 'apple', 48: 'sandwich', 49: 'orange', 50: 'broccoli',
    51: 'carrot', 52: 'hot dog', 53: 'pizza', 54: 'donut', 55: 'cake'
}

FOOD_TRANSLATIONS = {
    'banana': 'banana', 'apple': 'maçã', 'sandwich': 'sanduíche',
    'orange': 'laranja', 'broccoli': 'brócolis', 'carrot': 'cenoura',
    'hot dog': 'cachorro-quente', 'pizza': 'pizza', 'donut': 'rosquinha', 'cake': 'bolo'
}


class PoseSessionState:
    def __init__(self, exercise_type: str, calibration: dict = None):
        self.exercise_type = exercise_type
        self.calibration = calibration or {}
        self.rep_count = 0
        self.partial_reps = 0
        self.current_phase = 'up'
        self.last_rep_time = 0
        self.angle_history = deque(maxlen=10)
        self.valley_angle = 180
        self.peak_angle = 0
        
    def get_smoothed_angle(self, new_angle: float) -> float:
        self.angle_history.append(new_angle)
        if len(self.angle_history) < 2:
            return new_angle
        alpha = 0.3
        smoothed = self.angle_history[-1]
        for angle in reversed(list(self.angle_history)[:-1]):
            smoothed = alpha * smoothed + (1 - alpha) * angle
        return smoothed


def calculate_angle(p1, p2, p3):
    v1 = (p1[0] - p2[0], p1[1] - p2[1])
    v2 = (p3[0] - p2[0], p3[1] - p2[1])
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
    if mag1 * mag2 == 0:
        return 180.0
    cos_angle = max(-1, min(1, dot / (mag1 * mag2)))
    return math.acos(cos_angle) * 180 / math.pi


def load_models():
    global model, model_pose
    try:
        from ultralytics import YOLO
        
        logger.info(f"🔄 Carregando YOLO11: {YOLO_MODEL}")
        model = YOLO(YOLO_MODEL)
        dummy = np.zeros((640, 640, 3), dtype=np.uint8)
        model(dummy, verbose=False)
        logger.info("✅ YOLO11 carregado!")
        
        try:
            logger.info(f"🔄 Carregando YOLO-Pose: {YOLO_POSE_MODEL}")
            model_pose = YOLO(YOLO_POSE_MODEL)
            model_pose(dummy, verbose=False)
            logger.info("✅ YOLO-Pose carregado!")
        except Exception as e:
            logger.warning(f"⚠️ YOLO-Pose erro: {e}")
            model_pose = None
            
    except Exception as e:
        logger.error(f"❌ Erro: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield


app = FastAPI(title="YOLO Service", version="2.2.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def decode_base64_image(base64_str: str):
    try:
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        return Image.open(io.BytesIO(base64.b64decode(base64_str))).convert('RGB')
    except:
        return None


def download_image(url: str):
    try:
        response = requests.get(url, timeout=15)
        return Image.open(io.BytesIO(response.content)).convert('RGB')
    except:
        return None


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    return {"service": "YOLO Service", "version": "2.2.0", "status": "running"}


@app.get("/health")
async def health():
    return {
        "status": "healthy" if model else "degraded",
        "model_loaded": model is not None,
        "pose_model_loaded": model_pose is not None,
        "version": "2.2.0"
    }


@app.get("/pose/health")
async def pose_health():
    return {
        "status": "healthy" if model_pose else "degraded",
        "pose_model_loaded": model_pose is not None,
        "pose_model_name": YOLO_POSE_MODEL,
        "active_sessions": len(pose_session_states),
        "supported_exercises": list(EXERCISE_THRESHOLDS.keys())
    }


class DetectionRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    confidence: float = 0.35


@app.post("/detect")
async def detect(request: DetectionRequest):
    image = None
    if request.image_url:
        image = download_image(request.image_url)
    elif request.image_base64:
        image = decode_base64_image(request.image_base64)
    
    if not image:
        raise HTTPException(400, "Imagem não fornecida")
    
    start = time.time()
    results = model(image, conf=request.confidence, verbose=False)
    
    objects = []
    for result in results:
        if result.boxes:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                name = result.names.get(cls_id, f"class_{cls_id}")
                objects.append({
                    "class_name": name,
                    "class_name_pt": FOOD_TRANSLATIONS.get(name, name),
                    "confidence": round(conf, 4),
                    "bbox": [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                    "is_food": cls_id in FOOD_CLASS_IDS
                })
    
    return {
        "success": True,
        "objects": objects,
        "food_objects": [o for o in objects if o["is_food"]],
        "inference_time_ms": round((time.time() - start) * 1000, 2)
    }


class PoseRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    session_id: str
    exercise: str = 'squat'
    calibration: Optional[dict] = None


@app.post("/pose/analyze")
async def analyze_pose(request: PoseRequest):
    if not model_pose:
        raise HTTPException(503, "YOLO-Pose não disponível")
    
    image = None
    if request.image_base64:
        image = decode_base64_image(request.image_base64)
    elif request.image_url:
        image = download_image(request.image_url)
    
    if not image:
        raise HTTPException(400, "Imagem não fornecida")
    
    start = time.time()
    results = model_pose(image, verbose=False)
    
    keypoints = []
    confidence = 0.0
    
    for result in results:
        if result.keypoints and len(result.keypoints) > 0:
            kps = result.keypoints[0]
            if hasattr(kps, 'xy') and kps.xy is not None:
                xy = kps.xy[0].cpu().numpy()
                conf = kps.conf[0].cpu().numpy() if kps.conf is not None else np.ones(17) * 0.5
                
                for i, (name, c) in enumerate(zip(POSE_KEYPOINTS, conf)):
                    x, y = xy[i] if i < len(xy) else (0, 0)
                    keypoints.append({
                        'id': name, 'name': name,
                        'x': float(x) / image.width,
                        'y': float(y) / image.height,
                        'confidence': float(c)
                    })
                confidence = float(np.mean(conf))
    
    # Gerenciar sessão
    if request.session_id not in pose_session_states:
        pose_session_states[request.session_id] = PoseSessionState(request.exercise, request.calibration)
    
    state = pose_session_states[request.session_id]
    thresholds = EXERCISE_THRESHOLDS.get(request.exercise, EXERCISE_THRESHOLDS['squat'])
    
    # Calcular ângulos e reps
    angles = {}
    is_valid_rep = False
    kp_dict = {k['id']: k for k in keypoints}
    
    if request.exercise in ['squat', 'lunge']:
        hip = kp_dict.get('left_hip')
        knee = kp_dict.get('left_knee')
        ankle = kp_dict.get('left_ankle')
        
        if hip and knee and ankle and all(k['confidence'] > 0.4 for k in [hip, knee, ankle]):
            raw_angle = calculate_angle((hip['x'], hip['y']), (knee['x'], knee['y']), (ankle['x'], ankle['y']))
            smoothed = state.get_smoothed_angle(raw_angle)
            angles['knee'] = round(smoothed, 1)
            
            down_th = thresholds['rep_down_angle']
            up_th = thresholds['rep_up_angle']
            debounce = thresholds['debounce_ms']
            
            if smoothed < state.valley_angle:
                state.valley_angle = smoothed
            if smoothed > state.peak_angle:
                state.peak_angle = smoothed
            
            now = time.time() * 1000
            
            if state.current_phase == 'up' and smoothed < down_th:
                state.current_phase = 'down'
            elif state.current_phase == 'down' and smoothed > up_th:
                if now - state.last_rep_time > debounce:
                    state.rep_count += 1
                    state.last_rep_time = now
                    is_valid_rep = True
                state.current_phase = 'up'
                state.valley_angle = 180
                state.peak_angle = 0
    
    return {
        "success": True,
        "keypoints": keypoints,
        "rep_count": state.rep_count,
        "partial_reps": state.partial_reps,
        "current_phase": state.current_phase,
        "phase_progress": 50.0,
        "form_hints": [],
        "confidence": confidence,
        "warnings": [],
        "inference_time_ms": round((time.time() - start) * 1000, 2),
        "angles": angles,
        "is_valid_rep": is_valid_rep,
        "is_full_body": len([k for k in keypoints if k['confidence'] > 0.5]) >= 12
    }


@app.delete("/pose/session/{session_id}")
async def end_session(session_id: str):
    if session_id in pose_session_states:
        state = pose_session_states.pop(session_id)
        return {"success": True, "rep_count": state.rep_count}
    return {"success": False, "message": "Sessão não encontrada"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
ENDOFFILE

# Copiar para container
echo "📤 Copiando para container..."
docker cp /tmp/main_updated.py yolo11-service:/app/main.py

# Reiniciar container
echo "🔄 Reiniciando container..."
docker restart yolo11-service

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 10

# Testar endpoints
echo "🧪 Testando endpoints..."
curl -s http://localhost:8002/health
echo ""
curl -s http://localhost:8002/pose/health
echo ""

echo "✅ Atualização concluída!"

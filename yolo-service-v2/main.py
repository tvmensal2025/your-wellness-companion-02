#!/usr/bin/env python3
"""
🦾 Serviço YOLO para Detecção de Alimentos e Documentos
Versão 2.2 - Janeiro 2026
Suporta: YOLO11, YOLOE (vocabulário aberto), YOLOv8
Integração com Sofia IA e Dr. Vital
GitHub: https://github.com/ultralytics/ultralytics
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import cv2
import numpy as np
import requests
from PIL import Image
import io
import base64
import logging
import time
import os
import math
from contextlib import asynccontextmanager
from collections import deque

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configurações via variáveis de ambiente
YOLO_MODEL = os.getenv('YOLO_MODEL', 'yolo11s-seg.pt')  # Modelo padrão para alimentos
YOLOE_MODEL = os.getenv('YOLOE_MODEL', 'yoloe-11s-seg.pt')  # Modelo YOLOE para documentos
YOLO_CONF = float(os.getenv('YOLO_CONF', '0.35'))
YOLO_TASK = os.getenv('YOLO_TASK', 'detect')
YOLO_POSE_MODEL = os.getenv('YOLO_POSE_MODEL', 'yolo11n-pose.pt')  # Modelo para pose estimation

# Modelos globais
model = None
model_yoloe = None
model_pose = None

# Estado das sessões de pose (para contagem contínua)
pose_session_states: Dict[str, Any] = {}

# Classes COCO para alimentos (índices relevantes)
FOOD_CLASS_IDS = {
    39: 'bottle', 40: 'wine glass', 41: 'cup', 42: 'fork', 43: 'knife',
    44: 'spoon', 45: 'bowl', 46: 'banana', 47: 'apple', 48: 'sandwich',
    49: 'orange', 50: 'broccoli', 51: 'carrot', 52: 'hot dog', 53: 'pizza',
    54: 'donut', 55: 'cake'
}

# Mapeamento para português
FOOD_TRANSLATIONS = {
    'bottle': 'garrafa', 'wine glass': 'taça de vinho', 'cup': 'copo/xícara',
    'fork': 'garfo', 'knife': 'faca', 'spoon': 'colher', 'bowl': 'tigela',
    'banana': 'banana', 'apple': 'maçã', 'sandwich': 'sanduíche',
    'orange': 'laranja', 'broccoli': 'brócolis', 'carrot': 'cenoura',
    'hot dog': 'cachorro-quente', 'pizza': 'pizza', 'donut': 'rosquinha',
    'cake': 'bolo'
}

# COCO Pose Keypoints (17 pontos)
POSE_KEYPOINTS = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
]

# Thresholds padrão para exercícios
EXERCISE_THRESHOLDS = {
    'squat': {
        'rep_down_angle': 100,  # Joelho a ~100° = agachamento
        'rep_up_angle': 160,    # Joelho a ~160° = em pé
        'safe_zone': 15,        # Tolerância em graus
        'debounce_ms': 500      # 0.5s entre reps
    },
    'pushup': {
        'rep_down_angle': 90,
        'rep_up_angle': 160,
        'safe_zone': 15,
        'debounce_ms': 500
    },
    'situp': {
        'rep_down_angle': 30,
        'rep_up_angle': 80,
        'safe_zone': 10,
        'debounce_ms': 600
    }
}


def load_yolo_model():
    """Carrega os modelos YOLO11, YOLOE e YOLO-Pose"""
    global model, model_yoloe, model_pose
    try:
        from ultralytics import YOLO
        
        # Carregar modelo YOLO11 para alimentos
        model_path = YOLO_MODEL
        logger.info(f"🔄 Carregando modelo YOLO11: {model_path}")
        model = YOLO(model_path)
        
        # Warmup YOLO11
        logger.info("🔥 Fazendo warmup do YOLO11...")
        dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
        model(dummy_img, verbose=False)
        logger.info(f"✅ YOLO11 {model_path} carregado!")
        
        # Carregar modelo YOLO-Pose para pose estimation
        try:
            pose_path = YOLO_POSE_MODEL
            logger.info(f"🔄 Carregando modelo YOLO-Pose: {pose_path}")
            model_pose = YOLO(pose_path)
            # Warmup YOLO-Pose
            logger.info("🔥 Fazendo warmup do YOLO-Pose...")
            model_pose(dummy_img, verbose=False)
            logger.info(f"✅ YOLO-Pose {pose_path} carregado!")
        except Exception as e:
            logger.warning(f"⚠️ YOLO-Pose erro: {e}")
            model_pose = None
        
        # Carregar modelo YOLOE para documentos (vocabulário aberto)
        try:
            from ultralytics import YOLOE
            yoloe_path = YOLOE_MODEL
            if os.path.exists(yoloe_path):
                logger.info(f"🔄 Carregando modelo YOLOE: {yoloe_path}")
                model_yoloe = YOLOE(yoloe_path)
                # Warmup YOLOE
                logger.info("🔥 Fazendo warmup do YOLOE...")
                model_yoloe.predict(dummy_img, prompts=["test"], verbose=False)
                logger.info(f"✅ YOLOE {yoloe_path} carregado!")
            else:
                logger.warning(f"⚠️ Modelo YOLOE não encontrado: {yoloe_path}")
                model_yoloe = None
        except ImportError:
            logger.warning("⚠️ YOLOE não disponível - atualize ultralytics: pip install -U ultralytics")
            model_yoloe = None
        except Exception as e:
            logger.warning(f"⚠️ YOLOE erro: {e}")
            model_yoloe = None
        
        return model
        
    except Exception as e:
        logger.error(f"❌ Erro ao carregar modelos: {e}")
        return None


class PoseSessionState:
    """Estado de uma sessão de treino com câmera"""
    def __init__(self, exercise_type: str, calibration: dict = None):
        self.exercise_type = exercise_type
        self.calibration = calibration or {}
        self.rep_count = 0
        self.partial_reps = 0
        self.current_phase = 'up'  # 'up', 'down', 'transition'
        self.last_rep_time = 0
        self.angle_history = deque(maxlen=10)  # Smoothing
        self.keypoint_history = deque(maxlen=5)
        self.form_issues = []
        self.valley_angle = 180  # Ângulo mínimo atingido
        self.peak_angle = 0      # Ângulo máximo atingido
        self.phase_start_time = time.time()
        
    def get_smoothed_angle(self, new_angle: float) -> float:
        """Exponential moving average para suavizar ângulos"""
        self.angle_history.append(new_angle)
        if len(self.angle_history) < 2:
            return new_angle
        alpha = 0.3  # Fator de suavização
        smoothed = self.angle_history[-1]
        for angle in reversed(list(self.angle_history)[:-1]):
            smoothed = alpha * smoothed + (1 - alpha) * angle
        return smoothed
    
    def reset_phase_tracking(self):
        """Reseta tracking de fase após uma rep"""
        self.valley_angle = 180
        self.peak_angle = 0
        self.phase_start_time = time.time()


def calculate_angle(p1: tuple, p2: tuple, p3: tuple) -> float:
    """Calcula ângulo entre 3 pontos (p2 é o vértice)"""
    v1 = (p1[0] - p2[0], p1[1] - p2[1])
    v2 = (p3[0] - p2[0], p3[1] - p2[1])
    
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
    
    if mag1 * mag2 == 0:
        return 180.0
    
    cos_angle = dot / (mag1 * mag2)
    cos_angle = max(-1, min(1, cos_angle))  # Clamp
    angle = math.acos(cos_angle) * 180 / math.pi
    return angle


def detect_pose(image: Image.Image) -> dict:
    """Detecta pose na imagem usando YOLO-Pose"""
    global model_pose
    
    if model_pose is None:
        return {'error': 'Modelo YOLO-Pose não carregado'}
    
    start_time = time.time()
    
    try:
        results = model_pose(image, verbose=False)
        
        keypoints_list = []
        confidence = 0.0
        bbox = None
        
        for result in results:
            if result.keypoints is not None and len(result.keypoints) > 0:
                kps = result.keypoints[0]  # Primeira pessoa detectada
                
                # Extrair keypoints
                if hasattr(kps, 'xy') and kps.xy is not None:
                    xy = kps.xy[0].cpu().numpy()  # Shape: (17, 2)
                    conf = kps.conf[0].cpu().numpy() if kps.conf is not None else np.ones(17) * 0.5
                    
                    for i, (name, c) in enumerate(zip(POSE_KEYPOINTS, conf)):
                        x, y = xy[i] if i < len(xy) else (0, 0)
                        keypoints_list.append({
                            'id': name,
                            'name': name,
                            'x': float(x) / image.width if image.width > 0 else 0,  # Normalizado
                            'y': float(y) / image.height if image.height > 0 else 0,
                            'confidence': float(c)
                        })
                    
                    confidence = float(np.mean(conf))
                
                # Bounding box
                if result.boxes is not None and len(result.boxes) > 0:
                    box = result.boxes[0]
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    bbox = {
                        'x': float(x1) / image.width,
                        'y': float(y1) / image.height,
                        'width': float(x2 - x1) / image.width,
                        'height': float(y2 - y1) / image.height
                    }
        
        inference_time = (time.time() - start_time) * 1000
        
        # Verificar se é corpo completo (pelo menos 12 keypoints com confiança > 0.5)
        high_conf_count = len([k for k in keypoints_list if k['confidence'] > 0.5])
        
        return {
            'keypoints': keypoints_list,
            'confidence': confidence,
            'inference_time_ms': inference_time,
            'bbox': bbox,
            'is_full_body': high_conf_count >= 12
        }
        
    except Exception as e:
        logger.error(f"❌ Erro na detecção de pose: {e}")
        return {'error': str(e)}


def analyze_squat_form(keypoints: List[dict], angle: float, thresholds: dict) -> List[dict]:
    """Analisa a forma do agachamento e retorna dicas gentis"""
    hints = []
    
    # Encontrar keypoints relevantes
    kp_dict = {k['id']: k for k in keypoints}
    
    left_knee = kp_dict.get('left_knee')
    left_ankle = kp_dict.get('left_ankle')
    left_shoulder = kp_dict.get('left_shoulder')
    left_hip = kp_dict.get('left_hip')
    
    # Verificar joelhos passando dos pés
    if left_knee and left_ankle:
        if left_knee['confidence'] > 0.5 and left_ankle['confidence'] > 0.5:
            if left_knee['x'] > left_ankle['x'] + 0.08:  # Tolerância de 8%
                hints.append({
                    'type': 'knee_over_toes',
                    'message': 'Ótimo ritmo! Tente manter os joelhos alinhados com os pés 👍',
                    'priority': 2
                })
    
    # Verificar profundidade
    down_threshold = thresholds.get('rep_down_angle', 100)
    if angle > down_threshold + 20:  # Muito raso
        hints.append({
            'type': 'depth_insufficient',
            'message': 'Você está indo bem! Tente descer um pouquinho mais quando se sentir confortável 💪',
            'priority': 1
        })
    
    # Verificar costas retas
    if left_shoulder and left_hip:
        if left_shoulder['confidence'] > 0.5 and left_hip['confidence'] > 0.5:
            # Calcular inclinação do tronco
            trunk_angle = math.atan2(
                left_shoulder['y'] - left_hip['y'],
                left_shoulder['x'] - left_hip['x']
            ) * 180 / math.pi
            
            if abs(trunk_angle + 90) > 40:  # Muito inclinado
                hints.append({
                    'type': 'back_rounding',
                    'message': 'Bom trabalho! Mantenha o peito erguido e olhe para frente 🎯',
                    'priority': 2
                })
    
    return hints


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle do FastAPI - carrega modelo na inicialização"""
    logger.info("🚀 Iniciando serviço YOLO...")
    load_yolo_model()
    yield
    logger.info("👋 Encerrando serviço YOLO...")


# Criar app FastAPI
app = FastAPI(
    title="YOLO Detection Service",
    description="Serviço de detecção usando YOLO11 (alimentos) e YOLOE (documentos)",
    version="2.2.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelos Pydantic
class DetectionRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    confidence: float = 0.35
    task: str = "detect"  # detect, food_only, segment
    max_detections: int = 100


class DetectionResult(BaseModel):
    class_name: str
    class_name_pt: str
    confidence: float
    bbox: List[float]
    is_food: bool
    area: float


class DetectionResponse(BaseModel):
    success: bool
    objects: List[DetectionResult]
    food_objects: List[DetectionResult]
    total_objects: int
    total_food: int
    inference_time_ms: float
    model_version: str
    message: str = ""


def download_image(url: str) -> Optional[Image.Image]:
    """Baixa imagem da URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; YOLOService/2.0)'
        }
        response = requests.get(url, timeout=15, headers=headers)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert('RGB')
    except Exception as e:
        logger.error(f"❌ Erro ao baixar imagem: {e}")
        return None


def decode_base64_image(base64_str: str) -> Optional[Image.Image]:
    """Decodifica imagem base64"""
    try:
        # Remover prefixo data:image se existir
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        
        image_data = base64.b64decode(base64_str)
        return Image.open(io.BytesIO(image_data)).convert('RGB')
    except Exception as e:
        logger.error(f"❌ Erro ao decodificar base64: {e}")
        return None


def detect_objects(image: Image.Image, confidence: float = 0.35) -> tuple:
    """Detecta objetos na imagem usando YOLO"""
    global model
    
    if model is None:
        logger.warning("⚠️ Modelo não carregado!")
        return [], 0
    
    start_time = time.time()
    
    try:
        # Executar detecção
        results = model(image, conf=confidence, verbose=False)
        
        detected_objects = []
        
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Obter nome da classe
                    class_name = result.names.get(class_id, f"class_{class_id}")
                    class_name_pt = FOOD_TRANSLATIONS.get(class_name, class_name)
                    
                    # Verificar se é alimento
                    is_food = class_id in FOOD_CLASS_IDS
                    
                    # Calcular área
                    width = float(x2 - x1)
                    height = float(y2 - y1)
                    area = width * height
                    
                    detected_objects.append(DetectionResult(
                        class_name=class_name,
                        class_name_pt=class_name_pt,
                        confidence=round(conf, 4),
                        bbox=[float(x1), float(y1), width, height],
                        is_food=is_food,
                        area=round(area, 2)
                    ))
        
        inference_time = (time.time() - start_time) * 1000
        logger.info(f"🦾 Detectados {len(detected_objects)} objetos em {inference_time:.1f}ms")
        
        return detected_objects, inference_time
        
    except Exception as e:
        logger.error(f"❌ Erro na detecção: {e}")
        return [], 0


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Informações do serviço"""
    return {
        "service": "YOLO Food Detection Service",
        "version": "2.0.0",
        "model": YOLO_MODEL,
        "status": "running" if model else "model_not_loaded",
        "endpoints": {
            "health": "/health",
            "detect": "POST /detect",
            "detect_upload": "POST /detect/upload",
            "classes": "/classes",
            "benchmark": "/benchmark"
        }
    }


@app.get("/health")
async def health_check():
    """Health check do serviço"""
    ultralytics_version = "unknown"
    try:
        import ultralytics
        ultralytics_version = ultralytics.__version__
    except:
        pass
    
    return {
        "status": "healthy" if model else "degraded",
        "service": "yolo-food-detection",
        "version": "2.1.0",
        "model_loaded": model is not None,
        "model_name": YOLO_MODEL,
        "ultralytics_version": ultralytics_version,
        "confidence_threshold": YOLO_CONF
    }


@app.post("/detect", response_model=DetectionResponse)
async def detect(request: DetectionRequest):
    """Endpoint principal para detecção de objetos"""
    
    # Obter imagem
    image = None
    
    if request.image_url:
        image = download_image(request.image_url)
    elif request.image_base64:
        image = decode_base64_image(request.image_base64)
    
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível obter a imagem. Forneça image_url ou image_base64."
        )
    
    # Detectar objetos
    objects, inference_time = detect_objects(image, request.confidence)
    
    # Filtrar alimentos
    food_objects = [obj for obj in objects if obj.is_food]
    
    # Limitar resultados
    objects = objects[:request.max_detections]
    food_objects = food_objects[:request.max_detections]
    
    return DetectionResponse(
        success=True,
        objects=objects,
        food_objects=food_objects,
        total_objects=len(objects),
        total_food=len(food_objects),
        inference_time_ms=round(inference_time, 2),
        model_version=YOLO_MODEL,
        message=f"Detectados {len(food_objects)} alimentos de {len(objects)} objetos"
    )


@app.post("/detect/upload")
async def detect_upload(
    file: UploadFile = File(...),
    confidence: float = 0.35
):
    """Detecção via upload de arquivo"""
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar imagem: {e}")
    
    objects, inference_time = detect_objects(image, confidence)
    food_objects = [obj for obj in objects if obj.is_food]
    
    return DetectionResponse(
        success=True,
        objects=objects,
        food_objects=food_objects,
        total_objects=len(objects),
        total_food=len(food_objects),
        inference_time_ms=round(inference_time, 2),
        model_version=YOLO_MODEL,
        message=f"Detectados {len(food_objects)} alimentos"
    )


@app.get("/classes")
async def get_classes():
    """Retorna classes suportadas"""
    all_classes = {}
    if model:
        all_classes = model.names
    
    return {
        "food_classes": FOOD_CLASS_IDS,
        "food_translations": FOOD_TRANSLATIONS,
        "all_classes": all_classes,
        "total_food_classes": len(FOOD_CLASS_IDS)
    }


@app.get("/benchmark")
async def benchmark():
    """Benchmark do modelo"""
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo não carregado")
    
    # Criar imagem de teste
    test_sizes = [(320, 320), (640, 640), (1280, 1280)]
    results = []
    
    for size in test_sizes:
        dummy_img = np.random.randint(0, 255, (*size, 3), dtype=np.uint8)
        pil_img = Image.fromarray(dummy_img)
        
        times = []
        for _ in range(3):
            start = time.time()
            model(pil_img, verbose=False)
            times.append((time.time() - start) * 1000)
        
        avg_time = sum(times) / len(times)
        results.append({
            "size": f"{size[0]}x{size[1]}",
            "avg_inference_ms": round(avg_time, 2),
            "fps": round(1000 / avg_time, 1)
        })
    
    return {
        "model": YOLO_MODEL,
        "benchmarks": results,
        "recommendation": "Use 640x640 para melhor balanço velocidade/precisão"
    }


@app.get("/model/info")
async def model_info():
    """Informações detalhadas do modelo"""
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo não carregado")
    
    return {
        "model_name": YOLO_MODEL,
        "task": model.task,
        "names": model.names,
        "num_classes": len(model.names),
        "input_size": 640,
        "yoloe_available": model_yoloe is not None,
        "yoloe_model": YOLOE_MODEL if model_yoloe else None
    }


# ==================== YOLOE - VOCABULÁRIO ABERTO ====================

class PromptDetectionRequest(BaseModel):
    """Request para detecção com prompts de texto (YOLOE)"""
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    prompts: List[str] = ["documento", "tabela", "texto", "laudo médico"]
    confidence: float = 0.25
    max_detections: int = 50


class PromptDetectionResult(BaseModel):
    """Resultado de detecção com prompt"""
    prompt: str
    confidence: float
    bbox: List[float]
    area: float


class PromptDetectionResponse(BaseModel):
    """Resposta da detecção com prompts"""
    success: bool
    detections: List[PromptDetectionResult]
    prompts_used: List[str]
    total_detections: int
    inference_time_ms: float
    model_version: str
    is_document: bool
    document_confidence: float
    message: str = ""


@app.post("/detect/prompt", response_model=PromptDetectionResponse)
async def detect_with_prompt(request: PromptDetectionRequest):
    """
    🆕 Detecção com vocabulário aberto usando YOLOE
    
    Permite detectar QUALQUER objeto usando prompts de texto.
    Ideal para detectar documentos, tabelas, laudos médicos.
    
    Exemplo de prompts:
    - ["documento", "tabela", "texto"] para exames médicos
    - ["pizza", "hambúrguer", "salada"] para alimentos específicos
    """
    global model_yoloe
    
    if model_yoloe is None:
        raise HTTPException(
            status_code=503,
            detail="YOLOE não está disponível. Use /detect para detecção padrão."
        )
    
    # Obter imagem
    image = None
    if request.image_url:
        image = download_image(request.image_url)
    elif request.image_base64:
        image = decode_base64_image(request.image_base64)
    
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível obter a imagem."
        )
    
    start_time = time.time()
    
    try:
        # Executar detecção com prompts
        logger.info(f"🦾 YOLOE detectando com prompts: {request.prompts}")
        
        results = model_yoloe.predict(
            source=image,
            prompts=request.prompts,
            conf=request.confidence,
            verbose=False
        )
        
        detections = []
        is_document = False
        document_confidence = 0.0
        
        for result in results:
            if result.boxes is not None:
                for i, box in enumerate(result.boxes):
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Obter o prompt correspondente
                    prompt_name = request.prompts[class_id] if class_id < len(request.prompts) else f"class_{class_id}"
                    
                    width = float(x2 - x1)
                    height = float(y2 - y1)
                    area = width * height
                    
                    detections.append(PromptDetectionResult(
                        prompt=prompt_name,
                        confidence=round(conf, 4),
                        bbox=[float(x1), float(y1), width, height],
                        area=round(area, 2)
                    ))
                    
                    # Verificar se é documento
                    doc_keywords = ['documento', 'document', 'tabela', 'table', 'texto', 'text', 'laudo', 'report']
                    if any(kw in prompt_name.lower() for kw in doc_keywords):
                        is_document = True
                        document_confidence = max(document_confidence, conf)
        
        inference_time = (time.time() - start_time) * 1000
        
        # Limitar resultados
        detections = detections[:request.max_detections]
        
        logger.info(f"✅ YOLOE: {len(detections)} detecções em {inference_time:.1f}ms (documento: {is_document})")
        
        return PromptDetectionResponse(
            success=True,
            detections=detections,
            prompts_used=request.prompts,
            total_detections=len(detections),
            inference_time_ms=round(inference_time, 2),
            model_version=YOLOE_MODEL,
            is_document=is_document,
            document_confidence=round(document_confidence, 4),
            message=f"YOLOE detectou {len(detections)} objetos" + (f" - É documento ({document_confidence*100:.0f}%)" if is_document else "")
        )
        
    except Exception as e:
        logger.error(f"❌ Erro no YOLOE: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na detecção: {str(e)}")


# ==================== YOLO-POSE - POSE ESTIMATION ====================

class PoseAnalyzeRequest(BaseModel):
    """Request para análise de pose"""
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    session_id: str
    exercise: str = 'squat'
    calibration: Optional[dict] = None


class PoseKeypointResult(BaseModel):
    """Keypoint individual"""
    id: str
    name: str
    x: float
    y: float
    confidence: float


class FormHintResult(BaseModel):
    """Dica de forma"""
    type: str
    message: str
    priority: int


class PoseAnalyzeResponse(BaseModel):
    """Response da análise de pose"""
    success: bool
    keypoints: List[PoseKeypointResult]
    rep_count: int
    partial_reps: int
    current_phase: str
    phase_progress: float
    form_hints: List[FormHintResult]
    confidence: float
    warnings: List[str]
    inference_time_ms: float
    angles: dict
    is_valid_rep: bool
    is_full_body: bool


@app.post("/pose/analyze", response_model=PoseAnalyzeResponse)
async def analyze_pose(request: PoseAnalyzeRequest):
    """
    🏋️ Análise de pose para treino com câmera
    
    Detecta keypoints, conta repetições e fornece feedback de postura.
    Mantém estado da sessão para contagem contínua.
    
    Exercícios suportados: squat, pushup, situp
    """
    global pose_session_states
    
    # Verificar se modelo está carregado
    if model_pose is None:
        raise HTTPException(
            status_code=503,
            detail="YOLO-Pose não está disponível. Verifique se o modelo foi carregado."
        )
    
    # Obter imagem
    image = None
    if request.image_base64:
        image = decode_base64_image(request.image_base64)
    elif request.image_url:
        image = download_image(request.image_url)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Imagem não fornecida ou inválida")
    
    # Detectar pose
    pose_result = detect_pose(image)
    
    if 'error' in pose_result:
        raise HTTPException(status_code=500, detail=pose_result['error'])
    
    keypoints = pose_result['keypoints']
    
    # Obter ou criar estado da sessão
    if request.session_id not in pose_session_states:
        pose_session_states[request.session_id] = PoseSessionState(
            request.exercise, 
            request.calibration
        )
    
    state = pose_session_states[request.session_id]
    
    # Obter thresholds do exercício
    thresholds = EXERCISE_THRESHOLDS.get(request.exercise, EXERCISE_THRESHOLDS['squat'])
    
    # Aplicar calibração se disponível
    if request.calibration:
        if 'rep_down_angle' in request.calibration:
            thresholds['rep_down_angle'] = request.calibration['rep_down_angle']
        if 'rep_up_angle' in request.calibration:
            thresholds['rep_up_angle'] = request.calibration['rep_up_angle']
    
    # Calcular ângulos baseado no exercício
    angles = {}
    form_hints = []
    warnings = []
    is_valid_rep = False
    phase_progress = 0.0
    
    # Criar dicionário de keypoints para acesso rápido
    kp_dict = {k['id']: k for k in keypoints}
    
    if request.exercise == 'squat':
        # Calcular ângulo do joelho (hip-knee-ankle)
        hip = kp_dict.get('left_hip')
        knee = kp_dict.get('left_knee')
        ankle = kp_dict.get('left_ankle')
        
        if hip and knee and ankle:
            if all(k['confidence'] > 0.4 for k in [hip, knee, ankle]):
                raw_angle = calculate_angle(
                    (hip['x'], hip['y']),
                    (knee['x'], knee['y']),
                    (ankle['x'], ankle['y'])
                )
                
                # Suavizar ângulo
                smoothed_angle = state.get_smoothed_angle(raw_angle)
                angles['knee'] = round(smoothed_angle, 1)
                angles['raw'] = round(raw_angle, 1)
                
                # Thresholds
                down_threshold = thresholds['rep_down_angle']
                up_threshold = thresholds['rep_up_angle']
                debounce_ms = thresholds['debounce_ms']
                
                # Rastrear ângulos extremos
                if smoothed_angle < state.valley_angle:
                    state.valley_angle = smoothed_angle
                if smoothed_angle > state.peak_angle:
                    state.peak_angle = smoothed_angle
                
                # Detectar fase e contar reps
                current_time = time.time() * 1000  # ms
                
                if state.current_phase == 'up' and smoothed_angle < down_threshold:
                    state.current_phase = 'down'
                    state.phase_start_time = current_time
                    
                elif state.current_phase == 'down' and smoothed_angle > up_threshold:
                    # Verificar debounce
                    time_since_last = current_time - state.last_rep_time
                    
                    if time_since_last > debounce_ms:
                        # Verificar se foi uma rep completa ou parcial
                        if state.valley_angle <= down_threshold + thresholds['safe_zone']:
                            state.rep_count += 1
                            is_valid_rep = True
                            logger.info(f"🏋️ Rep #{state.rep_count} válida! Ângulo mínimo: {state.valley_angle:.1f}°")
                        else:
                            state.partial_reps += 1
                            logger.info(f"⚠️ Rep parcial #{state.partial_reps}. Ângulo mínimo: {state.valley_angle:.1f}°")
                        
                        state.last_rep_time = current_time
                        state.reset_phase_tracking()
                    
                    state.current_phase = 'up'
                
                # Calcular progresso da fase
                angle_range = up_threshold - down_threshold
                if angle_range > 0:
                    if state.current_phase == 'down':
                        phase_progress = min(100, max(0, (up_threshold - smoothed_angle) / angle_range * 100))
                    else:
                        phase_progress = min(100, max(0, (smoothed_angle - down_threshold) / angle_range * 100))
                
                # Análise de forma (feedback gentil)
                form_hints = analyze_squat_form(keypoints, smoothed_angle, thresholds)
                
            else:
                warnings.append('Keypoints do joelho com baixa confiança. Ajuste sua posição.')
        else:
            warnings.append('Não foi possível detectar quadril, joelho ou tornozelo. Posicione-se de lado para a câmera.')
    
    elif request.exercise == 'pushup':
        # Calcular ângulo do cotovelo (shoulder-elbow-wrist)
        shoulder = kp_dict.get('left_shoulder')
        elbow = kp_dict.get('left_elbow')
        wrist = kp_dict.get('left_wrist')
        
        if shoulder and elbow and wrist:
            if all(k['confidence'] > 0.4 for k in [shoulder, elbow, wrist]):
                raw_angle = calculate_angle(
                    (shoulder['x'], shoulder['y']),
                    (elbow['x'], elbow['y']),
                    (wrist['x'], wrist['y'])
                )
                smoothed_angle = state.get_smoothed_angle(raw_angle)
                angles['elbow'] = round(smoothed_angle, 1)
                
                # Similar logic para pushup...
                down_threshold = thresholds['rep_down_angle']
                up_threshold = thresholds['rep_up_angle']
                
                if state.current_phase == 'up' and smoothed_angle < down_threshold:
                    state.current_phase = 'down'
                elif state.current_phase == 'down' and smoothed_angle > up_threshold:
                    current_time = time.time() * 1000
                    if current_time - state.last_rep_time > thresholds['debounce_ms']:
                        state.rep_count += 1
                        is_valid_rep = True
                        state.last_rep_time = current_time
                    state.current_phase = 'up'
    
    # Limitar hints para não sobrecarregar (máximo 2)
    form_hints = sorted(form_hints, key=lambda x: x['priority'])[:2]
    
    # Converter keypoints para response
    keypoints_response = [
        PoseKeypointResult(
            id=k['id'],
            name=k['name'],
            x=k['x'],
            y=k['y'],
            confidence=k['confidence']
        )
        for k in keypoints
    ]
    
    # Converter hints para response
    hints_response = [
        FormHintResult(type=h['type'], message=h['message'], priority=h['priority'])
        for h in form_hints
    ]
    
    logger.info(f"🏋️ Pose: {request.exercise} | Reps: {state.rep_count} | Fase: {state.current_phase} | Ângulo: {angles.get('knee', angles.get('elbow', 0))}°")
    
    return PoseAnalyzeResponse(
        success=True,
        keypoints=keypoints_response,
        rep_count=state.rep_count,
        partial_reps=state.partial_reps,
        current_phase=state.current_phase,
        phase_progress=round(phase_progress, 1),
        form_hints=hints_response,
        confidence=pose_result['confidence'],
        warnings=warnings,
        inference_time_ms=round(pose_result['inference_time_ms'], 2),
        angles=angles,
        is_valid_rep=is_valid_rep,
        is_full_body=pose_result['is_full_body']
    )


@app.get("/pose/session/{session_id}")
async def get_pose_session(session_id: str):
    """Obtém estado atual de uma sessão de pose"""
    if session_id not in pose_session_states:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    state = pose_session_states[session_id]
    return {
        'session_id': session_id,
        'exercise': state.exercise_type,
        'rep_count': state.rep_count,
        'partial_reps': state.partial_reps,
        'current_phase': state.current_phase
    }


@app.delete("/pose/session/{session_id}")
async def end_pose_session(session_id: str):
    """Encerra uma sessão de pose e retorna estatísticas finais"""
    if session_id in pose_session_states:
        state = pose_session_states.pop(session_id)
        return {
            'success': True,
            'session_id': session_id,
            'exercise': state.exercise_type,
            'total_reps': state.rep_count,
            'partial_reps': state.partial_reps,
            'message': f'Sessão encerrada com {state.rep_count} reps válidas!'
        }
    return {
        'success': False,
        'message': 'Sessão não encontrada'
    }


@app.get("/pose/health")
async def pose_health():
    """Health check do serviço de pose estimation"""
    return {
        'status': 'healthy' if model_pose else 'degraded',
        'pose_model_loaded': model_pose is not None,
        'pose_model_name': YOLO_POSE_MODEL,
        'active_sessions': len(pose_session_states),
        'supported_exercises': list(EXERCISE_THRESHOLDS.keys())
    }


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🚀 Iniciando servidor em {host}:{port}")
    uvicorn.run(app, host=host, port=port)

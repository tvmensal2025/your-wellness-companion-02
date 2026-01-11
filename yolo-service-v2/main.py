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
from contextlib import asynccontextmanager

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

# Modelos globais
model = None
model_yoloe = None

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


def load_yolo_model():
    """Carrega os modelos YOLO11 e YOLOE"""
    global model, model_yoloe
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


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🚀 Iniciando servidor em {host}:{port}")
    uvicorn.run(app, host=host, port=port)

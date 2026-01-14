# 🦾 Dockerfile para YOLO26 + YOLOE Food Detection + Pose Estimation Service
# Versão 3.0 - Janeiro 2026
# Suporta: YOLO26 (NMS-free), YOLO26-pose (RLE), YOLOE-26 (vocabulário aberto)

FROM python:3.11-slim

# Metadados
LABEL maintainer="Instituto dos Sonhos"
LABEL version="3.0.0"
LABEL description="YOLO26 + YOLOE Food Detection + Pose Estimation Service"

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Modelos YOLO26 (mais rápidos, NMS-free)
ENV YOLO_MODEL=yolo26s.pt
ENV YOLO_POSE_MODEL=yolo26s-pose.pt
# YOLOE para vocabulário aberto (Dr. Vital, alimentos brasileiros)
ENV YOLOE_MODEL=yoloe-26s-seg.pt
ENV YOLO_CONF=0.35
ENV PORT=8000

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema (mínimas para headless)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar requirements primeiro (cache de camadas)
COPY requirements.txt .

# Instalar dependências Python (ultralytics >= 8.4 para YOLO26)
RUN pip install --no-cache-dir -r requirements.txt

# Baixar modelos YOLO durante build (mais rápido no startup)
# 1. YOLO26 para detecção de alimentos (43% mais rápido, NMS-free)
RUN python -c "from ultralytics import YOLO; YOLO('yolo26s.pt')"

# 2. YOLO26-pose para treino com câmera (RLE = keypoints mais precisos)
RUN python -c "from ultralytics import YOLO; YOLO('yolo26s-pose.pt')"

# 3. YOLOE-26 para vocabulário aberto (Dr. Vital, alimentos brasileiros)
RUN python -c "from ultralytics import YOLO; YOLO('yoloe-26s-seg.pt')"

# Copiar código
COPY main.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expor porta
EXPOSE ${PORT}

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

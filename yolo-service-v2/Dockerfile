# 🦾 Dockerfile para YOLO11/YOLO26 Food Detection + Pose Estimation Service
# Versão 2.2 - Com suporte a YOLO-Pose para treino com câmera

FROM python:3.11-slim

# Metadados
LABEL maintainer="Instituto dos Sonhos"
LABEL version="2.2.0"
LABEL description="YOLO11 Food Detection + Pose Estimation Service"

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Modelo padrão para detecção de alimentos
ENV YOLO_MODEL=yolo11n.pt
# Modelo para pose estimation (treino com câmera)
ENV YOLO_POSE_MODEL=yolo11n-pose.pt
ENV YOLO_CONF=0.35
ENV PORT=8000

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema (mínimas para headless)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar requirements primeiro (cache de camadas)
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Baixar modelos YOLO durante build (mais rápido no startup)
# Modelo para detecção de alimentos
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n.pt')"
# Modelo para pose estimation
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n-pose.pt')"

# Copiar código
COPY main.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expor porta
EXPOSE ${PORT}

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

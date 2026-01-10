# 🦾 Dockerfile para YOLO11/YOLO26 Food Detection Service
# Versão 2.0 - Otimizado para performance

FROM python:3.11-slim

# Metadados
LABEL maintainer="Instituto dos Sonhos"
LABEL version="2.0.0"
LABEL description="YOLO11/YOLO26 Food Detection Service"

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Modelo padrão (pode ser sobrescrito)
ENV YOLO_MODEL=yolo11n.pt
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

# Baixar modelo YOLO durante build (mais rápido no startup)
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n.pt')"

# Copiar código
COPY main.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expor porta
EXPOSE ${PORT}

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

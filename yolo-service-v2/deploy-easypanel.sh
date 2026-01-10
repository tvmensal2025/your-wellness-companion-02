#!/bin/bash
# 🚀 Script de Deploy YOLO11/YOLO26 no Easypanel
# Versão 2.0

set -e

echo "🦾 =========================================="
echo "   YOLO11/YOLO26 Deploy para Easypanel"
echo "   Versão 2.0 - Janeiro 2026"
echo "==========================================="

# Configurações
VPS_IP="45.67.221.216"
VPS_USER="root"
REMOTE_DIR="/opt/yolo-service-v2"
SERVICE_NAME="yolo-food-detection"

echo ""
echo "📋 Configurações:"
echo "   VPS: $VPS_IP"
echo "   Diretório: $REMOTE_DIR"
echo "   Serviço: $SERVICE_NAME"
echo ""

# Verificar se os arquivos existem
if [ ! -f "main.py" ] || [ ! -f "requirements.txt" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ Erro: Execute este script dentro da pasta yolo-service-v2/"
    exit 1
fi

echo "📦 Preparando arquivos para deploy..."

# Criar arquivo tar com os arquivos necessários
tar -czf yolo-service-v2.tar.gz main.py requirements.txt Dockerfile

echo "📤 Enviando arquivos para VPS..."
echo "   (Você precisará digitar a senha SSH)"
echo ""

# Copiar arquivos para VPS
scp -o StrictHostKeyChecking=no yolo-service-v2.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/

echo ""
echo "🔧 Configurando no servidor..."

# Executar comandos no servidor
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
set -e

echo "📁 Criando diretório..."
mkdir -p /opt/yolo-service-v2
cd /opt/yolo-service-v2

echo "📦 Extraindo arquivos..."
tar -xzf /tmp/yolo-service-v2.tar.gz
rm /tmp/yolo-service-v2.tar.gz

echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    exit 1
fi

echo "🔨 Construindo imagem Docker..."
docker build -t yolo-food-detection:v2 .

echo "🛑 Parando container antigo (se existir)..."
docker stop yolo-food-detection 2>/dev/null || true
docker rm yolo-food-detection 2>/dev/null || true

echo "🚀 Iniciando novo container..."
docker run -d \
    --name yolo-food-detection \
    --restart unless-stopped \
    -p 8002:8000 \
    -e YOLO_MODEL=yolo11n.pt \
    -e YOLO_CONF=0.35 \
    yolo-food-detection:v2

echo "⏳ Aguardando inicialização (60s para carregar modelo)..."
sleep 60

echo "🔍 Verificando status..."
docker ps | grep yolo-food-detection

echo "🧪 Testando health check..."
curl -s http://localhost:8002/health | python3 -m json.tool || echo "Aguarde mais alguns segundos..."

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 URLs disponíveis:"
echo "   Health: http://45.67.221.216:8002/health"
echo "   Info:   http://45.67.221.216:8002/"
echo "   Detect: POST http://45.67.221.216:8002/detect"
echo "   Docs:   http://45.67.221.216:8002/docs"
echo ""
ENDSSH

# Limpar arquivo local
rm -f yolo-service-v2.tar.gz

echo ""
echo "🎉 =========================================="
echo "   Deploy YOLO11 Concluído!"
echo "==========================================="
echo ""
echo "🧪 Teste o serviço:"
echo "   curl http://$VPS_IP:8002/health"
echo ""
echo "📖 Documentação interativa:"
echo "   http://$VPS_IP:8002/docs"
echo ""

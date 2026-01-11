#!/bin/bash
# 🦾 Deploy YOLOE - Execute este script no seu terminal
# Uso: ./deploy-yoloe.sh

echo "🦾 Deploy YOLOE para VPS 45.67.221.216"
echo "======================================"

# Verificar se o arquivo main.py existe
if [ ! -f "yolo-service-v2/main.py" ]; then
    echo "❌ Arquivo yolo-service-v2/main.py não encontrado!"
    exit 1
fi

echo ""
echo "📤 Copiando main.py para VPS..."
scp yolo-service-v2/main.py root@45.67.221.216:/tmp/main.py

if [ $? -ne 0 ]; then
    echo "❌ Erro ao copiar arquivo. Verifique a conexão SSH."
    exit 1
fi

echo ""
echo "📦 Copiando para container Docker..."
ssh root@45.67.221.216 "docker cp /tmp/main.py yolo11-service:/app/main.py"

echo ""
echo "🔄 Reiniciando serviço YOLO..."
ssh root@45.67.221.216 "docker restart yolo11-service"

echo ""
echo "⏳ Aguardando 10 segundos para inicialização..."
sleep 10

echo ""
echo "🔍 Verificando health check..."
curl -s http://45.67.221.216:8002/health | python3 -m json.tool 2>/dev/null || curl -s http://45.67.221.216:8002/health

echo ""
echo "📊 Verificando info do modelo..."
curl -s http://45.67.221.216:8002/model/info | python3 -m json.tool 2>/dev/null || curl -s http://45.67.221.216:8002/model/info

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Para testar YOLOE com documento:"
echo 'curl -X POST http://45.67.221.216:8002/detect/prompt -H "Content-Type: application/json" -d '\''{"image_url": "URL_DA_IMAGEM", "prompts": ["documento", "tabela", "texto"]}'\'''

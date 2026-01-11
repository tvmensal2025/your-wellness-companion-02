#!/bin/bash
# 🦾 Script para Deploy do YOLOE na VPS
# Execute: ssh root@45.67.221.216 < deploy-yoloe-vps.sh

echo "🦾 Deploy YOLOE - VPS 45.67.221.216"
echo "=================================="

# 1. Verificar modelos existentes
echo ""
echo "📦 Verificando modelos..."
docker exec yolo11-service ls -la /app/*.pt

# 2. Verificar se YOLOE está disponível
echo ""
echo "🔍 Verificando YOLOE no Ultralytics..."
docker exec yolo11-service python3 -c "
try:
    from ultralytics import YOLOE
    print('✅ YOLOE disponível!')
except ImportError as e:
    print(f'⚠️ YOLOE não disponível: {e}')
    print('Tentando importar de ultralytics.models...')
    try:
        from ultralytics.models import YOLOE
        print('✅ YOLOE disponível via ultralytics.models!')
    except:
        print('❌ YOLOE não encontrado')
"

# 3. Verificar versão do Ultralytics
echo ""
echo "📊 Versão do Ultralytics:"
docker exec yolo11-service pip show ultralytics | grep Version

# 4. Testar carregamento do modelo YOLOE
echo ""
echo "🧪 Testando carregamento do YOLOE..."
docker exec yolo11-service python3 -c "
import os
model_path = '/app/yoloe-11s-seg.pt'
if os.path.exists(model_path):
    print(f'✅ Modelo existe: {model_path}')
    try:
        from ultralytics import YOLO
        model = YOLO(model_path)
        print(f'✅ Modelo carregado com sucesso!')
        print(f'   Task: {model.task}')
    except Exception as e:
        print(f'⚠️ Erro ao carregar: {e}')
else:
    print(f'❌ Modelo não encontrado: {model_path}')
"

echo ""
echo "✅ Verificação concluída!"

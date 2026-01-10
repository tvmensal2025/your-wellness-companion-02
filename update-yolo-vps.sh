#!/bin/bash
# 🚀 Script de Atualização YOLO na VPS
# Execute: chmod +x update-yolo-vps.sh && ./update-yolo-vps.sh

set -e

VPS_IP="45.67.221.216"
VPS_USER="root"

echo "🦾 =========================================="
echo "   Atualização YOLO11 na VPS"
echo "==========================================="
echo ""
echo "📋 Este script vai:"
echo "   1. Conectar na VPS via SSH"
echo "   2. Atualizar a biblioteca ultralytics"
echo "   3. Reiniciar o serviço YOLO"
echo ""
echo "⚠️  Você precisará digitar a senha SSH"
echo ""
read -p "Pressione ENTER para continuar..."

echo ""
echo "🔗 Conectando na VPS..."

ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
set -e

echo ""
echo "📍 Conectado na VPS!"
echo ""

# Verificar versão atual
echo "🔍 Verificando versão atual do ultralytics..."
pip show ultralytics 2>/dev/null | grep -E "^(Name|Version)" || echo "ultralytics não encontrado via pip"

# Verificar se está rodando em Docker ou direto
echo ""
echo "🐳 Verificando containers Docker..."
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null | grep -i yolo || echo "Nenhum container YOLO encontrado"

echo ""
echo "🔍 Verificando processos Python/YOLO..."
ps aux | grep -E "(yolo|uvicorn|gunicorn)" | grep -v grep || echo "Nenhum processo YOLO encontrado"

echo ""
echo "📁 Verificando diretórios YOLO..."
ls -la /opt/yolo* 2>/dev/null || echo "Nenhum diretório /opt/yolo* encontrado"
ls -la /root/yolo* 2>/dev/null || echo "Nenhum diretório /root/yolo* encontrado"

echo ""
echo "🔍 Procurando arquivos de serviço YOLO..."
find /opt /root /home -name "*yolo*" -type f 2>/dev/null | head -20 || echo "Nenhum arquivo encontrado"

echo ""
echo "📋 Verificando serviços systemd..."
systemctl list-units --type=service | grep -i yolo 2>/dev/null || echo "Nenhum serviço systemd YOLO"

echo ""
echo "🌐 Verificando porta 8002..."
netstat -tlnp 2>/dev/null | grep 8002 || ss -tlnp | grep 8002 || echo "Porta 8002 não encontrada"

ENDSSH

echo ""
echo "✅ Diagnóstico concluído!"
echo ""
echo "📋 Próximo passo: Baseado no resultado acima,"
echo "   vou criar o script de atualização específico."

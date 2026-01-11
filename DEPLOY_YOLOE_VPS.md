# 🦾 Deploy YOLOE na VPS - Instruções

## Passo 1: Conectar na VPS

```bash
ssh root@45.67.221.216
```

## Passo 2: Verificar se o modelo YOLOE existe

```bash
docker exec yolo11-service ls -la /app/*.pt
```

Deve mostrar:
- `/app/yolo11s-seg.pt` (alimentos)
- `/app/yoloe-11s-seg.pt` (documentos)

Se o YOLOE não existir, baixe:
```bash
docker exec yolo11-service wget -O /app/yoloe-11s-seg.pt https://github.com/ultralytics/assets/releases/download/v8.3.0/yoloe-11s-seg.pt
```

## Passo 3: Verificar versão do Ultralytics

```bash
docker exec yolo11-service pip show ultralytics | grep Version
```

Deve ser **8.3.252** ou superior para YOLOE funcionar.

Se precisar atualizar:
```bash
docker exec yolo11-service pip install -U ultralytics
```

## Passo 4: Copiar o novo main.py

No seu computador local, execute:
```bash
# Copiar arquivo para VPS
scp yolo-service-v2/main.py root@45.67.221.216:/tmp/main.py

# Na VPS, copiar para o container
ssh root@45.67.221.216 "docker cp /tmp/main.py yolo11-service:/app/main.py"
```

## Passo 5: Reiniciar o serviço

```bash
ssh root@45.67.221.216 "docker restart yolo11-service"
```

## Passo 6: Verificar se está funcionando

```bash
# Health check
curl http://45.67.221.216:8002/health

# Info do modelo
curl http://45.67.221.216:8002/model/info
```

## Passo 7: Testar YOLOE com documento

```bash
curl -X POST http://45.67.221.216:8002/detect/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/documento.jpg",
    "prompts": ["documento", "tabela", "texto", "laudo médico"],
    "confidence": 0.25
  }'
```

## Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Status do serviço |
| `/detect` | POST | Detecção YOLO11 (alimentos) |
| `/detect/prompt` | POST | Detecção YOLOE (documentos) |
| `/model/info` | GET | Info dos modelos |
| `/classes` | GET | Classes disponíveis |

## Resposta esperada do `/detect/prompt`

```json
{
  "success": true,
  "detections": [
    {
      "prompt": "documento",
      "confidence": 0.85,
      "bbox": [10, 20, 500, 700],
      "area": 350000
    }
  ],
  "is_document": true,
  "document_confidence": 0.85,
  "inference_time_ms": 45.2
}
```

## Troubleshooting

### YOLOE não carrega
```bash
# Verificar logs
docker logs yolo11-service --tail 50

# Testar import
docker exec yolo11-service python3 -c "from ultralytics import YOLOE; print('OK')"
```

### Modelo não encontrado
```bash
# Baixar modelo YOLOE
docker exec yolo11-service wget -O /app/yoloe-11s-seg.pt \
  https://github.com/ultralytics/assets/releases/download/v8.3.0/yoloe-11s-seg.pt
```

### Serviço não responde
```bash
# Verificar se está rodando
docker ps | grep yolo

# Reiniciar
docker restart yolo11-service

# Ver logs em tempo real
docker logs -f yolo11-service
```

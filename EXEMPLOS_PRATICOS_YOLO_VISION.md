# 💻 EXEMPLOS PRÁTICOS - YOLO vs GOOGLE VISION

## 📋 Índice
1. [Configuração Inicial](#configuracao)
2. [Exemplos YOLO](#exemplos-yolo)
3. [Exemplos Google Vision](#exemplos-google-vision)
4. [Comparação Side-by-Side](#comparacao)
5. [Implementação Híbrida](#hibrida)
6. [Performance Testing](#performance)

---

## 🚀 Configuração Inicial {#configuracao}

### **YOLO - Setup**

#### **Instalação (Python)**
```bash
# Opção 1: Ultralytics (Recomendado)
pip install ultralytics

# Opção 2: YOLOv5
pip install torch torchvision
git clone https://github.com/ultralytics/yolov5
cd yolov5
pip install -r requirements.txt

# Dependências adicionais
pip install opencv-python pillow numpy
```

#### **Instalação (Node.js/JavaScript)**
```bash
# ONNX Runtime para rodar modelos YOLO
npm install onnxruntime-node
npm install jimp  # Para processamento de imagens
```

#### **Download de Modelo Pré-treinado**
```python
from ultralytics import YOLO

# Download automático na primeira execução
model = YOLO('yolov8n.pt')  # nano (mais rápido)
# model = YOLO('yolov8s.pt')  # small
# model = YOLO('yolov8m.pt')  # medium
# model = YOLO('yolov8l.pt')  # large
# model = YOLO('yolov8x.pt')  # extra large (mais preciso)
```

### **Google Vision - Setup**

#### **Instalação (Python)**
```bash
# Cliente Python
pip install google-cloud-vision

# Autenticação
# 1. Criar projeto no Google Cloud Console
# 2. Ativar Vision API
# 3. Criar Service Account e baixar JSON
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

#### **Instalação (Node.js)**
```bash
# Cliente Node.js
npm install @google-cloud/vision

# Configurar autenticação
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

#### **Configuração de Credenciais**
```python
# Método 1: Variável de ambiente (recomendado)
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'path/to/key.json'

# Método 2: Explícito no código
from google.cloud import vision
client = vision.ImageAnnotatorClient.from_service_account_json(
    'path/to/key.json'
)
```

---

## 🎯 Exemplos YOLO {#exemplos-yolo}

### **Exemplo 1: Detecção Básica de Alimentos**

```python
from ultralytics import YOLO
import cv2
from PIL import Image
import time

# Carregar modelo
model = YOLO('yolov8n.pt')

# Detecção em imagem única
def detectar_alimentos_yolo(imagem_path):
    """
    Detecta alimentos em uma imagem usando YOLO
    """
    start_time = time.time()
    
    # Realizar predição
    results = model(imagem_path)
    
    # Processar resultados
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Extrair informações
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            
            # Nome da classe
            class_name = model.names[class_id]
            
            detections.append({
                'classe': class_name,
                'confianca': confidence,
                'bbox': bbox,
                'posicao': {
                    'x1': bbox[0],
                    'y1': bbox[1],
                    'x2': bbox[2],
                    'y2': bbox[3]
                }
            })
    
    latency = (time.time() - start_time) * 1000  # ms
    
    return {
        'deteccoes': detections,
        'total_objetos': len(detections),
        'latencia_ms': latency,
        'imagem_original': imagem_path
    }

# Uso
resultado = detectar_alimentos_yolo('comida.jpg')
print(f"Encontrados {resultado['total_objetos']} objetos em {resultado['latencia_ms']:.2f}ms")
for det in resultado['deteccoes']:
    print(f"  - {det['classe']}: {det['confianca']:.2%}")
```

### **Exemplo 2: Detecção em Vídeo/Webcam (Tempo Real)**

```python
import cv2
from ultralytics import YOLO

def deteccao_tempo_real():
    """
    Detecção em tempo real via webcam
    """
    # Carregar modelo
    model = YOLO('yolov8n.pt')
    
    # Abrir webcam
    cap = cv2.VideoCapture(0)
    
    # Classes de alimentos que queremos detectar
    food_classes = ['apple', 'banana', 'orange', 'sandwich', 'pizza', 
                   'hot dog', 'cake', 'carrot', 'broccoli']
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Realizar predição
        results = model(frame, stream=True, verbose=False)
        
        # Desenhar resultados
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                
                # Filtrar apenas alimentos
                if class_name in food_classes:
                    confidence = float(box.conf[0])
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    
                    # Desenhar bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    # Adicionar label
                    label = f"{class_name}: {confidence:.2%}"
                    cv2.putText(frame, label, (x1, y1 - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Mostrar FPS
        fps = cap.get(cv2.CAP_PROP_FPS)
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        # Exibir frame
        cv2.imshow('Detecção de Alimentos - YOLO', frame)
        
        # Pressione 'q' para sair
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

# Executar
deteccao_tempo_real()
```

### **Exemplo 3: Fine-tuning para Alimentos Específicos**

```python
from ultralytics import YOLO

def treinar_modelo_customizado():
    """
    Treinar YOLO em dataset customizado de alimentos
    """
    # Carregar modelo pré-treinado
    model = YOLO('yolov8n.pt')
    
    # Treinar com seu dataset
    # Dataset deve estar em formato YOLO:
    # - images/train/*.jpg
    # - images/val/*.jpg
    # - labels/train/*.txt
    # - labels/val/*.txt
    # - data.yaml (configuração)
    
    results = model.train(
        data='food_dataset/data.yaml',  # Arquivo de configuração
        epochs=100,                      # Número de épocas
        imgsz=640,                       # Tamanho da imagem
        batch=16,                        # Batch size
        name='food_detector',            # Nome do experimento
        patience=50,                     # Early stopping
        save=True,                       # Salvar checkpoints
        device=0,                        # GPU 0 (ou 'cpu')
        workers=8,                       # Threads para data loading
        pretrained=True,                 # Usar pesos pré-treinados
        optimizer='AdamW',               # Otimizador
        lr0=0.01,                        # Learning rate inicial
        lrf=0.01,                        # Learning rate final
        momentum=0.937,                  # SGD momentum
        weight_decay=0.0005,             # Weight decay
        warmup_epochs=3.0,               # Warmup epochs
        warmup_momentum=0.8,             # Warmup momentum
        cos_lr=True,                     # Cosine LR scheduler
        amp=True,                        # Automatic Mixed Precision
        augment=True,                    # Data augmentation
    )
    
    # Avaliar modelo
    metrics = model.val()
    
    print(f"mAP@50: {metrics.box.map50:.3f}")
    print(f"mAP@50-95: {metrics.box.map:.3f}")
    
    # Exportar modelo otimizado
    model.export(format='onnx', optimize=True)  # Para deploy
    
    return model

# Configuração do data.yaml
"""
# food_dataset/data.yaml
path: ../food_dataset  # dataset root dir
train: images/train  # train images
val: images/val      # val images
test: images/test    # test images (optional)

# Classes
names:
  0: apple
  1: banana
  2: orange
  3: sandwich
  4: pizza
  5: salad
  6: pasta
  7: rice
  8: chicken
  9: fish
"""
```

### **Exemplo 4: Detecção em Lote (Batch Processing)**

```python
from ultralytics import YOLO
import os
from pathlib import Path
import json

def processar_lote_imagens(pasta_entrada, pasta_saida):
    """
    Processar múltiplas imagens em lote
    """
    model = YOLO('yolov8n.pt')
    
    # Listar todas as imagens
    imagens = list(Path(pasta_entrada).glob('*.jpg'))
    imagens += list(Path(pasta_entrada).glob('*.png'))
    
    resultados_totais = []
    
    # Processar em lote para melhor performance
    results = model(imagens, stream=True, batch=32)
    
    for i, result in enumerate(results):
        imagem_path = imagens[i]
        
        detections = []
        for box in result.boxes:
            detections.append({
                'classe': model.names[int(box.cls[0])],
                'confianca': float(box.conf[0]),
                'bbox': box.xyxy[0].tolist()
            })
        
        # Salvar imagem com anotações
        result.save(filename=f"{pasta_saida}/{imagem_path.name}")
        
        # Guardar resultados
        resultados_totais.append({
            'imagem': str(imagem_path.name),
            'deteccoes': detections
        })
    
    # Salvar JSON com todos os resultados
    with open(f"{pasta_saida}/resultados.json", 'w', encoding='utf-8') as f:
        json.dump(resultados_totais, f, indent=2, ensure_ascii=False)
    
    print(f"Processadas {len(imagens)} imagens")
    print(f"Resultados salvos em: {pasta_saida}")
    
    return resultados_totais

# Uso
processar_lote_imagens('imagens_entrada/', 'imagens_saida/')
```

### **Exemplo 5: Otimização para Mobile (TensorFlow Lite)**

```python
from ultralytics import YOLO

def exportar_para_mobile():
    """
    Exportar modelo YOLO para uso em aplicativos móveis
    """
    model = YOLO('yolov8n.pt')
    
    # Exportar para TensorFlow Lite (Android/iOS)
    model.export(
        format='tflite',
        imgsz=320,           # Tamanho menor para mobile
        int8=True,           # Quantização int8 para menor tamanho
        optimize=True        # Otimizações adicionais
    )
    
    # Exportar para CoreML (iOS)
    model.export(format='coreml', nms=True)
    
    # Exportar para ONNX (Multiplataforma)
    model.export(format='onnx', dynamic=True, simplify=True)
    
    print("Modelos exportados com sucesso!")
    print("- yolov8n.tflite (Android)")
    print("- yolov8n.mlmodel (iOS)")
    print("- yolov8n.onnx (Cross-platform)")

exportar_para_mobile()
```

---

## ☁️ Exemplos Google Vision {#exemplos-google-vision}

### **Exemplo 1: Detecção Básica de Objetos**

```python
from google.cloud import vision
import io
import time

def detectar_alimentos_google_vision(imagem_path):
    """
    Detecta alimentos usando Google Vision API
    """
    start_time = time.time()
    
    # Inicializar cliente
    client = vision.ImageAnnotatorClient()
    
    # Carregar imagem
    with io.open(imagem_path, 'rb') as image_file:
        content = image_file.read()
    
    image = vision.Image(content=content)
    
    # Realizar detecção de objetos
    response = client.object_localization(image=image)
    objects = response.localized_object_annotations
    
    # Processar resultados
    detections = []
    for obj in objects:
        vertices = [(vertex.x, vertex.y) 
                   for vertex in obj.bounding_poly.normalized_vertices]
        
        detections.append({
            'classe': obj.name,
            'confianca': obj.score,
            'vertices_normalizados': vertices,
            'mid': obj.mid  # Machine ID do Google
        })
    
    latency = (time.time() - start_time) * 1000  # ms
    
    return {
        'deteccoes': detections,
        'total_objetos': len(detections),
        'latencia_ms': latency,
        'imagem_original': imagem_path
    }

# Uso
resultado = detectar_alimentos_google_vision('comida.jpg')
print(f"Encontrados {resultado['total_objetos']} objetos em {resultado['latencia_ms']:.2f}ms")
for det in resultado['deteccoes']:
    print(f"  - {det['classe']}: {det['confianca']:.2%}")
```

### **Exemplo 2: Label Detection (Mais Rápido)**

```python
from google.cloud import vision

def detectar_labels_alimentos(imagem_path):
    """
    Detecta labels/categorias de alimentos (mais rápido que object localization)
    """
    client = vision.ImageAnnotatorClient()
    
    with io.open(imagem_path, 'rb') as image_file:
        content = image_file.read()
    
    image = vision.Image(content=content)
    
    # Label detection (mais rápido, sem bounding boxes)
    response = client.label_detection(image=image)
    labels = response.label_annotations
    
    # Filtrar apenas labels relacionados a alimentos
    food_keywords = ['food', 'dish', 'cuisine', 'ingredient', 'meal', 
                    'fruit', 'vegetable', 'meat', 'dessert', 'drink']
    
    food_labels = []
    for label in labels:
        # Verificar se é relacionado a comida
        if any(keyword in label.description.lower() for keyword in food_keywords):
            food_labels.append({
                'descricao': label.description,
                'confianca': label.score,
                'topicality': label.topicality
            })
    
    return food_labels

# Uso
labels = detectar_labels_alimentos('prato.jpg')
for label in labels:
    print(f"{label['descricao']}: {label['confianca']:.2%}")
```

### **Exemplo 3: OCR para Leitura de Rótulos Nutricionais**

```python
from google.cloud import vision
import re

def ler_rotulo_nutricional(imagem_path):
    """
    Extrai informações nutricionais de rótulos usando OCR
    """
    client = vision.ImageAnnotatorClient()
    
    with io.open(imagem_path, 'rb') as image_file:
        content = image_file.read()
    
    image = vision.Image(content=content)
    
    # Detecção de texto
    response = client.text_detection(image=image)
    texts = response.text_annotations
    
    if not texts:
        return None
    
    # Texto completo
    texto_completo = texts[0].description
    
    # Extrair informações nutricionais com regex
    info_nutricional = {}
    
    # Padrões comuns
    patterns = {
        'calorias': r'(\d+)\s*kcal',
        'proteinas': r'Prote[íi]nas?:?\s*(\d+\.?\d*)g',
        'carboidratos': r'Carboidratos?:?\s*(\d+\.?\d*)g',
        'gorduras': r'Gorduras?:?\s*(\d+\.?\d*)g',
        'fibras': r'Fibras?:?\s*(\d+\.?\d*)g',
        'sodio': r'S[óo]dio:?\s*(\d+\.?\d*)mg'
    }
    
    for chave, pattern in patterns.items():
        match = re.search(pattern, texto_completo, re.IGNORECASE)
        if match:
            info_nutricional[chave] = match.group(1)
    
    return {
        'texto_completo': texto_completo,
        'info_nutricional': info_nutricional,
        'vertices': [
            {'x': vertex.x, 'y': vertex.y}
            for vertex in texts[0].bounding_poly.vertices
        ]
    }

# Uso
rotulo = ler_rotulo_nutricional('rotulo_nutricional.jpg')
print("Informações Nutricionais:")
for chave, valor in rotulo['info_nutricional'].items():
    print(f"  {chave.capitalize()}: {valor}")
```

### **Exemplo 4: Processamento em Lote (Batch Request)**

```python
from google.cloud import vision
from google.cloud.vision_v1 import types
import io

def processar_lote_google_vision(lista_imagens, max_por_batch=16):
    """
    Processar múltiplas imagens em lote para economizar custos
    """
    client = vision.ImageAnnotatorClient()
    
    todos_resultados = []
    
    # Dividir em lotes de no máximo 16 (limite da API)
    for i in range(0, len(lista_imagens), max_por_batch):
        batch = lista_imagens[i:i+max_por_batch]
        
        # Criar requests
        requests = []
        for imagem_path in batch:
            with io.open(imagem_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            
            # Features que queremos detectar
            features = [
                vision.Feature(type_=vision.Feature.Type.OBJECT_LOCALIZATION),
                vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION),
            ]
            
            request = vision.AnnotateImageRequest(
                image=image,
                features=features
            )
            requests.append(request)
        
        # Executar batch
        response = client.batch_annotate_images(requests=requests)
        
        # Processar resultados
        for j, image_response in enumerate(response.responses):
            imagem_path = batch[j]
            
            resultado = {
                'imagem': imagem_path,
                'objetos': [],
                'labels': []
            }
            
            # Objetos
            for obj in image_response.localized_object_annotations:
                resultado['objetos'].append({
                    'nome': obj.name,
                    'confianca': obj.score
                })
            
            # Labels
            for label in image_response.label_annotations:
                resultado['labels'].append({
                    'descricao': label.description,
                    'confianca': label.score
                })
            
            todos_resultados.append(resultado)
    
    return todos_resultados

# Uso
imagens = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg']
resultados = processar_lote_google_vision(imagens)

for r in resultados:
    print(f"\n{r['imagem']}:")
    print(f"  Objetos: {len(r['objetos'])}")
    print(f"  Labels: {len(r['labels'])}")
```

### **Exemplo 5: Integração com Cloud Storage**

```python
from google.cloud import vision
from google.cloud import storage

def detectar_imagens_cloud_storage(bucket_name, prefix=''):
    """
    Detectar alimentos em imagens armazenadas no Google Cloud Storage
    """
    # Clientes
    vision_client = vision.ImageAnnotatorClient()
    storage_client = storage.Client()
    
    # Listar objetos no bucket
    bucket = storage_client.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=prefix)
    
    resultados = []
    
    for blob in blobs:
        # Apenas processar imagens
        if not blob.name.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        
        # Criar image source do GCS
        image = vision.Image()
        image.source.image_uri = f'gs://{bucket_name}/{blob.name}'
        
        # Detectar objetos
        response = vision_client.object_localization(image=image)
        
        objetos = [
            {'nome': obj.name, 'confianca': obj.score}
            for obj in response.localized_object_annotations
        ]
        
        resultados.append({
            'uri': f'gs://{bucket_name}/{blob.name}',
            'objetos': objetos
        })
    
    return resultados

# Uso
resultados = detectar_imagens_cloud_storage('meu-bucket-de-alimentos', 'imagens/')
```

---

## 🔄 Comparação Side-by-Side {#comparacao}

### **Mesmo Task - Ambas as Tecnologias**

```python
import time
from typing import Dict, List

class DetectorAlimentos:
    """
    Classe unificada para detectar alimentos com YOLO ou Google Vision
    """
    
    def __init__(self, metodo='yolo'):
        self.metodo = metodo
        
        if metodo == 'yolo':
            from ultralytics import YOLO
            self.model = YOLO('yolov8n.pt')
        elif metodo == 'google':
            from google.cloud import vision
            self.client = vision.ImageAnnotatorClient()
    
    def detectar(self, imagem_path: str) -> Dict:
        """
        Detecta alimentos na imagem usando o método escolhido
        """
        if self.metodo == 'yolo':
            return self._detectar_yolo(imagem_path)
        elif self.metodo == 'google':
            return self._detectar_google(imagem_path)
    
    def _detectar_yolo(self, imagem_path: str) -> Dict:
        start = time.time()
        results = self.model(imagem_path)
        
        detections = []
        for result in results:
            for box in result.boxes:
                detections.append({
                    'classe': self.model.names[int(box.cls[0])],
                    'confianca': float(box.conf[0])
                })
        
        return {
            'metodo': 'YOLO',
            'deteccoes': detections,
            'latencia_ms': (time.time() - start) * 1000
        }
    
    def _detectar_google(self, imagem_path: str) -> Dict:
        start = time.time()
        
        with open(imagem_path, 'rb') as f:
            content = f.read()
        
        from google.cloud import vision
        image = vision.Image(content=content)
        response = self.client.object_localization(image=image)
        
        detections = [
            {
                'classe': obj.name,
                'confianca': obj.score
            }
            for obj in response.localized_object_annotations
        ]
        
        return {
            'metodo': 'Google Vision',
            'deteccoes': detections,
            'latencia_ms': (time.time() - start) * 1000
        }

# Comparação direta
def comparar_deteccao(imagem_path: str):
    """
    Compara resultados de YOLO e Google Vision na mesma imagem
    """
    # YOLO
    detector_yolo = DetectorAlimentos('yolo')
    resultado_yolo = detector_yolo.detectar(imagem_path)
    
    # Google Vision
    detector_google = DetectorAlimentos('google')
    resultado_google = detector_google.detectar(imagem_path)
    
    # Mostrar comparação
    print("=" * 60)
    print(f"IMAGEM: {imagem_path}")
    print("=" * 60)
    
    print(f"\n📊 YOLO:")
    print(f"  Objetos: {len(resultado_yolo['deteccoes'])}")
    print(f"  Latência: {resultado_yolo['latencia_ms']:.2f}ms")
    for det in resultado_yolo['deteccoes'][:5]:
        print(f"    - {det['classe']}: {det['confianca']:.2%}")
    
    print(f"\n☁️ GOOGLE VISION:")
    print(f"  Objetos: {len(resultado_google['deteccoes'])}")
    print(f"  Latência: {resultado_google['latencia_ms']:.2f}ms")
    for det in resultado_google['deteccoes'][:5]:
        print(f"    - {det['classe']}: {det['confianca']:.2%}")
    
    print(f"\n⚡ DIFERENÇA DE VELOCIDADE:")
    diff = resultado_google['latencia_ms'] - resultado_yolo['latencia_ms']
    print(f"  Google Vision é {diff:.2f}ms mais lento")
    print(f"  YOLO é {diff / resultado_google['latencia_ms'] * 100:.1f}% mais rápido")

# Executar comparação
comparar_deteccao('minha_comida.jpg')
```

---

## 🔀 Implementação Híbrida {#hibrida}

### **Sistema Inteligente com Fallback**

```python
from typing import Dict, Optional
import time

class DetectorHibrido:
    """
    Sistema híbrido que usa YOLO primeiro e Google Vision como fallback
    """
    
    def __init__(self, threshold_confianca=0.75):
        # YOLO (local, rápido)
        from ultralytics import YOLO
        self.model_yolo = YOLO('yolov8n.pt')
        
        # Google Vision (remoto, backup)
        from google.cloud import vision
        self.client_gv = vision.ImageAnnotatorClient()
        
        self.threshold = threshold_confianca
        self.stats = {
            'yolo_usado': 0,
            'google_usado': 0,
            'ambos_usados': 0
        }
    
    def detectar(self, imagem_path: str) -> Dict:
        """
        Detecta alimentos com estratégia híbrida inteligente
        """
        # Passo 1: Tentar YOLO primeiro (rápido, offline)
        resultado_yolo = self._detectar_yolo(imagem_path)
        
        # Verificar confiança
        if resultado_yolo['confianca_maxima'] >= self.threshold:
            self.stats['yolo_usado'] += 1
            resultado_yolo['fonte'] = 'YOLO'
            return resultado_yolo
        
        # Passo 2: Confiança baixa, usar Google Vision
        print(f"⚠️ Confiança baixa ({resultado_yolo['confianca_maxima']:.2%}), "
              f"usando Google Vision...")
        
        try:
            resultado_gv = self._detectar_google_vision(imagem_path)
            self.stats['google_usado'] += 1
            resultado_gv['fonte'] = 'Google Vision (fallback)'
            resultado_gv['yolo_tentou'] = True
            return resultado_gv
        except Exception as e:
            # Se Google Vision falhar (sem internet, etc), usar YOLO mesmo assim
            print(f"❌ Google Vision falhou: {e}")
            print(f"✅ Usando resultado YOLO de baixa confiança")
            resultado_yolo['fonte'] = 'YOLO (fallback)'
            self.stats['ambos_usados'] += 1
            return resultado_yolo
    
    def _detectar_yolo(self, imagem_path: str) -> Dict:
        results = self.model_yolo(imagem_path, verbose=False)
        
        detections = []
        conf_max = 0.0
        
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                detections.append({
                    'classe': self.model_yolo.names[int(box.cls[0])],
                    'confianca': conf
                })
                conf_max = max(conf_max, conf)
        
        return {
            'deteccoes': detections,
            'confianca_maxima': conf_max
        }
    
    def _detectar_google_vision(self, imagem_path: str) -> Dict:
        import io
        from google.cloud import vision
        
        with io.open(imagem_path, 'rb') as f:
            content = f.read()
        
        image = vision.Image(content=content)
        response = self.client_gv.object_localization(image=image)
        
        detections = [
            {
                'classe': obj.name,
                'confianca': obj.score
            }
            for obj in response.localized_object_annotations
        ]
        
        conf_max = max([d['confianca'] for d in detections]) if detections else 0.0
        
        return {
            'deteccoes': detections,
            'confianca_maxima': conf_max
        }
    
    def mostrar_estatisticas(self):
        total = sum(self.stats.values())
        if total == 0:
            print("Nenhuma detecção realizada ainda")
            return
        
        print("\n📊 ESTATÍSTICAS DE USO:")
        print(f"  YOLO sozinho: {self.stats['yolo_usado']} "
              f"({self.stats['yolo_usado']/total*100:.1f}%)")
        print(f"  Google Vision: {self.stats['google_usado']} "
              f"({self.stats['google_usado']/total*100:.1f}%)")
        print(f"  Ambos tentados: {self.stats['ambos_usados']} "
              f"({self.stats['ambos_usados']/total*100:.1f}%)")
        print(f"  Total: {total} detecções")

# Uso
detector = DetectorHibrido(threshold_confianca=0.80)

# Processar várias imagens
imagens = ['img1.jpg', 'img2.jpg', 'img3.jpg']
for img in imagens:
    resultado = detector.detectar(img)
    print(f"\n{img}: {len(resultado['deteccoes'])} objetos "
          f"(fonte: {resultado['fonte']})")

# Ver estatísticas
detector.mostrar_estatisticas()
```

### **Sistema de Cache para Economizar Custos**

```python
import hashlib
import json
import os
from pathlib import Path

class DetectorComCache:
    """
    Detector que usa cache para evitar chamadas repetidas (economiza $$$)
    """
    
    def __init__(self, cache_dir='./cache_detections'):
        from google.cloud import vision
        self.client = vision.ImageAnnotatorClient()
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
    
    def _hash_imagem(self, imagem_path: str) -> str:
        """Gera hash da imagem para cache"""
        with open(imagem_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def _cache_path(self, hash_img: str) -> Path:
        return self.cache_dir / f"{hash_img}.json"
    
    def detectar(self, imagem_path: str, usar_cache=True) -> Dict:
        """
        Detecta com cache inteligente
        """
        # Verificar cache
        if usar_cache:
            hash_img = self._hash_imagem(imagem_path)
            cache_file = self._cache_path(hash_img)
            
            if cache_file.exists():
                print(f"✅ Cache hit! Carregando do cache...")
                with open(cache_file, 'r') as f:
                    resultado = json.load(f)
                    resultado['from_cache'] = True
                    return resultado
        
        # Cache miss - chamar API
        print(f"❌ Cache miss. Chamando Google Vision API...")
        import io
        from google.cloud import vision
        
        with io.open(imagem_path, 'rb') as f:
            content = f.read()
        
        image = vision.Image(content=content)
        response = self.client.object_localization(image=image)
        
        resultado = {
            'deteccoes': [
                {'classe': obj.name, 'confianca': obj.score}
                for obj in response.localized_object_annotations
            ],
            'from_cache': False
        }
        
        # Salvar no cache
        if usar_cache:
            with open(cache_file, 'w') as f:
                json.dump(resultado, f)
            print(f"💾 Resultado salvo no cache")
        
        return resultado

# Uso
detector = DetectorComCache()

# Primeira vez - chama API
resultado1 = detector.detectar('comida.jpg')  # API call ($$$)

# Segunda vez - usa cache
resultado2 = detector.detectar('comida.jpg')  # Free!

print(f"Do cache: {resultado2['from_cache']}")
```

---

## ⚡ Performance Testing {#performance}

### **Benchmark Completo**

```python
import time
import statistics
from typing import List, Dict

class PerformanceBenchmark:
    """
    Classe para fazer benchmark completo de YOLO vs Google Vision
    """
    
    def __init__(self):
        # YOLO
        from ultralytics import YOLO
        self.yolo = YOLO('yolov8n.pt')
        
        # Google Vision
        from google.cloud import vision
        self.gv_client = vision.ImageAnnotatorClient()
    
    def benchmark_yolo(self, imagens: List[str], n_runs=5) -> Dict:
        """
        Benchmark do YOLO
        """
        latencias = []
        total_deteccoes = []
        
        print(f"🚀 Benchmarking YOLO ({n_runs} runs)...")
        
        for run in range(n_runs):
            for img in imagens:
                start = time.time()
                results = self.yolo(img, verbose=False)
                latency = (time.time() - start) * 1000
                
                latencias.append(latency)
                
                n_det = sum(len(r.boxes) for r in results)
                total_deteccoes.append(n_det)
        
        return {
            'metodo': 'YOLO',
            'n_imagens': len(imagens),
            'n_runs': n_runs,
            'latencia_media': statistics.mean(latencias),
            'latencia_mediana': statistics.median(latencias),
            'latencia_min': min(latencias),
            'latencia_max': max(latencias),
            'latencia_std': statistics.stdev(latencias) if len(latencias) > 1 else 0,
            'deteccoes_media': statistics.mean(total_deteccoes),
            'fps_medio': 1000 / statistics.mean(latencias)
        }
    
    def benchmark_google_vision(self, imagens: List[str], n_runs=3) -> Dict:
        """
        Benchmark do Google Vision (menos runs por custo)
        """
        import io
        from google.cloud import vision
        
        latencias = []
        total_deteccoes = []
        
        print(f"☁️ Benchmarking Google Vision ({n_runs} runs)...")
        
        for run in range(n_runs):
            for img in imagens:
                with io.open(img, 'rb') as f:
                    content = f.read()
                
                image = vision.Image(content=content)
                
                start = time.time()
                response = self.gv_client.object_localization(image=image)
                latency = (time.time() - start) * 1000
                
                latencias.append(latency)
                
                n_det = len(response.localized_object_annotations)
                total_deteccoes.append(n_det)
        
        return {
            'metodo': 'Google Vision',
            'n_imagens': len(imagens),
            'n_runs': n_runs,
            'latencia_media': statistics.mean(latencias),
            'latencia_mediana': statistics.median(latencias),
            'latencia_min': min(latencias),
            'latencia_max': max(latencias),
            'latencia_std': statistics.stdev(latencias) if len(latencias) > 1 else 0,
            'deteccoes_media': statistics.mean(total_deteccoes),
            'fps_medio': 1000 / statistics.mean(latencias)
        }
    
    def comparar(self, imagens: List[str]):
        """
        Compara performance de ambos
        """
        # Benchmark YOLO
        resultado_yolo = self.benchmark_yolo(imagens, n_runs=5)
        
        # Benchmark Google Vision
        resultado_gv = self.benchmark_google_vision(imagens, n_runs=3)
        
        # Mostrar resultados
        self._mostrar_resultados(resultado_yolo, resultado_gv)
    
    def _mostrar_resultados(self, yolo: Dict, gv: Dict):
        print("\n" + "=" * 80)
        print("📊 RESULTADOS DO BENCHMARK")
        print("=" * 80)
        
        print(f"\n🚀 YOLO:")
        print(f"  Latência Média: {yolo['latencia_media']:.2f}ms (±{yolo['latencia_std']:.2f}ms)")
        print(f"  Latência Mediana: {yolo['latencia_mediana']:.2f}ms")
        print(f"  Range: {yolo['latencia_min']:.2f}ms - {yolo['latencia_max']:.2f}ms")
        print(f"  FPS Médio: {yolo['fps_medio']:.1f}")
        print(f"  Detecções/Imagem: {yolo['deteccoes_media']:.1f}")
        
        print(f"\n☁️ GOOGLE VISION:")
        print(f"  Latência Média: {gv['latencia_media']:.2f}ms (±{gv['latencia_std']:.2f}ms)")
        print(f"  Latência Mediana: {gv['latencia_mediana']:.2f}ms")
        print(f"  Range: {gv['latencia_min']:.2f}ms - {gv['latencia_max']:.2f}ms")
        print(f"  FPS Médio: {gv['fps_medio']:.1f}")
        print(f"  Detecções/Imagem: {gv['deteccoes_media']:.1f}")
        
        print(f"\n⚡ COMPARAÇÃO:")
        speedup = gv['latencia_media'] / yolo['latencia_media']
        print(f"  YOLO é {speedup:.1f}x mais rápido")
        print(f"  Diferença absoluta: {gv['latencia_media'] - yolo['latencia_media']:.2f}ms")
        
        # Custo estimado
        custo_gv = (gv['n_imagens'] * gv['n_runs']) * 0.0015  # $1.50 per 1000
        print(f"\n💰 CUSTO ESTIMADO (Google Vision):")
        print(f"  Imagens processadas: {gv['n_imagens'] * gv['n_runs']}")
        print(f"  Custo: ${custo_gv:.4f}")
        print(f"  YOLO: $0.00 (modelo local)")

# Executar benchmark
benchmark = PerformanceBenchmark()
imagens_teste = ['teste1.jpg', 'teste2.jpg', 'teste3.jpg']
benchmark.comparar(imagens_teste)
```

---

## 📱 Exemplo Mobile (React Native)

### **YOLO com TensorFlow Lite**

```javascript
// App.js - React Native
import { TensorflowModel } from 'react-native-tensorflow-lite';

class FoodDetector {
  constructor() {
    this.model = null;
  }
  
  async loadModel() {
    this.model = await TensorflowModel.create({
      model: require('./assets/yolov8n.tflite'),
      labels: require('./assets/labels.txt')
    });
  }
  
  async detectFood(imagePath) {
    if (!this.model) {
      await this.loadModel();
    }
    
    const results = await this.model.run(imagePath);
    
    return results.map(r => ({
      classe: r.label,
      confianca: r.confidence,
      bbox: r.boundingBox
    }));
  }
}

// Uso
const detector = new FoodDetector();
const results = await detector.detectFood(photoUri);
console.log('Detectados:', results);
```

### **Google Vision em React Native**

```javascript
import axios from 'axios';

class GoogleVisionDetector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  }
  
  async detectFood(base64Image) {
    const request = {
      requests: [{
        image: { content: base64Image },
        features: [{ type: 'OBJECT_LOCALIZATION' }]
      }]
    };
    
    const response = await axios.post(
      `${this.endpoint}?key=${this.apiKey}`,
      request
    );
    
    return response.data.responses[0].localizedObjectAnnotations.map(obj => ({
      classe: obj.name,
      confianca: obj.score,
      vertices: obj.boundingPoly.normalizedVertices
    }));
  }
}

// Uso
const detector = new GoogleVisionDetector('YOUR_API_KEY');
const results = await detector.detectFood(base64Image);
```

---

## 🎯 Conclusão dos Exemplos

### **Quando usar cada exemplo:**

**YOLO:**
- ✅ Exemplo 1-2: Protótipos e testes rápidos
- ✅ Exemplo 3: Produtos específicos da sua empresa
- ✅ Exemplo 4: Processamento em lote local
- ✅ Exemplo 5: Aplicativos móveis

**Google Vision:**
- ✅ Exemplo 1-2: MVP e validação rápida
- ✅ Exemplo 3: OCR de rótulos nutricionais
- ✅ Exemplo 4-5: Integração com Google Cloud

**Híbrido:**
- ✅ Melhor dos dois mundos
- ✅ Economia de custos
- ✅ Alta disponibilidade

---

**Todos os exemplos estão prontos para uso e podem ser adaptados para suas necessidades específicas!**



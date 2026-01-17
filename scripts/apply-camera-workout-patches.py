#!/usr/bin/env python3
"""
🔧 Camera Workout Patches - Aplicador Automático
Aplica patches de forma segura e versionada para escala enterprise

Uso:
  python scripts/apply-camera-workout-patches.py --dry-run  # Simular
  python scripts/apply-camera-workout-patches.py --apply    # Aplicar
  python scripts/apply-camera-workout-patches.py --rollback # Reverter
"""

import os
import sys
import re
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple

# Cores para output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def log_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def log_warning(msg: str):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def log_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

# Configuração
WORKSPACE_ROOT = Path(__file__).parent.parent
TARGET_FILE = WORKSPACE_ROOT / "src/components/camera-workout/CameraWorkoutScreen.tsx"
BACKUP_DIR = WORKSPACE_ROOT / ".patches" / "backups"
PATCH_VERSION = "v1.0.0"

# Criar diretório de backup
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def create_backup() -> Path:
    """Cria backup do arquivo original"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"CameraWorkoutScreen_{timestamp}.tsx.backup"
    
    if TARGET_FILE.exists():
        shutil.copy2(TARGET_FILE, backup_path)
        log_success(f"Backup criado: {backup_path.name}")
        return backup_path
    else:
        log_error(f"Arquivo não encontrado: {TARGET_FILE}")
        sys.exit(1)

def read_file() -> str:
    """Lê o arquivo alvo"""
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(content: str):
    """Escreve no arquivo alvo"""
    with open(TARGET_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

# ==================== PATCHES ====================

def patch_1_add_imports(content: str) -> Tuple[str, bool]:
    """Patch 1: Adicionar imports necessários"""
    log_info("Aplicando Patch 1: Imports...")
    
    # Verificar se já foi aplicado
    if 'SkeletonOverlay' in content and 'DebugOverlay' in content:
        log_warning("Patch 1 já aplicado")
        return content, False
    
    # Encontrar linha de imports
    import_pattern = r"(import { RepCounterDisplay } from './RepCounterDisplay';)"
    
    new_imports = """import { RepCounterDisplay } from './RepCounterDisplay';
import { FormFeedbackToast } from './FormFeedbackToast';
import { SkeletonOverlay } from './SkeletonOverlay';
import { DebugOverlay } from './DebugOverlay';"""
    
    content = re.sub(import_pattern, new_imports, content)
    
    # Adicionar Keypoint ao tipo
    type_pattern = r"(import type { \n  ExerciseType, \n  WorkoutScreenState,\n  CalibrationData,)"
    
    new_types = """import type { 
  ExerciseType, 
  WorkoutScreenState,
  CalibrationData,
  Keypoint,"""
    
    content = re.sub(type_pattern, new_types, content)
    
    log_success("Patch 1 aplicado: Imports adicionados")
    return content, True

def patch_2_add_states(content: str) -> Tuple[str, bool]:
    """Patch 2: Adicionar novos estados"""
    log_info("Aplicando Patch 2: Estados...")
    
    # Verificar se já foi aplicado
    if 'currentKeypoints' in content:
        log_warning("Patch 2 já aplicado")
        return content, False
    
    # Encontrar onde adicionar estados
    state_pattern = r"(const \[detectionActive, setDetectionActive\] = useState\(false\);)"
    
    new_states = """const [detectionActive, setDetectionActive] = useState(false);

  // ✅ NOVOS ESTADOS PARA ESCALABILIDADE (Patch v1.0.0)
  const [currentKeypoints, setCurrentKeypoints] = useState<Keypoint[]>([]);
  const [currentAngles, setCurrentAngles] = useState<Record<string, number>>({});
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [feedbackQueue, setFeedbackQueue] = useState<Array<{
    message: string;
    type: 'tip' | 'warning' | 'celebration';
    timestamp: number;
  }>>([]);
  const lastRequestTimeRef = useRef<number>(0);"""
    
    content = re.sub(state_pattern, new_states, content)
    
    log_success("Patch 2 aplicado: Estados adicionados")
    return content, True

def patch_3_improve_yolo_processing(content: str) -> Tuple[str, bool]:
    """Patch 3: Melhorar processamento de resultados YOLO"""
    log_info("Aplicando Patch 3: Processamento YOLO...")
    
    # Este patch é mais complexo - vamos adicionar comentários e melhorias
    # Procurar o bloco if (result.success)
    
    pattern = r"if \(result\.success\) \{[\s\S]*?// USAR CONTAGEM DO SERVIDOR YOLO"
    
    replacement = """if (result.success) {
          // ✅ SALVAR KEYPOINTS (Patch v1.0.0)
          if (result.keypoints && result.keypoints.length > 0) {
            setCurrentKeypoints(result.keypoints);
            
            // 📊 MÉTRICA: Confiança média
            const avgConfidence = result.keypoints.reduce((sum, kp) => sum + kp.confidence, 0) / result.keypoints.length;
            if (avgConfidence < 0.5) {
              console.warn('⚠️ Baixa confiança:', avgConfidence.toFixed(2));
            }
          }
          
          // ✅ SALVAR ÂNGULOS
          if (result.angles) {
            setCurrentAngles(result.angles);
          }
          
          // USAR CONTAGEM DO SERVIDOR YOLO"""
    
    if pattern in content:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        log_success("Patch 3 aplicado: Processamento YOLO melhorado")
        return content, True
    else:
        log_warning("Patch 3: Padrão não encontrado, pulando")
        return content, False

def patch_4_add_feedback_queue(content: str) -> Tuple[str, bool]:
    """Patch 4: Sistema de fila de feedback"""
    log_info("Aplicando Patch 4: Fila de feedback...")
    
    # Verificar se já existe
    if 'feedbackQueue' in content and 'useEffect' in content and 'Processa fila' in content:
        log_warning("Patch 4 já aplicado")
        return content, False
    
    # Adicionar após o useEffect de detecção
    pattern = r"(}, \[screenState, detectionActive, captureAndAnalyzeFrame\]\);)"
    
    addition = """},  [screenState, detectionActive, captureAndAnalyzeFrame]);

  /**
   * ✅ SISTEMA DE FILA DE FEEDBACK (Patch v1.0.0)
   * Processa fila de feedback (mostra 1 por vez, 3s cada)
   */
  useEffect(() => {
    if (feedbackQueue.length === 0 || currentFeedback) return;
    
    const nextFeedback = feedbackQueue[0];
    const age = Date.now() - nextFeedback.timestamp;
    
    // Expirar feedbacks antigos (>10s)
    if (age > 10000) {
      setFeedbackQueue(prev => prev.slice(1));
      return;
    }
    
    // Mostrar próximo feedback
    setCurrentFeedback(nextFeedback.message);
    setFeedbackType(nextFeedback.type);
    
    // Auto-dismiss após 3s
    const timer = setTimeout(() => {
      setCurrentFeedback(null);
      setFeedbackQueue(prev => prev.slice(1));
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [feedbackQueue, currentFeedback]);"""
    
    content = re.sub(pattern, addition, content)
    
    log_success("Patch 4 aplicado: Fila de feedback adicionada")
    return content, True

def patch_5_add_rate_limiting(content: str) -> Tuple[str, bool]:
    """Patch 5: Rate limiting para YOLO"""
    log_info("Aplicando Patch 5: Rate limiting...")
    
    # Adicionar no início de captureAndAnalyzeFrame
    pattern = r"(const captureAndAnalyzeFrame = useCallback\(async \(\) => \{)"
    
    addition = """const captureAndAnalyzeFrame = useCallback(async () => {
    // 🛡️ RATE LIMITING: Máximo 15 FPS (Patch v1.0.0)
    const now = Date.now();
    const timeSinceLastRequest = now - (lastRequestTimeRef.current || 0);
    const minInterval = 1000 / 15; // 66ms = 15 FPS
    
    if (timeSinceLastRequest < minInterval) {
      return; // Pular frame
    }
    lastRequestTimeRef.current = now;
    """
    
    content = re.sub(pattern, addition, content)
    
    log_success("Patch 5 aplicado: Rate limiting adicionado")
    return content, True

def patch_6_add_skeleton_overlay(content: str) -> Tuple[str, bool]:
    """Patch 6: Renderizar Skeleton Overlay"""
    log_info("Aplicando Patch 6: Skeleton Overlay...")
    
    # Verificar se já existe
    if 'SkeletonOverlay' in content and 'keypoints={currentKeypoints}' in content:
        log_warning("Patch 6 já aplicado")
        return content, False
    
    # Adicionar após o canvas
    pattern = r"(<canvas ref={canvasRef} className=\"hidden\" />)"
    
    addition = """<canvas ref={canvasRef} className="hidden" />
      
      {/* ✅ SKELETON OVERLAY - Feedback visual (Patch v1.0.0) */}
      {showSkeleton && currentKeypoints.length > 0 && 
       (screenState === 'counting' || screenState === 'paused') && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <SkeletonOverlay
            keypoints={currentKeypoints}
            formScore={formScore}
            showLabels={false}
            animate={true}
          />
        </div>
      )}"""
    
    content = re.sub(pattern, addition, content)
    
    log_success("Patch 6 aplicado: Skeleton Overlay renderizado")
    return content, True

def patch_7_add_debug_overlay(content: str) -> Tuple[str, bool]:
    """Patch 7: Renderizar Debug Overlay"""
    log_info("Aplicando Patch 7: Debug Overlay...")
    
    # Verificar se já existe
    if 'DebugOverlay' in content and 'keypoints={currentKeypoints}' in content:
        log_warning("Patch 7 já aplicado")
        return content, False
    
    # Adicionar antes do fechamento do container
    pattern = r"(      {renderContent\(\)}\n    </div>)"
    
    addition = """      {renderContent()}
      
      {/* ✅ DEBUG OVERLAY - Observabilidade (Patch v1.0.0) */}
      {(screenState === 'counting' || screenState === 'paused') && (
        <DebugOverlay
          keypoints={currentKeypoints}
          angles={currentAngles}
          currentPhase={currentPhase}
          formScore={formScore}
          repCount={repCount}
        />
      )}
    </div>"""
    
    content = re.sub(pattern, addition, content)
    
    log_success("Patch 7 aplicado: Debug Overlay renderizado")
    return content, True

def patch_8_add_skeleton_toggle(content: str) -> Tuple[str, bool]:
    """Patch 8: Botão para toggle skeleton"""
    log_info("Aplicando Patch 8: Toggle Skeleton...")
    
    # Adicionar na barra de ferramentas
    pattern = r"(<Button\n                size=\"icon\"\n                variant=\"secondary\"\n                onClick=\{toggleFullscreen\})"
    
    addition = """<Button
                size="icon"
                variant="secondary"
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={cn(
                  "bg-background/80 backdrop-blur",
                  showSkeleton && "ring-2 ring-primary"
                )}
                title={showSkeleton ? "Ocultar Esqueleto" : "Mostrar Esqueleto"}
              >
                <Target className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={toggleFullscreen}"""
    
    content = re.sub(pattern, addition, content)
    
    log_success("Patch 8 aplicado: Toggle Skeleton adicionado")
    return content, True

# ==================== MAIN ====================

def apply_all_patches(dry_run: bool = False) -> Dict[str, bool]:
    """Aplica todos os patches"""
    log_info(f"{'[DRY RUN] ' if dry_run else ''}Iniciando aplicação de patches...")
    
    if not dry_run:
        backup_path = create_backup()
        log_info(f"Backup salvo em: {backup_path}")
    
    content = read_file()
    results = {}
    
    patches = [
        ("Patch 1: Imports", patch_1_add_imports),
        ("Patch 2: Estados", patch_2_add_states),
        ("Patch 3: YOLO Processing", patch_3_improve_yolo_processing),
        ("Patch 4: Feedback Queue", patch_4_add_feedback_queue),
        ("Patch 5: Rate Limiting", patch_5_add_rate_limiting),
        ("Patch 6: Skeleton Overlay", patch_6_add_skeleton_overlay),
        ("Patch 7: Debug Overlay", patch_7_add_debug_overlay),
        ("Patch 8: Skeleton Toggle", patch_8_add_skeleton_toggle),
    ]
    
    for name, patch_func in patches:
        try:
            content, applied = patch_func(content)
            results[name] = applied
        except Exception as e:
            log_error(f"Erro ao aplicar {name}: {e}")
            results[name] = False
    
    if not dry_run:
        write_file(content)
        log_success("Todos os patches aplicados!")
    else:
        log_info("[DRY RUN] Nenhuma alteração foi feita")
    
    return results

def rollback_patches():
    """Reverte para o backup mais recente"""
    log_info("Procurando backup mais recente...")
    
    backups = sorted(BACKUP_DIR.glob("*.backup"), reverse=True)
    
    if not backups:
        log_error("Nenhum backup encontrado!")
        return
    
    latest_backup = backups[0]
    log_info(f"Backup encontrado: {latest_backup.name}")
    
    confirm = input(f"{Colors.YELLOW}Confirmar rollback? (s/N): {Colors.END}")
    if confirm.lower() != 's':
        log_info("Rollback cancelado")
        return
    
    shutil.copy2(latest_backup, TARGET_FILE)
    log_success(f"Rollback concluído! Restaurado de {latest_backup.name}")

def main():
    """Função principal"""
    print(f"\n{Colors.BOLD}🔧 Camera Workout Patches - Aplicador Automático{Colors.END}")
    print(f"{Colors.BOLD}Versão: {PATCH_VERSION}{Colors.END}\n")
    
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python scripts/apply-camera-workout-patches.py --dry-run   # Simular")
        print("  python scripts/apply-camera-workout-patches.py --apply     # Aplicar")
        print("  python scripts/apply-camera-workout-patches.py --rollback  # Reverter")
        sys.exit(1)
    
    mode = sys.argv[1]
    
    if mode == '--dry-run':
        results = apply_all_patches(dry_run=True)
        print(f"\n{Colors.BOLD}Resumo (Dry Run):{Colors.END}")
        for name, applied in results.items():
            status = "✅ Seria aplicado" if applied else "⏭️  Já aplicado/Pulado"
            print(f"  {status}: {name}")
    
    elif mode == '--apply':
        confirm = input(f"{Colors.YELLOW}Confirmar aplicação de patches? (s/N): {Colors.END}")
        if confirm.lower() != 's':
            log_info("Operação cancelada")
            return
        
        results = apply_all_patches(dry_run=False)
        print(f"\n{Colors.BOLD}Resumo:{Colors.END}")
        for name, applied in results.items():
            status = "✅ Aplicado" if applied else "⏭️  Já aplicado/Pulado"
            print(f"  {status}: {name}")
        
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 Patches aplicados com sucesso!{Colors.END}")
        print(f"{Colors.BLUE}Próximos passos:{Colors.END}")
        print("  1. Testar a aplicação localmente")
        print("  2. Verificar se skeleton overlay aparece")
        print("  3. Testar debug overlay")
        print("  4. Fazer commit das alterações")
    
    elif mode == '--rollback':
        rollback_patches()
    
    else:
        log_error(f"Modo desconhecido: {mode}")
        sys.exit(1)

if __name__ == '__main__':
    main()

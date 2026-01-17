#!/usr/bin/env python3
"""
Análise Completa de Funcionalidades - MaxNutrition
Mapeia todas as funcionalidades do app para testes pré-lançamento
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Set
import json

class AppFeaturesAnalyzer:
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir)
        self.features = {
            "user_features": {},
            "admin_features": {},
            "pages": [],
            "components": [],
            "hooks": [],
            "edge_functions": [],
            "routes": []
        }
        
    def analyze_pages(self):
        """Analisa todas as páginas do app"""
        pages_dir = self.root_dir / "src" / "pages"
        if not pages_dir.exists():
            return
            
        for page_file in pages_dir.glob("*.tsx"):
            page_name = page_file.stem
            
            # Ler conteúdo da página
            try:
                with open(page_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Extrair funcionalidades da página
                features = self.extract_page_features(content, page_name)
                
                page_info = {
                    "name": page_name,
                    "file": str(page_file),
                    "features": features,
                    "is_admin": "admin" in page_name.lower(),
                    "requires_auth": "useAuth" in content or "AuthGuard" in content,
                    "has_forms": "useForm" in content or "onSubmit" in content,
                    "has_api_calls": "useMutation" in content or "useQuery" in content,
                    "has_navigation": "useNavigate" in content or "Link to=" in content
                }
                
                self.features["pages"].append(page_info)
                
            except Exception as e:
                print(f"Erro ao analisar {page_file}: {e}")
    
    def extract_page_features(self, content: str, page_name: str) -> List[str]:
        """Extrai funcionalidades específicas de uma página"""
        features = []
        
        # Padrões de funcionalidades
        patterns = {
            "Login/Logout": r"(login|logout|signin|signout)",
            "Cadastro": r"(signup|register|cadastro)",
            "Dashboard": r"(dashboard|painel)",
            "Perfil": r"(profile|perfil|user.*profile)",
            "Configurações": r"(settings|configurações|config)",
            "Nutrição": r"(nutrition|nutrição|food|meal|sofia)",
            "Exercícios": r"(exercise|exercício|workout|treino)",
            "Saúde": r"(health|saúde|medical|médico|dr.*vital)",
            "Gamificação": r"(points|pontos|xp|level|badge|achievement|ranking)",
            "Desafios": r"(challenge|desafio|mission|missão)",
            "Comunidade": r"(community|comunidade|social|feed|post)",
            "Admin": r"(admin|administr|manage|gerenci)",
            "Relatórios": r"(report|relatório|analytics)",
            "Pagamentos": r"(payment|pagamento|subscription|assinatura)",
            "Notificações": r"(notification|notificação|alert)",
            "Chat/IA": r"(chat|ia|ai|assistant|sofia|vital)"
        }
        
        content_lower = content.lower()
        
        for feature_name, pattern in patterns.items():
            if re.search(pattern, content_lower):
                features.append(feature_name)
        
        return features
    
    def analyze_components(self):
        """Analisa componentes principais"""
        components_dir = self.root_dir / "src" / "components"
        if not components_dir.exists():
            return
        
        # Componentes principais na raiz
        for comp_file in components_dir.glob("*.tsx"):
            comp_name = comp_file.stem
            
            try:
                with open(comp_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                comp_info = {
                    "name": comp_name,
                    "file": str(comp_file),
                    "category": self.categorize_component(comp_name, content),
                    "has_state": "useState" in content,
                    "has_effects": "useEffect" in content,
                    "has_api": "useQuery" in content or "useMutation" in content,
                    "is_form": "useForm" in content or "onSubmit" in content
                }
                
                self.features["components"].append(comp_info)
                
            except Exception as e:
                print(f"Erro ao analisar componente {comp_file}: {e}")
    
    def categorize_component(self, name: str, content: str) -> str:
        """Categoriza um componente"""
        name_lower = name.lower()
        content_lower = content.lower()
        
        if "admin" in name_lower:
            return "Admin"
        elif any(x in name_lower for x in ["auth", "login", "signup"]):
            return "Autenticação"
        elif any(x in name_lower for x in ["dashboard", "home"]):
            return "Dashboard"
        elif any(x in name_lower for x in ["profile", "user"]):
            return "Perfil"
        elif any(x in name_lower for x in ["nutrition", "food", "meal", "sofia"]):
            return "Nutrição"
        elif any(x in name_lower for x in ["exercise", "workout"]):
            return "Exercícios"
        elif any(x in name_lower for x in ["health", "medical", "vital"]):
            return "Saúde"
        elif any(x in name_lower for x in ["challenge", "mission", "gamif"]):
            return "Gamificação"
        elif any(x in name_lower for x in ["community", "social", "feed"]):
            return "Comunidade"
        elif any(x in name_lower for x in ["chat", "ia", "ai"]):
            return "IA/Chat"
        else:
            return "Outros"
    
    def analyze_hooks(self):
        """Analisa hooks customizados"""
        hooks_dir = self.root_dir / "src" / "hooks"
        if not hooks_dir.exists():
            return
        
        for hook_file in hooks_dir.glob("*.ts"):
            hook_name = hook_file.stem
            
            try:
                with open(hook_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                hook_info = {
                    "name": hook_name,
                    "file": str(hook_file),
                    "category": self.categorize_hook(hook_name),
                    "has_api": "useQuery" in content or "useMutation" in content,
                    "has_state": "useState" in content,
                    "exports_functions": len(re.findall(r'export.*function', content))
                }
                
                self.features["hooks"].append(hook_info)
                
            except Exception as e:
                print(f"Erro ao analisar hook {hook_file}: {e}")
    
    def categorize_hook(self, name: str) -> str:
        """Categoriza um hook"""
        name_lower = name.lower()
        
        if "auth" in name_lower:
            return "Autenticação"
        elif "admin" in name_lower:
            return "Admin"
        elif any(x in name_lower for x in ["nutrition", "food", "meal", "sofia"]):
            return "Nutrição"
        elif any(x in name_lower for x in ["exercise", "workout"]):
            return "Exercícios"
        elif any(x in name_lower for x in ["health", "medical", "vital"]):
            return "Saúde"
        elif any(x in name_lower for x in ["gamif", "point", "xp", "challenge"]):
            return "Gamificação"
        elif any(x in name_lower for x in ["community", "social", "feed"]):
            return "Comunidade"
        elif "toast" in name_lower or "modal" in name_lower:
            return "UI"
        else:
            return "Outros"
    
    def analyze_edge_functions(self):
        """Analisa Edge Functions"""
        functions_dir = self.root_dir / "supabase" / "functions"
        if not functions_dir.exists():
            return
        
        for func_dir in functions_dir.iterdir():
            if func_dir.is_dir() and (func_dir / "index.ts").exists():
                func_name = func_dir.name
                
                try:
                    with open(func_dir / "index.ts", 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    func_info = {
                        "name": func_name,
                        "path": str(func_dir),
                        "category": self.categorize_edge_function(func_name),
                        "has_yolo": "yolo" in content.lower(),
                        "has_ai": "gemini" in content.lower() or "openai" in content.lower(),
                        "has_db": "supabase" in content.lower(),
                        "lines": len(content.split('\n'))
                    }
                    
                    self.features["edge_functions"].append(func_info)
                    
                except Exception as e:
                    print(f"Erro ao analisar function {func_dir}: {e}")
    
    def categorize_edge_function(self, name: str) -> str:
        """Categoriza uma Edge Function"""
        name_lower = name.lower()
        
        if "sofia" in name_lower or "food" in name_lower or "nutrition" in name_lower:
            return "Nutrição/Sofia"
        elif "vital" in name_lower or "medical" in name_lower or "exam" in name_lower:
            return "Saúde/Dr.Vital"
        elif "whatsapp" in name_lower:
            return "WhatsApp"
        elif "google-fit" in name_lower:
            return "Google Fit"
        elif "email" in name_lower or "notification" in name_lower:
            return "Notificações"
        elif "admin" in name_lower:
            return "Admin"
        else:
            return "Outros"
    
    def generate_feature_map(self):
        """Gera mapa completo de funcionalidades"""
        
        # Funcionalidades do Usuário
        user_features = {
            "Autenticação": [
                "Login com email/senha",
                "Login com Google OAuth",
                "Cadastro de nova conta",
                "Recuperação de senha",
                "Logout"
            ],
            "Onboarding": [
                "Fluxo de boas-vindas",
                "Preenchimento de dados básicos",
                "Seleção de objetivos",
                "Tutorial inicial"
            ],
            "Dashboard": [
                "Visão geral de saúde",
                "Widgets personalizáveis",
                "Score de saúde",
                "Progresso diário",
                "Ações rápidas"
            ],
            "Perfil": [
                "Visualizar dados pessoais",
                "Editar informações",
                "Alterar foto de perfil",
                "Configurações de privacidade",
                "Histórico de atividades"
            ],
            "Nutrição/Sofia": [
                "Análise de fotos de alimentos",
                "Cálculo nutricional automático",
                "Histórico de refeições",
                "Planos alimentares personalizados",
                "Chat com Sofia (IA nutricionista)",
                "Sugestões de receitas",
                "Tracking de água",
                "Relatórios nutricionais"
            ],
            "Saúde/Dr.Vital": [
                "Upload de exames médicos",
                "Análise automática de exames",
                "Interpretação em linguagem simples",
                "Histórico de exames",
                "Relatórios médicos em PDF",
                "Chat com Dr. Vital",
                "Alertas de saúde",
                "Recomendações médicas"
            ],
            "Exercícios": [
                "Biblioteca de exercícios",
                "Programas de treino",
                "Timer de exercícios",
                "Tracking de atividades",
                "Integração com Google Fit",
                "Análise de performance",
                "Exercícios com câmera (YOLO)"
            ],
            "Gamificação": [
                "Sistema de pontos (XP)",
                "Níveis e progressão",
                "Badges e conquistas",
                "Streaks (dias consecutivos)",
                "Ranking global",
                "Desafios diários",
                "Desafios semanais",
                "Flash challenges",
                "Missões personalizadas"
            ],
            "Comunidade": [
                "Feed social",
                "Posts e stories",
                "Seguir outros usuários",
                "Curtir e comentar",
                "Ranking comunitário",
                "Grupos e desafios em equipe",
                "Mensagens diretas"
            ],
            "Metas": [
                "Criar metas personalizadas",
                "Tracking de progresso",
                "Lembretes automáticos",
                "Celebração de conquistas",
                "Histórico de metas"
            ],
            "Relatórios": [
                "Relatório semanal automático",
                "Análise de progresso",
                "Insights personalizados",
                "Exportação de dados",
                "Compartilhamento de resultados"
            ],
            "Notificações": [
                "Push notifications",
                "Lembretes de refeições",
                "Lembretes de exercícios",
                "Alertas de saúde",
                "Notificações sociais",
                "WhatsApp notifications"
            ],
            "Configurações": [
                "Preferências de notificação",
                "Configurações de privacidade",
                "Tema (claro/escuro)",
                "Idioma",
                "Backup de dados",
                "Exportar dados",
                "Deletar conta"
            ]
        }
        
        # Funcionalidades do Admin
        admin_features = {
            "Dashboard Admin": [
                "Visão geral do sistema",
                "Métricas de usuários",
                "Status de saúde do sistema",
                "Logs de atividade",
                "Alertas de sistema"
            ],
            "Gestão de Usuários": [
                "Lista de usuários",
                "Visualizar perfis",
                "Editar dados de usuários",
                "Suspender/ativar contas",
                "Histórico de atividades",
                "Suporte ao usuário"
            ],
            "Gestão de Conteúdo": [
                "Gerenciar exercícios",
                "Gerenciar receitas",
                "Gerenciar templates de sessões",
                "Gerenciar cursos",
                "Biblioteca de conteúdo",
                "Aprovação de posts"
            ],
            "Configurações de IA": [
                "Configurar modelos de IA",
                "Ajustar prompts",
                "Monitorar uso de IA",
                "Custos de IA",
                "Rate limiting",
                "Fallback models"
            ],
            "Analytics": [
                "Relatórios de uso",
                "Métricas de engajamento",
                "Análise de retenção",
                "Performance de funcionalidades",
                "Custos operacionais",
                "ROI de features"
            ],
            "Sistema": [
                "Logs de sistema",
                "Monitoramento de performance",
                "Backup e restore",
                "Configurações de segurança",
                "Atualizações de sistema",
                "Manutenção programada"
            ],
            "Comunicação": [
                "Envio de notificações em massa",
                "Templates de email",
                "Configuração WhatsApp",
                "Campanhas de marketing",
                "Suporte ao cliente"
            ],
            "Financeiro": [
                "Gestão de assinaturas",
                "Relatórios financeiros",
                "Processamento de pagamentos",
                "Reembolsos",
                "Análise de churn"
            ]
        }
        
        self.features["user_features"] = user_features
        self.features["admin_features"] = admin_features
    
    def generate_test_checklist(self):
        """Gera checklist completo de testes"""
        
        test_checklist = {
            "pre_launch_tests": {
                "authentication": [
                    "✅ Login com email/senha funciona",
                    "✅ Login com Google OAuth funciona",
                    "✅ Cadastro de nova conta funciona",
                    "✅ Recuperação de senha funciona",
                    "✅ Logout funciona corretamente",
                    "✅ Sessão persiste após reload",
                    "✅ Redirecionamento após login funciona",
                    "✅ Proteção de rotas funciona"
                ],
                "onboarding": [
                    "✅ Fluxo de boas-vindas completo",
                    "✅ Preenchimento de dados obrigatórios",
                    "✅ Seleção de objetivos funciona",
                    "✅ Tutorial inicial é exibido",
                    "✅ Skip de etapas opcionais funciona"
                ],
                "dashboard": [
                    "✅ Dashboard carrega corretamente",
                    "✅ Widgets são exibidos",
                    "✅ Score de saúde é calculado",
                    "✅ Dados são atualizados em tempo real",
                    "✅ Ações rápidas funcionam"
                ],
                "nutrition_sofia": [
                    "✅ Upload de foto de alimento funciona",
                    "✅ YOLO detecta alimentos corretamente",
                    "✅ Análise nutricional é precisa",
                    "✅ Sofia responde adequadamente",
                    "✅ Histórico de refeições é salvo",
                    "✅ Planos alimentares são gerados",
                    "✅ Cálculos nutricionais estão corretos",
                    "✅ Tracking de água funciona"
                ],
                "health_drvital": [
                    "✅ Upload de exame médico funciona",
                    "✅ OCR extrai texto corretamente",
                    "✅ Análise de exame é precisa",
                    "✅ Dr. Vital interpreta resultados",
                    "✅ Relatório PDF é gerado",
                    "✅ Histórico de exames é mantido",
                    "✅ Alertas de saúde funcionam"
                ],
                "exercises": [
                    "✅ Biblioteca de exercícios carrega",
                    "✅ Programas de treino funcionam",
                    "✅ Timer de exercícios funciona",
                    "✅ Tracking de atividades funciona",
                    "✅ Integração Google Fit funciona",
                    "✅ Exercícios com câmera funcionam"
                ],
                "gamification": [
                    "✅ Pontos são calculados corretamente",
                    "✅ XP e níveis funcionam",
                    "✅ Badges são desbloqueados",
                    "✅ Streaks são contabilizados",
                    "✅ Ranking é atualizado",
                    "✅ Desafios são criados e completados",
                    "✅ Celebrações funcionam"
                ],
                "community": [
                    "✅ Feed social carrega",
                    "✅ Posts podem ser criados",
                    "✅ Stories funcionam",
                    "✅ Sistema de seguir funciona",
                    "✅ Curtidas e comentários funcionam",
                    "✅ Mensagens diretas funcionam"
                ],
                "admin": [
                    "✅ Dashboard admin carrega",
                    "✅ Gestão de usuários funciona",
                    "✅ Configurações de IA funcionam",
                    "✅ Analytics são exibidos",
                    "✅ Logs de sistema funcionam",
                    "✅ Notificações em massa funcionam"
                ],
                "mobile_pwa": [
                    "✅ PWA instala corretamente",
                    "✅ Funciona offline",
                    "✅ Push notifications funcionam",
                    "✅ Interface mobile é responsiva",
                    "✅ Gestures funcionam",
                    "✅ Câmera funciona no mobile"
                ],
                "performance": [
                    "✅ App carrega em <3 segundos",
                    "✅ Navegação é fluida",
                    "✅ Imagens carregam rapidamente",
                    "✅ APIs respondem em <2 segundos",
                    "✅ Bundle size está otimizado",
                    "✅ Lighthouse score >90"
                ],
                "security": [
                    "✅ Dados sensíveis são protegidos",
                    "✅ RLS policies funcionam",
                    "✅ Uploads são validados",
                    "✅ XSS protection ativa",
                    "✅ CSRF protection ativa",
                    "✅ Rate limiting funciona"
                ]
            }
        }
        
        return test_checklist
    
    def run_analysis(self):
        """Executa análise completa"""
        print("🚀 Iniciando análise completa de funcionalidades...")
        
        print("📄 Analisando páginas...")
        self.analyze_pages()
        
        print("🧩 Analisando componentes...")
        self.analyze_components()
        
        print("🪝 Analisando hooks...")
        self.analyze_hooks()
        
        print("⚡ Analisando Edge Functions...")
        self.analyze_edge_functions()
        
        print("🗺️ Gerando mapa de funcionalidades...")
        self.generate_feature_map()
        
        print("📋 Gerando checklist de testes...")
        test_checklist = self.generate_test_checklist()
        
        return test_checklist
    
    def save_results(self, test_checklist):
        """Salva resultados da análise"""
        
        # Salvar análise completa
        with open('docs/APP_FEATURES_ANALYSIS.json', 'w', encoding='utf-8') as f:
            json.dump(self.features, f, indent=2, ensure_ascii=False)
        
        # Salvar checklist de testes
        with open('docs/PRE_LAUNCH_CHECKLIST.json', 'w', encoding='utf-8') as f:
            json.dump(test_checklist, f, indent=2, ensure_ascii=False)
        
        print("\n✅ Resultados salvos:")
        print("  • docs/APP_FEATURES_ANALYSIS.json")
        print("  • docs/PRE_LAUNCH_CHECKLIST.json")
    
    def print_summary(self):
        """Imprime resumo da análise"""
        print("\n" + "="*80)
        print("📊 RESUMO DA ANÁLISE DE FUNCIONALIDADES")
        print("="*80)
        
        print(f"\n📄 Páginas encontradas: {len(self.features['pages'])}")
        print(f"🧩 Componentes analisados: {len(self.features['components'])}")
        print(f"🪝 Hooks customizados: {len(self.features['hooks'])}")
        print(f"⚡ Edge Functions: {len(self.features['edge_functions'])}")
        
        # Páginas por categoria
        admin_pages = [p for p in self.features['pages'] if p['is_admin']]
        user_pages = [p for p in self.features['pages'] if not p['is_admin']]
        
        print(f"\n📊 Distribuição:")
        print(f"  • Páginas de usuário: {len(user_pages)}")
        print(f"  • Páginas de admin: {len(admin_pages)}")
        
        # Componentes por categoria
        comp_categories = {}
        for comp in self.features['components']:
            cat = comp['category']
            comp_categories[cat] = comp_categories.get(cat, 0) + 1
        
        print(f"\n🧩 Componentes por categoria:")
        for cat, count in sorted(comp_categories.items()):
            print(f"  • {cat}: {count}")
        
        # Edge Functions por categoria
        func_categories = {}
        for func in self.features['edge_functions']:
            cat = func['category']
            func_categories[cat] = func_categories.get(cat, 0) + 1
        
        print(f"\n⚡ Edge Functions por categoria:")
        for cat, count in sorted(func_categories.items()):
            print(f"  • {cat}: {count}")
        
        print("\n" + "="*80)

def main():
    analyzer = AppFeaturesAnalyzer()
    test_checklist = analyzer.run_analysis()
    analyzer.save_results(test_checklist)
    analyzer.print_summary()
    
    print("\n✨ Análise completa finalizada!")
    print("\n📋 Próximos passos:")
    print("  1. Revisar docs/APP_FEATURES_ANALYSIS.json")
    print("  2. Usar docs/PRE_LAUNCH_CHECKLIST.json para testes")
    print("  3. Executar todos os testes antes do lançamento")

if __name__ == "__main__":
    main()
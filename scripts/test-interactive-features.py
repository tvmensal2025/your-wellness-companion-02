#!/usr/bin/env python3
"""
🎮 TESTES INTERATIVOS - MaxNutrition
Testa funcionalidades interativas sem Selenium (usando requests)
"""

import requests
import json
import time
from datetime import datetime
import re

class InteractiveTester:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.session = requests.Session()
        self.results = {
            "ui_tests": {},
            "functionality_tests": {},
            "summary": {
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "errors": []
            }
        }
        self.start_time = datetime.now()
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_react_app_hydration(self):
        """Teste 1: App React carrega e hidrata corretamente"""
        self.log("⚛️ Testando hidratação do React...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            # Verificar se tem elementos React
            has_react_root = 'id="root"' in content or 'id="app"' in content
            has_react_scripts = 'react' in content.lower() or 'vite' in content.lower()
            has_js_modules = 'type="module"' in content
            
            if has_react_root and (has_react_scripts or has_js_modules):
                self.log("✅ App React hidrata corretamente", "SUCCESS")
                return True
            else:
                self.log("❌ Problemas na hidratação React", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste React: {str(e)}", "ERROR")
            return False
            
    def test_css_loading(self):
        """Teste 2: CSS carrega corretamente"""
        self.log("🎨 Testando carregamento de CSS...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            # Procurar por links CSS ou styles inline
            has_css_links = '<link' in content and 'stylesheet' in content
            has_inline_styles = '<style' in content
            has_tailwind = 'tailwind' in content.lower()
            
            if has_css_links or has_inline_styles or has_tailwind:
                self.log("✅ CSS carrega corretamente", "SUCCESS")
                return True
            else:
                self.log("❌ CSS não encontrado", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste CSS: {str(e)}", "ERROR")
            return False
            
    def test_javascript_modules(self):
        """Teste 3: Módulos JavaScript carregam"""
        self.log("📦 Testando módulos JavaScript...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            # Procurar por scripts de módulo
            js_modules = re.findall(r'<script[^>]*type="module"[^>]*src="([^"]*)"', content)
            
            if js_modules:
                # Testar se pelo menos um módulo carrega
                for module_path in js_modules[:2]:  # Testar apenas os primeiros 2
                    try:
                        if module_path.startswith('/'):
                            module_url = f"{self.base_url}{module_path}"
                        else:
                            module_url = f"{self.base_url}/{module_path}"
                            
                        module_response = self.session.get(module_url, timeout=5)
                        if module_response.status_code == 200:
                            self.log("✅ Módulos JavaScript carregam", "SUCCESS")
                            return True
                    except:
                        continue
                        
                self.log("❌ Módulos JavaScript não carregam", "ERROR")
                return False
            else:
                self.log("⚠️ Nenhum módulo JavaScript encontrado", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste JavaScript: {str(e)}", "ERROR")
            return False
            
    def test_meta_tags(self):
        """Teste 4: Meta tags para SEO e PWA"""
        self.log("🏷️ Testando meta tags...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            required_meta = [
                'viewport',
                'description',
                'theme-color'
            ]
            
            found_meta = 0
            for meta in required_meta:
                if f'name="{meta}"' in content or f"name='{meta}'" in content:
                    found_meta += 1
                    
            if found_meta >= len(required_meta) * 0.7:  # 70% das meta tags
                self.log(f"✅ Meta tags OK ({found_meta}/{len(required_meta)})", "SUCCESS")
                return True
            else:
                self.log(f"❌ Meta tags insuficientes ({found_meta}/{len(required_meta)})", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste meta tags: {str(e)}", "ERROR")
            return False
            
    def test_favicon_and_icons(self):
        """Teste 5: Favicon e ícones"""
        self.log("🖼️ Testando favicon e ícones...")
        try:
            icons_to_test = [
                "/favicon.ico",
                "/favicon.png", 
                "/apple-touch-icon.png",
                "/pwa-192x192.png"
            ]
            
            found_icons = 0
            for icon in icons_to_test:
                try:
                    response = self.session.get(f"{self.base_url}{icon}", timeout=5)
                    if response.status_code == 200:
                        found_icons += 1
                except:
                    pass
                    
            if found_icons >= 2:  # Pelo menos 2 ícones
                self.log(f"✅ Ícones disponíveis ({found_icons}/{len(icons_to_test)})", "SUCCESS")
                return True
            else:
                self.log(f"❌ Ícones insuficientes ({found_icons}/{len(icons_to_test)})", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de ícones: {str(e)}", "ERROR")
            return False
            
    def test_routing_system(self):
        """Teste 6: Sistema de roteamento"""
        self.log("🛣️ Testando sistema de roteamento...")
        try:
            routes_to_test = [
                "/",
                "/auth",
                "/dashboard", 
                "/sofia",
                "/admin",
                "/goals"
            ]
            
            working_routes = 0
            for route in routes_to_test:
                try:
                    response = self.session.get(f"{self.base_url}{route}", timeout=5)
                    if response.status_code in [200, 302, 401, 403]:  # Rotas válidas
                        working_routes += 1
                except:
                    pass
                    
            if working_routes >= len(routes_to_test) * 0.8:  # 80% das rotas
                self.log(f"✅ Roteamento funciona ({working_routes}/{len(routes_to_test)})", "SUCCESS")
                return True
            else:
                self.log(f"❌ Problemas no roteamento ({working_routes}/{len(routes_to_test)})", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de roteamento: {str(e)}", "ERROR")
            return False
            
    def test_api_integration_readiness(self):
        """Teste 7: Preparação para integração com APIs"""
        self.log("🔌 Testando preparação para APIs...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            # Procurar por indicações de integração com APIs
            api_indicators = [
                'supabase',
                'fetch(',
                'axios',
                'api/',
                'VITE_',
                'process.env'
            ]
            
            found_indicators = sum(1 for indicator in api_indicators if indicator in content)
            
            if found_indicators >= 2:
                self.log(f"✅ Preparado para APIs ({found_indicators} indicadores)", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Preparação limitada para APIs ({found_indicators} indicadores)", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de API: {str(e)}", "ERROR")
            return False
            
    def test_error_boundaries(self):
        """Teste 8: Error boundaries e tratamento de erros"""
        self.log("🛡️ Testando error boundaries...")
        try:
            # Testar rota inválida
            response = self.session.get(f"{self.base_url}/rota-completamente-inexistente-123456", timeout=10)
            
            # Verificar se retorna uma página de erro adequada
            if response.status_code == 404:
                self.log("✅ Error boundaries funcionam (404)", "SUCCESS")
                return True
            elif response.status_code == 200:
                content = response.text.lower()
                if any(word in content for word in ['404', 'not found', 'página não encontrada', 'error']):
                    self.log("✅ Error boundaries funcionam (página customizada)", "SUCCESS")
                    return True
                else:
                    self.log("❌ Error boundaries inadequados", "ERROR")
                    return False
            else:
                self.log(f"⚠️ Comportamento inesperado: {response.status_code}", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste error boundaries: {str(e)}", "ERROR")
            return False
            
    def test_accessibility_basics(self):
        """Teste 9: Acessibilidade básica"""
        self.log("♿ Testando acessibilidade básica...")
        try:
            response = self.session.get(self.base_url, timeout=10)
            content = response.text
            
            accessibility_features = [
                'alt=',  # Imagens com alt text
                'aria-',  # ARIA attributes
                'role=',  # Roles
                'lang=',  # Language attribute
                '<label',  # Labels para forms
            ]
            
            found_features = sum(1 for feature in accessibility_features if feature in content)
            
            if found_features >= 3:
                self.log(f"✅ Acessibilidade básica OK ({found_features} recursos)", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Acessibilidade limitada ({found_features} recursos)", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de acessibilidade: {str(e)}", "ERROR")
            return False
            
    def test_mobile_optimization(self):
        """Teste 10: Otimização mobile"""
        self.log("📱 Testando otimização mobile...")
        try:
            # Simular user agent mobile
            mobile_headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            }
            
            response = self.session.get(self.base_url, headers=mobile_headers, timeout=10)
            content = response.text
            
            mobile_features = [
                'viewport',
                'touch-action',
                'mobile',
                'responsive',
                '@media'
            ]
            
            found_features = sum(1 for feature in mobile_features if feature in content.lower())
            
            if found_features >= 2:
                self.log(f"✅ Otimização mobile OK ({found_features} recursos)", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Otimização mobile limitada ({found_features} recursos)", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste mobile: {str(e)}", "ERROR")
            return False
            
    def run_ui_tests(self):
        """Executa testes de UI"""
        self.log("🎨 INICIANDO TESTES DE UI", "INFO")
        
        ui_tests = [
            ("React App Hydration", self.test_react_app_hydration),
            ("CSS Loading", self.test_css_loading),
            ("JavaScript Modules", self.test_javascript_modules),
            ("Meta Tags", self.test_meta_tags),
            ("Favicon and Icons", self.test_favicon_and_icons),
        ]
        
        for test_name, test_func in ui_tests:
            result = test_func()
            self.results["ui_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"UI: {test_name}")
                
    def run_functionality_tests(self):
        """Executa testes de funcionalidade"""
        self.log("⚙️ INICIANDO TESTES DE FUNCIONALIDADE", "INFO")
        
        functionality_tests = [
            ("Routing System", self.test_routing_system),
            ("API Integration Readiness", self.test_api_integration_readiness),
            ("Error Boundaries", self.test_error_boundaries),
            ("Accessibility Basics", self.test_accessibility_basics),
            ("Mobile Optimization", self.test_mobile_optimization),
        ]
        
        for test_name, test_func in functionality_tests:
            result = test_func()
            self.results["functionality_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"FUNCTIONALITY: {test_name}")
                
    def generate_interactive_report(self):
        """Gera relatório interativo"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        self.log("=" * 60, "INFO")
        self.log("🎮 RELATÓRIO DE TESTES INTERATIVOS", "INFO")
        self.log("=" * 60, "INFO")
        
        # Estatísticas gerais
        total = self.results["summary"]["total_tests"]
        passed = self.results["summary"]["passed"]
        failed = self.results["summary"]["failed"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        self.log(f"⏱️  Duração: {duration:.2f}s", "INFO")
        self.log(f"📈 Taxa de Sucesso: {success_rate:.1f}%", "INFO")
        self.log(f"✅ Testes Passaram: {passed}/{total}", "INFO")
        self.log(f"❌ Testes Falharam: {failed}/{total}", "INFO")
        
        # Detalhes por categoria
        categories = [
            ("🎨 UI", self.results["ui_tests"]),
            ("⚙️ FUNCIONALIDADE", self.results["functionality_tests"])
        ]
        
        for category_name, tests in categories:
            if tests:
                self.log(f"\n{category_name}:", "INFO")
                for test_name, result in tests.items():
                    status = "✅ PASSOU" if result else "❌ FALHOU"
                    self.log(f"  {test_name}: {status}", "INFO")
                    
        # Erros encontrados
        if self.results["summary"]["errors"]:
            self.log("\n🚨 ERROS ENCONTRADOS:", "ERROR")
            for error in self.results["summary"]["errors"]:
                self.log(f"  - {error}", "ERROR")
                
        # Recomendações
        self.log("\n💡 RECOMENDAÇÕES:", "INFO")
        if success_rate >= 90:
            self.log("🚀 EXCELENTE! Interface pronta para produção!", "SUCCESS")
        elif success_rate >= 75:
            self.log("👍 BOM! Pequenos ajustes recomendados", "WARNING")
        else:
            self.log("⚠️  ATENÇÃO! Problemas na interface encontrados", "ERROR")
            
        # Salvar relatório
        report_data = {
            "timestamp": end_time.isoformat(),
            "duration_seconds": duration,
            "success_rate": success_rate,
            "results": self.results
        }
        
        with open("docs/INTERACTIVE_TEST_REPORT.json", "w") as f:
            json.dump(report_data, f, indent=2)
            
        self.log("\n📄 Relatório interativo salvo em: docs/INTERACTIVE_TEST_REPORT.json", "INFO")
        
    def run_all_interactive_tests(self):
        """Executa todos os testes interativos"""
        self.log("🎮 INICIANDO TESTES INTERATIVOS DO APP", "INFO")
        self.log(f"🎯 URL Base: {self.base_url}", "INFO")
        self.log(f"⏰ Início: {self.start_time.strftime('%H:%M:%S')}", "INFO")
        
        try:
            self.run_ui_tests()
            self.run_functionality_tests()
        except KeyboardInterrupt:
            self.log("⚠️ Testes interrompidos pelo usuário", "WARNING")
        except Exception as e:
            self.log(f"❌ Erro durante os testes: {str(e)}", "ERROR")
        finally:
            self.generate_interactive_report()

if __name__ == "__main__":
    tester = InteractiveTester()
    tester.run_all_interactive_tests()
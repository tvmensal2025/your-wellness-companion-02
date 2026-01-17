#!/usr/bin/env python3
"""
🚀 TESTE COMPLETO DO APP - MaxNutrition
Executa todos os testes críticos, importantes e opcionais
"""

import requests
import json
import time
import sys
from datetime import datetime
import os

# Configurações
BASE_URL = "http://localhost:8080"
API_BASE = "https://your-supabase-url.supabase.co"  # Será detectado automaticamente
TIMEOUT = 10

class AppTester:
    def __init__(self):
        self.results = {
            "critical_tests": {},
            "important_tests": {},
            "optional_tests": {},
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
        
    def test_app_loading(self):
        """Teste 1: App carrega corretamente"""
        self.log("🔍 Testando carregamento do app...")
        try:
            response = requests.get(BASE_URL, timeout=TIMEOUT)
            if response.status_code == 200 and "MaxNutrition" in response.text:
                self.log("✅ App carrega corretamente", "SUCCESS")
                return True
            else:
                self.log(f"❌ App não carregou corretamente: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro ao carregar app: {str(e)}", "ERROR")
            return False
            
    def test_auth_page(self):
        """Teste 2: Página de autenticação"""
        self.log("🔍 Testando página de autenticação...")
        try:
            response = requests.get(f"{BASE_URL}/auth", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página de auth carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página de auth falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página de auth: {str(e)}", "ERROR")
            return False
            
    def test_dashboard_redirect(self):
        """Teste 3: Dashboard redireciona para auth (sem login)"""
        self.log("🔍 Testando redirecionamento do dashboard...")
        try:
            response = requests.get(f"{BASE_URL}/dashboard", timeout=TIMEOUT, allow_redirects=False)
            # Deve retornar 302 ou similar para redirecionamento
            if response.status_code in [302, 301, 307, 308]:
                self.log("✅ Dashboard redireciona corretamente", "SUCCESS")
                return True
            else:
                # Verificar se carrega página de auth
                response = requests.get(f"{BASE_URL}/dashboard", timeout=TIMEOUT)
                if "auth" in response.url.lower() or "login" in response.text.lower():
                    self.log("✅ Dashboard redireciona para auth", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Dashboard não redireciona: {response.status_code}", "ERROR")
                    return False
        except Exception as e:
            self.log(f"❌ Erro no teste de redirecionamento: {str(e)}", "ERROR")
            return False
            
    def test_sofia_page(self):
        """Teste 4: Página da Sofia"""
        self.log("🔍 Testando página da Sofia...")
        try:
            response = requests.get(f"{BASE_URL}/sofia", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página da Sofia carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página da Sofia falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página da Sofia: {str(e)}", "ERROR")
            return False
            
    def test_dr_vital_page(self):
        """Teste 5: Página do Dr. Vital"""
        self.log("🔍 Testando página do Dr. Vital...")
        try:
            response = requests.get(f"{BASE_URL}/dr-vital", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página do Dr. Vital carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página do Dr. Vital falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página do Dr. Vital: {str(e)}", "ERROR")
            return False
            
    def test_admin_page(self):
        """Teste 6: Página Admin"""
        self.log("🔍 Testando página Admin...")
        try:
            response = requests.get(f"{BASE_URL}/admin", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página Admin carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página Admin falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página Admin: {str(e)}", "ERROR")
            return False
            
    def test_google_fit_page(self):
        """Teste 7: Página Google Fit"""
        self.log("🔍 Testando página Google Fit...")
        try:
            response = requests.get(f"{BASE_URL}/google-fit", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página Google Fit carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página Google Fit falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página Google Fit: {str(e)}", "ERROR")
            return False
            
    def test_challenges_page(self):
        """Teste 8: Página de Desafios"""
        self.log("🔍 Testando página de Desafios...")
        try:
            response = requests.get(f"{BASE_URL}/challenges", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página de Desafios carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página de Desafios falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página de Desafios: {str(e)}", "ERROR")
            return False
            
    def test_goals_page(self):
        """Teste 9: Página de Metas"""
        self.log("🔍 Testando página de Metas...")
        try:
            response = requests.get(f"{BASE_URL}/goals", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página de Metas carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página de Metas falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página de Metas: {str(e)}", "ERROR")
            return False
            
    def test_install_page(self):
        """Teste 10: Página de Instalação (PWA)"""
        self.log("🔍 Testando página de Instalação PWA...")
        try:
            response = requests.get(f"{BASE_URL}/install", timeout=TIMEOUT)
            if response.status_code == 200:
                self.log("✅ Página de Instalação carrega", "SUCCESS")
                return True
            else:
                self.log(f"❌ Página de Instalação falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro na página de Instalação: {str(e)}", "ERROR")
            return False
            
    def test_performance(self):
        """Teste 11: Performance - Tempo de resposta"""
        self.log("🔍 Testando performance...")
        try:
            start_time = time.time()
            response = requests.get(BASE_URL, timeout=TIMEOUT)
            end_time = time.time()
            
            response_time = end_time - start_time
            if response_time < 3.0:  # Menos de 3 segundos
                self.log(f"✅ Performance OK: {response_time:.2f}s", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Performance lenta: {response_time:.2f}s", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de performance: {str(e)}", "ERROR")
            return False
            
    def test_manifest_pwa(self):
        """Teste 12: Manifest PWA"""
        self.log("🔍 Testando manifest PWA...")
        try:
            response = requests.get(f"{BASE_URL}/manifest.json", timeout=TIMEOUT)
            if response.status_code == 200:
                manifest = response.json()
                if "name" in manifest and "icons" in manifest:
                    self.log("✅ Manifest PWA válido", "SUCCESS")
                    return True
                else:
                    self.log("❌ Manifest PWA inválido", "ERROR")
                    return False
            else:
                self.log(f"❌ Manifest não encontrado: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no manifest PWA: {str(e)}", "ERROR")
            return False
            
    def test_static_assets(self):
        """Teste 13: Assets estáticos"""
        self.log("🔍 Testando assets estáticos...")
        assets_to_test = [
            "/logo-light.png",
            "/logo-dark.png", 
            "/favicon.png",
            "/pwa-192x192.png"
        ]
        
        passed = 0
        for asset in assets_to_test:
            try:
                response = requests.get(f"{BASE_URL}{asset}", timeout=TIMEOUT)
                if response.status_code == 200:
                    passed += 1
            except:
                pass
                
        if passed >= len(assets_to_test) * 0.75:  # 75% dos assets
            self.log(f"✅ Assets estáticos OK ({passed}/{len(assets_to_test)})", "SUCCESS")
            return True
        else:
            self.log(f"❌ Assets estáticos faltando ({passed}/{len(assets_to_test)})", "ERROR")
            return False
            
    def run_critical_tests(self):
        """Executa testes críticos"""
        self.log("🔴 INICIANDO TESTES CRÍTICOS", "INFO")
        
        critical_tests = [
            ("App Loading", self.test_app_loading),
            ("Auth Page", self.test_auth_page),
            ("Dashboard Redirect", self.test_dashboard_redirect),
            ("Sofia Page", self.test_sofia_page),
            ("Dr. Vital Page", self.test_dr_vital_page),
        ]
        
        for test_name, test_func in critical_tests:
            result = test_func()
            self.results["critical_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"CRITICAL: {test_name}")
                
    def run_important_tests(self):
        """Executa testes importantes"""
        self.log("🟡 INICIANDO TESTES IMPORTANTES", "INFO")
        
        important_tests = [
            ("Admin Page", self.test_admin_page),
            ("Google Fit Page", self.test_google_fit_page),
            ("Performance", self.test_performance),
            ("PWA Manifest", self.test_manifest_pwa),
        ]
        
        for test_name, test_func in important_tests:
            result = test_func()
            self.results["important_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"IMPORTANT: {test_name}")
                
    def run_optional_tests(self):
        """Executa testes opcionais"""
        self.log("🟢 INICIANDO TESTES OPCIONAIS", "INFO")
        
        optional_tests = [
            ("Challenges Page", self.test_challenges_page),
            ("Goals Page", self.test_goals_page),
            ("Install Page", self.test_install_page),
            ("Static Assets", self.test_static_assets),
        ]
        
        for test_name, test_func in optional_tests:
            result = test_func()
            self.results["optional_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"OPTIONAL: {test_name}")
                
    def generate_report(self):
        """Gera relatório final"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        self.log("=" * 60, "INFO")
        self.log("📊 RELATÓRIO FINAL DE TESTES", "INFO")
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
            ("🔴 CRÍTICOS", self.results["critical_tests"]),
            ("🟡 IMPORTANTES", self.results["important_tests"]),
            ("🟢 OPCIONAIS", self.results["optional_tests"])
        ]
        
        for category_name, tests in categories:
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
            self.log("🚀 EXCELENTE! App pronto para lançamento!", "SUCCESS")
        elif success_rate >= 75:
            self.log("👍 BOM! Corrija os erros críticos antes do lançamento", "WARNING")
        else:
            self.log("⚠️  ATENÇÃO! Muitos problemas encontrados", "ERROR")
            
        # Salvar relatório
        report_data = {
            "timestamp": end_time.isoformat(),
            "duration_seconds": duration,
            "success_rate": success_rate,
            "results": self.results
        }
        
        with open("docs/TEST_REPORT.json", "w") as f:
            json.dump(report_data, f, indent=2)
            
        self.log("\n📄 Relatório salvo em: docs/TEST_REPORT.json", "INFO")
        
    def run_all_tests(self):
        """Executa todos os testes"""
        self.log("🚀 INICIANDO TESTES COMPLETOS DO APP", "INFO")
        self.log(f"🎯 URL Base: {BASE_URL}", "INFO")
        self.log(f"⏰ Início: {self.start_time.strftime('%H:%M:%S')}", "INFO")
        
        try:
            self.run_critical_tests()
            self.run_important_tests() 
            self.run_optional_tests()
        except KeyboardInterrupt:
            self.log("⚠️ Testes interrompidos pelo usuário", "WARNING")
        except Exception as e:
            self.log(f"❌ Erro durante os testes: {str(e)}", "ERROR")
        finally:
            self.generate_report()

if __name__ == "__main__":
    tester = AppTester()
    tester.run_all_tests()
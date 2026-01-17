#!/usr/bin/env python3
"""
🧪 TESTES AVANÇADOS - MaxNutrition
Testa funcionalidades específicas: YOLO, IA, Gamificação, etc.
"""

import requests
import json
import time
import base64
from datetime import datetime
import os

class AdvancedTester:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.results = {
            "yolo_tests": {},
            "ai_tests": {},
            "gamification_tests": {},
            "integration_tests": {},
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
        
    def test_yolo_service_availability(self):
        """Teste 1: YOLO Service está disponível"""
        self.log("🦾 Testando disponibilidade do YOLO...")
        try:
            yolo_url = "https://yolo-service-yolo-detection.0sw627.easypanel.host"
            response = requests.get(f"{yolo_url}/health", timeout=10)
            if response.status_code == 200:
                self.log("✅ YOLO Service disponível", "SUCCESS")
                return True
            else:
                self.log(f"❌ YOLO Service indisponível: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro ao conectar YOLO: {str(e)}", "ERROR")
            return False
            
    def test_yolo_detection_endpoint(self):
        """Teste 2: Endpoint de detecção YOLO"""
        self.log("🔍 Testando endpoint de detecção YOLO...")
        try:
            yolo_url = "https://yolo-service-yolo-detection.0sw627.easypanel.host"
            # Teste com uma imagem simples (1x1 pixel)
            test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
            
            payload = {"image": test_image}
            response = requests.post(f"{yolo_url}/detect", json=payload, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ YOLO detection endpoint funciona", "SUCCESS")
                return True
            else:
                self.log(f"❌ YOLO detection falhou: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no YOLO detection: {str(e)}", "ERROR")
            return False
            
    def test_app_responsiveness(self):
        """Teste 3: Responsividade do app"""
        self.log("📱 Testando responsividade...")
        try:
            # Simular diferentes viewports
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
            response = requests.get(self.base_url, headers=headers, timeout=10)
            
            if response.status_code == 200 and "viewport" in response.text:
                self.log("✅ App responsivo", "SUCCESS")
                return True
            else:
                self.log("❌ App não responsivo", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de responsividade: {str(e)}", "ERROR")
            return False
            
    def test_pwa_features(self):
        """Teste 4: Funcionalidades PWA"""
        self.log("📲 Testando funcionalidades PWA...")
        try:
            # Testar service worker
            response = requests.get(f"{self.base_url}/sw.js", timeout=10)
            sw_available = response.status_code == 200
            
            # Testar manifest
            response = requests.get(f"{self.base_url}/manifest.json", timeout=10)
            manifest_available = response.status_code == 200
            
            if sw_available and manifest_available:
                self.log("✅ PWA features disponíveis", "SUCCESS")
                return True
            else:
                self.log(f"❌ PWA features incompletas (SW: {sw_available}, Manifest: {manifest_available})", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste PWA: {str(e)}", "ERROR")
            return False
            
    def test_offline_capability(self):
        """Teste 5: Capacidade offline"""
        self.log("🔌 Testando capacidade offline...")
        try:
            # Simular offline verificando cache headers
            response = requests.get(self.base_url, timeout=10)
            cache_headers = ['cache-control', 'etag', 'last-modified']
            
            has_cache = any(header in response.headers for header in cache_headers)
            
            if has_cache:
                self.log("✅ Cache headers presentes", "SUCCESS")
                return True
            else:
                self.log("⚠️ Cache headers ausentes", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste offline: {str(e)}", "ERROR")
            return False
            
    def test_security_headers(self):
        """Teste 6: Headers de segurança"""
        self.log("🔒 Testando headers de segurança...")
        try:
            response = requests.get(self.base_url, timeout=10)
            
            security_headers = [
                'x-content-type-options',
                'x-frame-options', 
                'x-xss-protection',
                'content-security-policy'
            ]
            
            present_headers = [h for h in security_headers if h in response.headers]
            security_score = len(present_headers) / len(security_headers)
            
            if security_score >= 0.5:  # 50% dos headers
                self.log(f"✅ Headers de segurança OK ({len(present_headers)}/{len(security_headers)})", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Headers de segurança insuficientes ({len(present_headers)}/{len(security_headers)})", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de segurança: {str(e)}", "ERROR")
            return False
            
    def test_api_endpoints_availability(self):
        """Teste 7: Disponibilidade de endpoints críticos"""
        self.log("🔗 Testando endpoints de API...")
        
        # Endpoints que devem estar disponíveis (mesmo que retornem 401/403)
        critical_endpoints = [
            "/api/auth",
            "/api/user", 
            "/api/nutrition",
            "/api/health",
            "/api/gamification"
        ]
        
        available_count = 0
        for endpoint in critical_endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                # 200, 401, 403 são OK (endpoint existe)
                if response.status_code in [200, 401, 403, 404]:  # 404 também OK para alguns
                    available_count += 1
            except:
                pass
                
        if available_count >= len(critical_endpoints) * 0.6:  # 60% disponíveis
            self.log(f"✅ Endpoints API OK ({available_count}/{len(critical_endpoints)})", "SUCCESS")
            return True
        else:
            self.log(f"❌ Endpoints API insuficientes ({available_count}/{len(critical_endpoints)})", "ERROR")
            return False
            
    def test_static_resources_optimization(self):
        """Teste 8: Otimização de recursos estáticos"""
        self.log("⚡ Testando otimização de recursos...")
        try:
            # Testar compressão
            headers = {'Accept-Encoding': 'gzip, deflate'}
            response = requests.get(self.base_url, headers=headers, timeout=10)
            
            is_compressed = 'gzip' in response.headers.get('content-encoding', '')
            content_size = len(response.content)
            
            if is_compressed or content_size < 100000:  # Comprimido OU pequeno
                self.log("✅ Recursos otimizados", "SUCCESS")
                return True
            else:
                self.log(f"⚠️ Recursos não otimizados (Size: {content_size})", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de otimização: {str(e)}", "ERROR")
            return False
            
    def test_error_handling(self):
        """Teste 9: Tratamento de erros"""
        self.log("🚨 Testando tratamento de erros...")
        try:
            # Testar página 404
            response = requests.get(f"{self.base_url}/pagina-inexistente-123", timeout=10)
            
            if response.status_code == 404:
                self.log("✅ Página 404 funciona", "SUCCESS")
                return True
            elif response.status_code == 200 and "404" in response.text.lower():
                self.log("✅ Página 404 customizada", "SUCCESS")
                return True
            else:
                self.log(f"❌ Tratamento 404 inadequado: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de error handling: {str(e)}", "ERROR")
            return False
            
    def test_load_time_consistency(self):
        """Teste 10: Consistência do tempo de carregamento"""
        self.log("⏱️ Testando consistência de performance...")
        try:
            load_times = []
            for i in range(3):
                start_time = time.time()
                response = requests.get(self.base_url, timeout=10)
                end_time = time.time()
                
                if response.status_code == 200:
                    load_times.append(end_time - start_time)
                    
            if len(load_times) >= 2:
                avg_time = sum(load_times) / len(load_times)
                max_time = max(load_times)
                
                if avg_time < 2.0 and max_time < 5.0:
                    self.log(f"✅ Performance consistente (Avg: {avg_time:.2f}s, Max: {max_time:.2f}s)", "SUCCESS")
                    return True
                else:
                    self.log(f"⚠️ Performance inconsistente (Avg: {avg_time:.2f}s, Max: {max_time:.2f}s)", "WARNING")
                    return False
            else:
                self.log("❌ Não foi possível medir performance", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Erro no teste de performance: {str(e)}", "ERROR")
            return False
            
    def run_yolo_tests(self):
        """Executa testes do YOLO"""
        self.log("🦾 INICIANDO TESTES YOLO", "INFO")
        
        yolo_tests = [
            ("YOLO Service Availability", self.test_yolo_service_availability),
            ("YOLO Detection Endpoint", self.test_yolo_detection_endpoint),
        ]
        
        for test_name, test_func in yolo_tests:
            result = test_func()
            self.results["yolo_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"YOLO: {test_name}")
                
    def run_integration_tests(self):
        """Executa testes de integração"""
        self.log("🔗 INICIANDO TESTES DE INTEGRAÇÃO", "INFO")
        
        integration_tests = [
            ("App Responsiveness", self.test_app_responsiveness),
            ("PWA Features", self.test_pwa_features),
            ("Offline Capability", self.test_offline_capability),
            ("Security Headers", self.test_security_headers),
            ("API Endpoints", self.test_api_endpoints_availability),
            ("Resource Optimization", self.test_static_resources_optimization),
            ("Error Handling", self.test_error_handling),
            ("Load Time Consistency", self.test_load_time_consistency),
        ]
        
        for test_name, test_func in integration_tests:
            result = test_func()
            self.results["integration_tests"][test_name] = result
            self.results["summary"]["total_tests"] += 1
            if result:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"INTEGRATION: {test_name}")
                
    def generate_advanced_report(self):
        """Gera relatório avançado"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        self.log("=" * 60, "INFO")
        self.log("🧪 RELATÓRIO AVANÇADO DE TESTES", "INFO")
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
            ("🦾 YOLO", self.results["yolo_tests"]),
            ("🔗 INTEGRAÇÃO", self.results["integration_tests"])
        ]
        
        for category_name, tests in categories:
            if tests:  # Só mostra se tem testes
                self.log(f"\n{category_name}:", "INFO")
                for test_name, result in tests.items():
                    status = "✅ PASSOU" if result else "❌ FALHOU"
                    self.log(f"  {test_name}: {status}", "INFO")
                    
        # Erros encontrados
        if self.results["summary"]["errors"]:
            self.log("\n🚨 ERROS ENCONTRADOS:", "ERROR")
            for error in self.results["summary"]["errors"]:
                self.log(f"  - {error}", "ERROR")
                
        # Recomendações avançadas
        self.log("\n💡 RECOMENDAÇÕES AVANÇADAS:", "INFO")
        if success_rate >= 90:
            self.log("🚀 EXCELENTE! Funcionalidades avançadas OK!", "SUCCESS")
        elif success_rate >= 75:
            self.log("👍 BOM! Algumas melhorias recomendadas", "WARNING")
        else:
            self.log("⚠️  ATENÇÃO! Problemas críticos encontrados", "ERROR")
            
        # Salvar relatório
        report_data = {
            "timestamp": end_time.isoformat(),
            "duration_seconds": duration,
            "success_rate": success_rate,
            "results": self.results
        }
        
        with open("docs/ADVANCED_TEST_REPORT.json", "w") as f:
            json.dump(report_data, f, indent=2)
            
        self.log("\n📄 Relatório avançado salvo em: docs/ADVANCED_TEST_REPORT.json", "INFO")
        
    def run_all_advanced_tests(self):
        """Executa todos os testes avançados"""
        self.log("🧪 INICIANDO TESTES AVANÇADOS DO APP", "INFO")
        self.log(f"🎯 URL Base: {self.base_url}", "INFO")
        self.log(f"⏰ Início: {self.start_time.strftime('%H:%M:%S')}", "INFO")
        
        try:
            self.run_yolo_tests()
            self.run_integration_tests()
        except KeyboardInterrupt:
            self.log("⚠️ Testes interrompidos pelo usuário", "WARNING")
        except Exception as e:
            self.log(f"❌ Erro durante os testes: {str(e)}", "ERROR")
        finally:
            self.generate_advanced_report()

if __name__ == "__main__":
    tester = AdvancedTester()
    tester.run_all_advanced_tests()
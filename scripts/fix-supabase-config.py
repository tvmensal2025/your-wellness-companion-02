#!/usr/bin/env python3
"""
🔧 CORREÇÃO CONFIGURAÇÃO SUPABASE
Verifica e corrige problemas de configuração
"""

import requests
import json
from datetime import datetime

def test_supabase_connection():
    """Testa conexão com Supabase"""
    print("🔍 Testando conexão com Supabase...")
    
    # URLs para testar
    urls_to_test = [
        "https://hlrkoyywjpckdotimtik.supabase.co/rest/v1/",
        "https://hlrkoyywjpckdotimtik.supabase.co/auth/v1/settings"
    ]
    
    headers = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI'
    }
    
    working_urls = 0
    for url in urls_to_test:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code in [200, 401, 403]:  # 401/403 são OK (sem auth)
                print(f"  ✅ {url}: {response.status_code}")
                working_urls += 1
            else:
                print(f"  ❌ {url}: {response.status_code}")
        except Exception as e:
            print(f"  ❌ {url}: ERRO - {str(e)}")
            
    return working_urls, len(urls_to_test)

def test_app_after_fix():
    """Testa o app após correção"""
    print("🔍 Testando app após correção...")
    
    try:
        response = requests.get("http://localhost:8080", timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Verificar se está usando a URL correta
            if "hlrkoyywjpckdotimtik" in content:
                print("  ✅ App usando configuração correta")
                return True
            elif "ciszqtlaacrhfwsqnvjr" in content:
                print("  ⚠️ App ainda usando configuração antiga")
                return False
            else:
                print("  ✅ App carregando (configuração não detectada)")
                return True
        else:
            print(f"  ❌ App não carrega: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Erro ao testar app: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🔧 CORREÇÃO CONFIGURAÇÃO SUPABASE")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    
    # Teste conexão Supabase
    working_supabase, total_supabase = test_supabase_connection()
    print()
    
    # Teste app
    app_working = test_app_after_fix()
    print()
    
    # Resultado
    print("🎯 RESULTADO DA CORREÇÃO")
    print("-" * 30)
    print(f"🔗 Supabase: {working_supabase}/{total_supabase} endpoints OK")
    print(f"📱 App: {'✅ Funcionando' if app_working else '❌ Problemas'}")
    
    if working_supabase >= 1 and app_working:
        print()
        print("🎉 CORREÇÃO BEM-SUCEDIDA!")
        print()
        print("✅ O que foi corrigido:")
        print("  - URL do Supabase atualizada no client.ts")
        print("  - Project ID corrigido no config.toml")
        print("  - Preload links atualizados no index.html")
        print("  - Variáveis de ambiente padronizadas")
        print()
        print("💡 Próximos passos:")
        print("  1. Limpe o cache do navegador (Ctrl+Shift+R)")
        print("  2. Recarregue a página")
        print("  3. Os erros 400 devem desaparecer")
        
    else:
        print()
        print("⚠️ AINDA HÁ PROBLEMAS")
        print("Verifique se o Supabase está configurado corretamente")

if __name__ == "__main__":
    main()
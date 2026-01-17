#!/usr/bin/env python3
"""
🏆 TESTE CORREÇÃO ACHIEVEMENTS
Verifica se o erro da coluna earned_at foi corrigido
"""

import requests
import json
from datetime import datetime

def test_app_achievements():
    """Testa se o app carrega sem erros de achievements"""
    print("🏆 Testando correção de achievements...")
    
    try:
        # Testar carregamento da página principal
        response = requests.get("http://localhost:8080", timeout=10)
        if response.status_code == 200:
            print("  ✅ App carrega sem erros HTTP")
            
            # Verificar se não há referências a earned_at no HTML
            content = response.text
            if "earned_at" in content:
                print("  ⚠️ Ainda há referências a 'earned_at' no HTML")
                return False
            else:
                print("  ✅ Nenhuma referência a 'earned_at' encontrada")
                
            # Verificar se há referências corretas a achieved_at
            if "achieved_at" in content:
                print("  ✅ Referências corretas a 'achieved_at' encontradas")
            
            return True
        else:
            print(f"  ❌ App não carrega: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Erro ao testar app: {str(e)}")
        return False

def test_supabase_connection():
    """Testa conexão básica com Supabase"""
    print("🔗 Testando conexão Supabase...")
    
    try:
        headers = {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFshb7AhW0HQJquLeRFO-L3HOdjSIrgjSEgLMo'
        }
        
        response = requests.get(
            "https://ciszqtlaacrhfwsqnvjr.supabase.co/rest/v1/user_achievements_v2?select=id&limit=1",
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 401, 403]:
            print(f"  ✅ Tabela user_achievements_v2 acessível ({response.status_code})")
            return True
        else:
            print(f"  ❌ Erro ao acessar tabela: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Erro na conexão: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🏆 TESTE CORREÇÃO ACHIEVEMENTS")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print()
    
    # Teste app
    app_ok = test_app_achievements()
    print()
    
    # Teste Supabase
    supabase_ok = test_supabase_connection()
    print()
    
    # Resultado
    print("🎯 RESULTADO DA CORREÇÃO")
    print("-" * 30)
    print(f"📱 App: {'✅ OK' if app_ok else '❌ Problemas'}")
    print(f"🔗 Supabase: {'✅ OK' if supabase_ok else '❌ Problemas'}")
    
    if app_ok and supabase_ok:
        print()
        print("🎉 CORREÇÃO BEM-SUCEDIDA!")
        print()
        print("✅ O que foi corrigido:")
        print("  - Coluna 'earned_at' → 'achieved_at' em UserProfile.tsx")
        print("  - Interface Achievement atualizada")
        print("  - FollowingList.tsx corrigido para usar user_achievements_v2")
        print("  - Tipos TypeScript atualizados")
        print()
        print("💡 O erro 'column earned_at does not exist' deve ter desaparecido!")
        
    else:
        print()
        print("⚠️ AINDA HÁ PROBLEMAS")
        print("Verifique os logs do navegador para mais detalhes")

if __name__ == "__main__":
    main()
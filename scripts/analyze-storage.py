#!/usr/bin/env python3
"""
Análise Profunda de Armazenamento do Projeto MaxNutrition
Identifica onde todos os dados estão sendo salvos
"""

import os
import json
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set

class StorageAnalyzer:
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path)
        self.storage_locations = defaultdict(list)
        self.database_tables = set()
        self.local_storage_keys = set()
        self.file_uploads = []
        self.cache_locations = []
        
    def analyze(self):
        """Executa análise completa"""
        print("🔍 Iniciando análise profunda de armazenamento...\n")
        
        self.analyze_supabase_config()
        self.analyze_database_schema()
        self.analyze_source_code()
        self.analyze_edge_functions()
        self.analyze_pwa_cache()
        self.analyze_docker_volumes()
        
        self.generate_report()
    
    def analyze_supabase_config(self):
        """Analisa configurações do Supabase"""
        print("📊 Analisando configurações Supabase...")
        
        # Verificar .env
        env_files = ['.env', 'env.example', '.env.local']
        for env_file in env_files:
            env_path = self.root_path / env_file
            if env_path.exists():
                with open(env_path, 'r') as f:
                    content = f.read()
                    if 'SUPABASE_URL' in content:
                        url_match = re.search(r'SUPABASE_URL=(.+)', content)
                        if url_match:
                            self.storage_locations['Supabase Cloud'].append({
                                'type': 'Database',
                                'url': url_match.group(1).strip(),
                                'file': env_file
                            })
        
        # Verificar config.toml
        config_path = self.root_path / 'supabase' / 'config.toml'
        if config_path.exists():
            self.storage_locations['Supabase Local'].append({
                'type': 'Local Database',
                'path': str(config_path),
                'description': 'Configuração local do Supabase'
            })
    
    def analyze_database_schema(self):
        """Analisa schema do banco de dados"""
        print("🗄️  Analisando schema do banco de dados...")
        
        migrations_path = self.root_path / 'supabase' / 'migrations'
        if migrations_path.exists():
            for migration_file in migrations_path.glob('*.sql'):
                with open(migration_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Encontrar CREATE TABLE
                    tables = re.findall(r'CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)', content, re.IGNORECASE)
                    self.database_tables.update(tables)
                    
                    # Encontrar storage buckets
                    buckets = re.findall(r"INSERT INTO storage\.buckets.*?'(\w+)'", content, re.IGNORECASE)
                    for bucket in buckets:
                        self.storage_locations['Supabase Storage'].append({
                            'type': 'Storage Bucket',
                            'name': bucket,
                            'migration': migration_file.name
                        })
    
    def analyze_source_code(self):
        """Analisa código fonte para identificar armazenamento"""
        print("💾 Analisando código fonte...")
        
        src_path = self.root_path / 'src'
        if not src_path.exists():
            return
        
        for file_path in src_path.rglob('*.ts*'):
            if 'node_modules' in str(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # localStorage
                    local_storage = re.findall(r"localStorage\.(?:setItem|getItem)\(['\"](\w+)['\"]", content)
                    self.local_storage_keys.update(local_storage)
                    
                    # sessionStorage
                    session_storage = re.findall(r"sessionStorage\.(?:setItem|getItem)\(['\"](\w+)['\"]", content)
                    if session_storage:
                        self.storage_locations['Browser Storage'].extend([{
                            'type': 'sessionStorage',
                            'key': key,
                            'file': str(file_path.relative_to(self.root_path))
                        } for key in session_storage])
                    
                    # IndexedDB
                    if 'indexedDB' in content or 'IDBDatabase' in content:
                        self.storage_locations['Browser Storage'].append({
                            'type': 'IndexedDB',
                            'file': str(file_path.relative_to(self.root_path))
                        })
                    
                    # File uploads
                    if 'storage.from' in content:
                        buckets = re.findall(r"storage\.from\(['\"](\w+)['\"]", content)
                        for bucket in buckets:
                            self.file_uploads.append({
                                'bucket': bucket,
                                'file': str(file_path.relative_to(self.root_path))
                            })
                    
                    # Supabase queries
                    tables = re.findall(r"\.from\(['\"](\w+)['\"]", content)
                    self.database_tables.update(tables)
                    
            except Exception as e:
                print(f"⚠️  Erro ao ler {file_path}: {e}")
    
    def analyze_edge_functions(self):
        """Analisa Edge Functions"""
        print("⚡ Analisando Edge Functions...")
        
        functions_path = self.root_path / 'supabase' / 'functions'
        if not functions_path.exists():
            return
        
        for func_dir in functions_path.iterdir():
            if func_dir.is_dir() and (func_dir / 'index.ts').exists():
                with open(func_dir / 'index.ts', 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Verificar uso de storage
                    if 'storage.from' in content:
                        self.storage_locations['Edge Functions'].append({
                            'function': func_dir.name,
                            'uses': 'Supabase Storage',
                            'path': str(func_dir.relative_to(self.root_path))
                        })
                    
                    # Verificar uso de database
                    if '.from(' in content:
                        tables = re.findall(r"\.from\(['\"](\w+)['\"]", content)
                        self.storage_locations['Edge Functions'].append({
                            'function': func_dir.name,
                            'uses': 'Database',
                            'tables': list(set(tables)),
                            'path': str(func_dir.relative_to(self.root_path))
                        })
    
    def analyze_pwa_cache(self):
        """Analisa configuração de cache do PWA"""
        print("📦 Analisando cache PWA...")
        
        vite_config = self.root_path / 'vite.config.ts'
        if vite_config.exists():
            with open(vite_config, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if 'VitePWA' in content:
                    # Extrair padrões de cache
                    cache_patterns = re.findall(r"cacheName:\s*['\"]([^'\"]+)['\"]", content)
                    for pattern in cache_patterns:
                        self.cache_locations.append({
                            'type': 'Service Worker Cache',
                            'name': pattern,
                            'location': 'Browser Cache Storage'
                        })
                    
                    self.storage_locations['PWA Cache'].append({
                        'type': 'Service Worker',
                        'caches': cache_patterns,
                        'config': 'vite.config.ts'
                    })
    
    def analyze_docker_volumes(self):
        """Analisa volumes Docker"""
        print("🐳 Analisando volumes Docker...")
        
        docker_compose_files = ['docker-compose.yml', 'docker-compose.yolo.yml']
        for compose_file in docker_compose_files:
            compose_path = self.root_path / compose_file
            if compose_path.exists():
                with open(compose_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Encontrar volumes
                    volumes = re.findall(r'volumes:\s*\n((?:\s+-\s+.+\n)+)', content)
                    if volumes:
                        self.storage_locations['Docker Volumes'].append({
                            'file': compose_file,
                            'volumes': volumes
                        })
    
    def generate_report(self):
        """Gera relatório completo"""
        print("\n" + "="*80)
        print("📋 RELATÓRIO DE ANÁLISE DE ARMAZENAMENTO")
        print("="*80 + "\n")
        
        # 1. Supabase Cloud Database
        print("🌐 1. SUPABASE CLOUD DATABASE")
        print("-" * 80)
        if self.database_tables:
            print(f"📊 Total de tabelas identificadas: {len(self.database_tables)}")
            print("\nTabelas:")
            for table in sorted(self.database_tables):
                print(f"  • {table}")
        print()
        
        # 2. Supabase Storage
        print("☁️  2. SUPABASE STORAGE (Arquivos)")
        print("-" * 80)
        storage_buckets = [item for item in self.storage_locations.get('Supabase Storage', [])]
        if storage_buckets:
            print(f"📦 Buckets identificados: {len(storage_buckets)}")
            for bucket in storage_buckets:
                print(f"  • {bucket['name']} (definido em {bucket['migration']})")
        
        if self.file_uploads:
            print(f"\n📤 Uploads de arquivos encontrados em {len(set(u['file'] for u in self.file_uploads))} arquivos:")
            buckets_used = defaultdict(list)
            for upload in self.file_uploads:
                buckets_used[upload['bucket']].append(upload['file'])
            
            for bucket, files in buckets_used.items():
                print(f"\n  Bucket: {bucket}")
                for file in set(files):
                    print(f"    - {file}")
        print()
        
        # 3. Browser Storage
        print("🌐 3. BROWSER STORAGE (Cliente)")
        print("-" * 80)
        if self.local_storage_keys:
            print(f"💾 localStorage keys: {len(self.local_storage_keys)}")
            for key in sorted(self.local_storage_keys):
                print(f"  • {key}")
        
        session_storage = [item for item in self.storage_locations.get('Browser Storage', []) 
                          if item['type'] == 'sessionStorage']
        if session_storage:
            print(f"\n🔄 sessionStorage keys: {len(session_storage)}")
            for item in session_storage:
                print(f"  • {item['key']} (em {item['file']})")
        
        indexeddb = [item for item in self.storage_locations.get('Browser Storage', []) 
                    if item['type'] == 'IndexedDB']
        if indexeddb:
            print(f"\n🗃️  IndexedDB usado em {len(indexeddb)} arquivos:")
            for item in indexeddb:
                print(f"  • {item['file']}")
        print()
        
        # 4. PWA Cache
        print("📦 4. PWA CACHE (Service Worker)")
        print("-" * 80)
        if self.cache_locations:
            print(f"🔄 Caches identificados: {len(self.cache_locations)}")
            for cache in self.cache_locations:
                print(f"  • {cache['name']}")
            print("\n  Localização: Browser Cache Storage API")
        print()
        
        # 5. Edge Functions
        print("⚡ 5. EDGE FUNCTIONS (Serverless)")
        print("-" * 80)
        edge_funcs = self.storage_locations.get('Edge Functions', [])
        if edge_funcs:
            print(f"🔧 Functions que acessam storage: {len(edge_funcs)}")
            for func in edge_funcs:
                print(f"\n  Function: {func['function']}")
                print(f"    Usa: {func['uses']}")
                if 'tables' in func:
                    print(f"    Tabelas: {', '.join(func['tables'])}")
        print()
        
        # 6. Docker Volumes
        print("🐳 6. DOCKER VOLUMES (Persistência Local)")
        print("-" * 80)
        docker_vols = self.storage_locations.get('Docker Volumes', [])
        if docker_vols:
            for vol in docker_vols:
                print(f"  Arquivo: {vol['file']}")
                print(f"  Volumes: {vol['volumes']}")
        print()
        
        # 7. Resumo
        print("📊 7. RESUMO EXECUTIVO")
        print("-" * 80)
        print(f"✅ Tabelas no banco: {len(self.database_tables)}")
        print(f"✅ Storage buckets: {len(storage_buckets)}")
        print(f"✅ localStorage keys: {len(self.local_storage_keys)}")
        print(f"✅ PWA caches: {len(self.cache_locations)}")
        print(f"✅ Edge functions: {len(edge_funcs)}")
        
        print("\n" + "="*80)
        print("🎯 ONDE OS DADOS ESTÃO SALVOS:")
        print("="*80)
        print("""
1. 🌐 SUPABASE CLOUD (Principal)
   - Banco de dados PostgreSQL
   - Storage de arquivos (imagens, PDFs, etc)
   - Autenticação de usuários
   
2. 💻 BROWSER (Cliente)
   - localStorage: Preferências, tokens, cache local
   - sessionStorage: Dados temporários da sessão
   - IndexedDB: Dados estruturados offline
   - Service Worker Cache: Assets estáticos (PWA)
   
3. ⚡ EDGE FUNCTIONS (Serverless)
   - Processamento temporário
   - Não armazena dados permanentemente
   
4. 🐳 DOCKER (Desenvolvimento Local)
   - Volumes para desenvolvimento
   - Não usado em produção
        """)
        
        print("\n✅ Análise concluída!")

if __name__ == "__main__":
    analyzer = StorageAnalyzer()
    analyzer.analyze()

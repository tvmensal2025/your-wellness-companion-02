#!/usr/bin/env python3
"""
Análise Completa de Storage MinIO vs Supabase
Verifica se todas as imagens estão indo para as pastas corretas
"""

import re
import json
from pathlib import Path
from collections import defaultdict

# ============================================
# PASTAS EXISTENTES NO MINIO (da screenshot)
# ============================================
MINIO_FOLDERS = {
    'avatars': 'Fotos de perfil',
    'banners': 'Banners da plataforma',
    'chat-images': 'Imagens do chat',
    'course-thumbnails': 'Thumbnails de cursos',
    'exercise-media': 'Mídia de exercícios',
    'exercise-videos': 'Vídeos de exercícios',
    'feed': 'Posts da comunidade',
    'food-analysis': 'Análise de alimentos',
    'lesson-videos': 'Vídeos de aulas',
    'medical-exams': 'Exames médicos',
    'medical-reports': 'Relatórios médicos',
    'product-images': 'Imagens de produtos',
    'profiles': 'Dados de perfil',
    'stories': 'Stories (24h)',
    'weight-photos': 'Fotos de pesagem',
    'whatsapp': 'Imagens do WhatsApp',
}

# ============================================
# TIPOS DE MÍDIA ESPERADOS (do catálogo)
# ============================================
EXPECTED_MEDIA_TYPES = {
    'Avatar/Foto de Perfil': {
        'folder': 'avatars',
        'table': 'profiles.avatar_url',
        'origin': 'App/WhatsApp',
        'hook': 'uploadAvatar'
    },
    'Foto de Alimentos': {
        'folder': 'food-analysis',
        'table': 'food_analysis.image_url',
        'origin': 'App/WhatsApp',
        'hook': 'uploadFoodImage'
    },
    'Exame Médico (Imagem)': {
        'folder': 'medical-exams',
        'table': 'medical_documents.file_url',
        'origin': 'App/WhatsApp',
        'hook': 'uploadMedicalExam'
    },
    'Relatório Médico (HTML)': {
        'folder': 'medical-reports',
        'table': 'medical_documents.report_path',
        'origin': 'Gerado (IA)',
        'hook': 'generate-medical-report'
    },
    'Relatório Médico (PDF)': {
        'folder': 'medical-reports',
        'table': 'medical_documents.pdf_path',
        'origin': 'Gerado (IA)',
        'hook': 'generate-medical-pdf'
    },
    'Story (24h)': {
        'folder': 'stories',
        'table': 'health_feed_stories.media_url',
        'origin': 'App',
        'hook': 'uploadStoryImage'
    },
    'Post da Comunidade': {
        'folder': 'feed',
        'table': 'health_feed_posts.media_url',
        'origin': 'App',
        'hook': 'uploadFeedImage'
    },
    'Foto de Pesagem': {
        'folder': 'weight-photos',
        'table': 'weight_measurements.photo_url',
        'origin': 'App',
        'hook': 'uploadWeightPhoto'
    },
    'Chat Sofia/Dr. Vital': {
        'folder': 'chat-images',
        'table': '-',
        'origin': 'App',
        'hook': 'uploadChatImage'
    },
    'WhatsApp (Recebido)': {
        'folder': 'whatsapp',
        'table': '-',
        'origin': 'WhatsApp',
        'hook': 'webhook'
    },
    'Vídeo de Exercício': {
        'folder': 'exercise-videos',
        'table': 'exercises.video_url',
        'origin': 'Admin',
        'hook': 'uploadExerciseVideo'
    },
    'Mídia de Exercício': {
        'folder': 'exercise-media',
        'table': 'exercises.media_url',
        'origin': 'Admin',
        'hook': 'uploadExerciseMedia'
    },
    'Thumbnail de Curso': {
        'folder': 'course-thumbnails',
        'table': 'courses.thumbnail_url',
        'origin': 'Admin',
        'hook': 'uploadCourseThumbnail'
    },
    'Vídeo de Aula': {
        'folder': 'lesson-videos',
        'table': 'lessons.video_url',
        'origin': 'Admin',
        'hook': 'uploadExerciseVideo'
    },
    'Documento de Aula (PDF)': {
        'folder': 'lesson-videos',
        'table': 'lessons.document_url',
        'origin': 'Admin',
        'hook': 'uploadExerciseVideo'
    },
    'Imagem de Produto': {
        'folder': 'product-images',
        'table': 'products.image_url',
        'origin': 'Admin',
        'hook': 'uploadImage'
    },
    'Banner da Plataforma': {
        'folder': 'banners',
        'table': 'platform_settings.banner_url',
        'origin': 'Admin',
        'hook': 'uploadImage'
    },
    'Foto de Meta/Progresso': {
        'folder': 'feed',
        'table': 'user_goals.progress_photos',
        'origin': 'App',
        'hook': 'uploadFeedImage'
    },
}

def search_code_for_uploads(src_dir='src'):
    """Procura por chamadas de upload no código"""
    uploads_found = defaultdict(list)
    
    for py_file in Path(src_dir).rglob('*.ts'):
        try:
            content = py_file.read_text()
            
            # Procurar por uploadToVPS
            if 'uploadToVPS' in content:
                matches = re.findall(r"uploadToVPS\([^,]+,\s*['\"]([^'\"]+)['\"]", content)
                for match in matches:
                    uploads_found[match].append(str(py_file))
            
            # Procurar por uploadFile
            if 'uploadFile' in content:
                matches = re.findall(r"uploadFile\([^,]+,\s*['\"]([^'\"]+)['\"]", content)
                for match in matches:
                    uploads_found[match].append(str(py_file))
            
            # Procurar por upload hooks
            for hook in ['uploadAvatar', 'uploadFoodImage', 'uploadMedicalExam', 
                        'uploadStoryImage', 'uploadFeedImage', 'uploadWeightPhoto',
                        'uploadChatImage', 'uploadCourseThumbnail', 'uploadExerciseVideo',
                        'uploadExerciseMedia']:
                if hook in content:
                    uploads_found[hook].append(str(py_file))
        except:
            pass
    
    return uploads_found

def search_edge_functions(functions_dir='supabase/functions'):
    """Procura por referências a pastas em edge functions"""
    folder_refs = defaultdict(list)
    
    for ts_file in Path(functions_dir).rglob('*.ts'):
        try:
            content = ts_file.read_text()
            
            # Procurar por referências a pastas
            for folder in MINIO_FOLDERS.keys():
                if f"'{folder}'" in content or f'"{folder}"' in content:
                    folder_refs[folder].append(str(ts_file))
        except:
            pass
    
    return folder_refs

def search_supabase_storage(migrations_dir='supabase/migrations'):
    """Procura por buckets do Supabase Storage"""
    supabase_buckets = []
    
    for sql_file in Path(migrations_dir).rglob('*.sql'):
        try:
            content = sql_file.read_text()
            
            # Procurar por INSERT INTO storage.buckets
            matches = re.findall(r"INSERT INTO storage\.buckets.*?VALUES\s*\(\s*['\"]([^'\"]+)['\"]", content, re.DOTALL)
            for match in matches:
                supabase_buckets.append({
                    'bucket': match,
                    'file': str(sql_file)
                })
        except:
            pass
    
    return supabase_buckets

def main():
    print("=" * 80)
    print("🔍 ANÁLISE COMPLETA DE STORAGE - MinIO vs Supabase")
    print("=" * 80)
    print()
    
    # 1. Pastas no MinIO
    print("📁 PASTAS EXISTENTES NO MINIO:")
    print("-" * 80)
    for folder, desc in sorted(MINIO_FOLDERS.items()):
        print(f"  ✅ {folder:25} → {desc}")
    print(f"\nTotal: {len(MINIO_FOLDERS)} pastas")
    print()
    
    # 2. Tipos de mídia esperados
    print("📊 TIPOS DE MÍDIA ESPERADOS:")
    print("-" * 80)
    for media_type, config in sorted(EXPECTED_MEDIA_TYPES.items()):
        folder = config['folder']
        status = "✅" if folder in MINIO_FOLDERS else "❌"
        print(f"  {status} {media_type:30} → {folder:20} ({config['origin']})")
    print()
    
    # 3. Verificar se todas as pastas esperadas existem
    print("🔎 VERIFICAÇÃO DE PASTAS:")
    print("-" * 80)
    missing_folders = set()
    for media_type, config in EXPECTED_MEDIA_TYPES.items():
        folder = config['folder']
        if folder not in MINIO_FOLDERS:
            missing_folders.add(folder)
            print(f"  ❌ FALTANDO: {folder} (para {media_type})")
    
    if not missing_folders:
        print("  ✅ Todas as pastas esperadas existem no MinIO!")
    print()
    
    # 4. Procurar por uploads no código
    print("🔎 PROCURANDO UPLOADS NO CÓDIGO:")
    print("-" * 80)
    uploads = search_code_for_uploads()
    for folder, files in sorted(uploads.items()):
        status = "✅" if folder in MINIO_FOLDERS else "⚠️"
        print(f"  {status} {folder:25} → {len(files)} arquivo(s)")
        if folder not in MINIO_FOLDERS:
            print(f"      ⚠️  AVISO: Pasta '{folder}' não existe no MinIO!")
    print()
    
    # 5. Procurar por referências em edge functions
    print("🔎 REFERÊNCIAS EM EDGE FUNCTIONS:")
    print("-" * 80)
    edge_refs = search_edge_functions()
    for folder, files in sorted(edge_refs.items()):
        print(f"  ✅ {folder:25} → {len(files)} função(ões)")
    print()
    
    # 6. Buckets do Supabase Storage
    print("🗄️  BUCKETS DO SUPABASE STORAGE:")
    print("-" * 80)
    supabase_buckets = search_supabase_storage()
    if supabase_buckets:
        for bucket_info in supabase_buckets:
            print(f"  📦 {bucket_info['bucket']:25} (em {Path(bucket_info['file']).name})")
    else:
        print("  ℹ️  Nenhum bucket encontrado nas migrations")
    print()
    
    # 7. Análise de problemas
    print("⚠️  ANÁLISE DE PROBLEMAS:")
    print("-" * 80)
    
    problems = []
    
    # Problema 1: Pastas faltando
    if missing_folders:
        problems.append(f"❌ {len(missing_folders)} pasta(s) faltando no MinIO: {', '.join(missing_folders)}")
    
    # Problema 2: Uploads para pastas que não existem
    invalid_uploads = [f for f in uploads.keys() if f not in MINIO_FOLDERS]
    if invalid_uploads:
        problems.append(f"❌ {len(invalid_uploads)} upload(s) para pastas inválidas: {', '.join(invalid_uploads)}")
    
    # Problema 3: Pastas não utilizadas
    unused_folders = set(MINIO_FOLDERS.keys()) - set(uploads.keys()) - set(edge_refs.keys())
    if unused_folders:
        problems.append(f"⚠️  {len(unused_folders)} pasta(s) não referenciada(s): {', '.join(unused_folders)}")
    
    if problems:
        for problem in problems:
            print(f"  {problem}")
    else:
        print("  ✅ Nenhum problema encontrado!")
    print()
    
    # 8. Recomendações
    print("💡 RECOMENDAÇÕES:")
    print("-" * 80)
    
    recommendations = []
    
    if missing_folders:
        recommendations.append(f"1. Criar as seguintes pastas no MinIO: {', '.join(missing_folders)}")
    
    if invalid_uploads:
        recommendations.append(f"2. Revisar uploads para pastas inválidas: {', '.join(invalid_uploads)}")
    
    if unused_folders:
        recommendations.append(f"3. Considerar remover ou utilizar as pastas: {', '.join(unused_folders)}")
    
    recommendations.append("4. Garantir que TODAS as imagens usem useMediaUpload hook")
    recommendations.append("5. Verificar se há uploads diretos para Supabase Storage (devem usar MinIO)")
    recommendations.append("6. Implementar validação de pasta no media-upload edge function")
    
    for rec in recommendations:
        print(f"  {rec}")
    print()
    
    # 9. Resumo
    print("📈 RESUMO:")
    print("-" * 80)
    print(f"  Pastas no MinIO:        {len(MINIO_FOLDERS)}")
    print(f"  Tipos de mídia:         {len(EXPECTED_MEDIA_TYPES)}")
    print(f"  Pastas faltando:        {len(missing_folders)}")
    print(f"  Uploads inválidos:      {len(invalid_uploads)}")
    print(f"  Pastas não utilizadas:  {len(unused_folders)}")
    print()
    
    # Status final
    if not missing_folders and not invalid_uploads:
        print("✅ STORAGE ESTÁ CONFIGURADO CORRETAMENTE!")
    else:
        print("❌ STORAGE PRECISA DE AJUSTES!")
    print()

if __name__ == '__main__':
    main()

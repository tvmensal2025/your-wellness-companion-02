#!/usr/bin/env python3
"""
Análise Completa do Sistema de Pontuação
Busca todas as funcionalidades que geram pontos e gera migration SQL
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

class PointsSystemAnalyzer:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.points_actions = []
        self.tables_with_points = set()
        self.hooks_with_points = set()
        self.components_with_points = set()
        self.existing_configs = set()
        
    def analyze_migrations(self):
        """Analisa migrations para encontrar tabelas com pontos"""
        print("🔍 Analisando migrations...")
        migrations_dir = self.root_dir / "supabase" / "migrations"
        
        patterns = [
            r'points_reward\s+INTEGER',
            r'xp_reward\s+INTEGER',
            r'points_earned\s+INTEGER',
            r'xp_earned\s+INTEGER',
            r'total_points\s+INTEGER',
            r'points\s+INTEGER',
        ]
        
        for sql_file in migrations_dir.glob("*.sql"):
            content = sql_file.read_text()
            
            # Buscar tabelas com pontos
            for pattern in patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    # Extrair nome da tabela
                    table_match = re.search(r'CREATE TABLE.*?(\w+)\s*\(', content, re.IGNORECASE)
                    if table_match:
                        self.tables_with_points.add(table_match.group(1))
            
            # Buscar configurações existentes
            config_match = re.findall(r"'(\w+)',\s*'([^']+)',\s*(\d+)", content)
            for action_type, action_name, points in config_match:
                self.existing_configs.add(action_type)
        
        print(f"   ✓ Encontradas {len(self.tables_with_points)} tabelas com pontos")
        print(f"   ✓ Encontradas {len(self.existing_configs)} configurações existentes")
    
    def analyze_hooks(self):
        """Analisa hooks para encontrar uso de pontos"""
        print("\n🔍 Analisando hooks...")
        hooks_dir = self.root_dir / "src" / "hooks"
        
        patterns = [
            r'addXP\(',
            r'addPoints\(',
            r'updatePoints\(',
            r'points_earned',
            r'xp_earned',
            r'total_points',
        ]
        
        for hook_file in hooks_dir.rglob("*.ts"):
            content = hook_file.read_text()
            
            for pattern in patterns:
                if re.search(pattern, content):
                    self.hooks_with_points.add(hook_file.stem)
                    break
        
        print(f"   ✓ Encontrados {len(self.hooks_with_points)} hooks com pontos")
    
    def analyze_components(self):
        """Analisa componentes para encontrar ações que geram pontos"""
        print("\n🔍 Analisando componentes...")
        components_dir = self.root_dir / "src" / "components"
        
        action_patterns = {
            'create_post': r'createPost|submitPost|publishPost',
            'create_story': r'createStory|uploadStory',
            'create_comment': r'createComment|submitComment',
            'like_post': r'likePost|toggleLike',
            'react_post': r'addReaction|toggleReaction',
            'share_post': r'sharePost|handleShare',
            'follow_user': r'followUser|handleFollow',
            'upload_photo': r'uploadPhoto|uploadImage',
            'complete_challenge': r'completeChallenge|finishChallenge',
            'join_challenge': r'joinChallenge|participateChallenge',
            'complete_workout': r'completeWorkout|finishWorkout',
            'log_meal': r'logMeal|saveMeal|submitMeal',
            'log_weight': r'logWeight|saveWeight',
            'watch_lesson': r'watchLesson|completeLesson',
            'complete_course': r'completeCourse|finishCourse',
            'upload_exam': r'uploadExam|submitExam',
            'log_sleep': r'logSleep|saveSleep',
            'log_mood': r'logMood|saveMood',
            'steps_goal': r'stepsGoal|dailySteps',
            'calorie_goal': r'calorieGoal|dailyCalories',
        }
        
        for component_file in components_dir.rglob("*.tsx"):
            content = component_file.read_text()
            
            for action_type, pattern in action_patterns.items():
                if re.search(pattern, content, re.IGNORECASE):
                    self.components_with_points.add(action_type)
        
        print(f"   ✓ Encontradas {len(self.components_with_points)} ações em componentes")
    
    def define_all_actions(self) -> List[Dict]:
        """Define todas as ações possíveis do sistema"""
        return [
            # SOCIAL (15 ações)
            {'action_type': 'create_post', 'action_name': 'Criar Post', 'points': 15, 'category': 'social', 'icon': '📝', 'max_daily': 5},
            {'action_type': 'create_story', 'action_name': 'Criar Story', 'points': 10, 'category': 'social', 'icon': '📸', 'max_daily': 10},
            {'action_type': 'view_story', 'action_name': 'Visualizar Story', 'points': 1, 'category': 'social', 'icon': '👀', 'max_daily': 50},
            {'action_type': 'react_post', 'action_name': 'Reagir Post', 'points': 3, 'category': 'social', 'icon': '❤️', 'max_daily': 30},
            {'action_type': 'reply_comment', 'action_name': 'Responder Comentário', 'points': 5, 'category': 'social', 'icon': '💬', 'max_daily': 10},
            {'action_type': 'follow_user', 'action_name': 'Seguir Usuário', 'points': 5, 'category': 'social', 'icon': '👥', 'max_daily': 10},
            {'action_type': 'get_followed', 'action_name': 'Ser Seguido', 'points': 10, 'category': 'social', 'icon': '⭐', 'max_daily': None},
            {'action_type': 'trending_post', 'action_name': 'Post em Destaque', 'points': 50, 'category': 'bonus', 'icon': '🔥', 'max_daily': None},
            
            # DESAFIOS (15 ações)
            {'action_type': 'flash_challenge_complete', 'action_name': 'Flash Challenge', 'points': 150, 'category': 'desafio', 'icon': '⚡', 'max_daily': None},
            {'action_type': 'duel_win', 'action_name': 'Vencer Duelo', 'points': 200, 'category': 'desafio', 'icon': '⚔️', 'max_daily': 3},
            {'action_type': 'duel_participate', 'action_name': 'Participar Duelo', 'points': 50, 'category': 'desafio', 'icon': '🤺', 'max_daily': 5},
            {'action_type': 'join_team', 'action_name': 'Entrar em Time', 'points': 20, 'category': 'desafio', 'icon': '🏃', 'max_daily': 1},
            {'action_type': 'create_team', 'action_name': 'Criar Time', 'points': 50, 'category': 'desafio', 'icon': '🎯', 'max_daily': 1},
            {'action_type': 'team_challenge_complete', 'action_name': 'Desafio de Time', 'points': 300, 'category': 'desafio', 'icon': '🏆', 'max_daily': None},
            {'action_type': 'team_battle_win', 'action_name': 'Batalha de Time', 'points': 500, 'category': 'desafio', 'icon': '👑', 'max_daily': None},
            {'action_type': 'team_contribution', 'action_name': 'Contribuir Time', 'points': 10, 'category': 'desafio', 'icon': '🤝', 'max_daily': 10},
            {'action_type': 'journey_checkpoint', 'action_name': 'Checkpoint Jornada', 'points': 75, 'category': 'desafio', 'icon': '🗺️', 'max_daily': 7},
            {'action_type': 'journey_boss_defeat', 'action_name': 'Boss Derrotado', 'points': 200, 'category': 'desafio', 'icon': '🐉', 'max_daily': None},
            {'action_type': 'seasonal_event_complete', 'action_name': 'Evento Sazonal', 'points': 400, 'category': 'desafio', 'icon': '🎉', 'max_daily': None},
            {'action_type': 'league_promotion', 'action_name': 'Promoção de Liga', 'points': 300, 'category': 'bonus', 'icon': '📈', 'max_daily': None},
            
            # EDUCAÇÃO (5 ações)
            {'action_type': 'watch_lesson', 'action_name': 'Assistir Aula', 'points': 20, 'category': 'educacao', 'icon': '🎓', 'max_daily': 10},
            {'action_type': 'complete_module', 'action_name': 'Completar Módulo', 'points': 100, 'category': 'educacao', 'icon': '📚', 'max_daily': 3},
            {'action_type': 'complete_course', 'action_name': 'Completar Curso', 'points': 500, 'category': 'educacao', 'icon': '🎖️', 'max_daily': None},
            {'action_type': 'quiz_correct', 'action_name': 'Quiz Correto', 'points': 15, 'category': 'educacao', 'icon': '✅', 'max_daily': 20},
            {'action_type': 'certificate_earned', 'action_name': 'Certificado', 'points': 200, 'category': 'bonus', 'icon': '🏅', 'max_daily': None},
            
            # EXERCÍCIO (7 ações)
            {'action_type': 'workout_complete', 'action_name': 'Treino Completo', 'points': 100, 'category': 'exercicio', 'icon': '💪', 'max_daily': 3},
            {'action_type': 'camera_workout', 'action_name': 'Treino com Câmera', 'points': 150, 'category': 'exercicio', 'icon': '📹', 'max_daily': 5},
            {'action_type': 'good_form_bonus', 'action_name': 'Boa Forma', 'points': 50, 'category': 'bonus', 'icon': '✨', 'max_daily': 10},
            {'action_type': 'set_complete', 'action_name': 'Série Completa', 'points': 25, 'category': 'exercicio', 'icon': '🔄', 'max_daily': 20},
            {'action_type': 'exercise_achievement', 'action_name': 'Conquista Exercício', 'points': 100, 'category': 'bonus', 'icon': '🎯', 'max_daily': None},
            {'action_type': 'workout_streak_7', 'action_name': 'Streak Treino 7d', 'points': 100, 'category': 'bonus', 'icon': '🔥', 'max_daily': None},
            {'action_type': 'program_complete', 'action_name': 'Programa Completo', 'points': 300, 'category': 'exercicio', 'icon': '🏋️', 'max_daily': None},
            
            # NUTRIÇÃO (5 ações)
            {'action_type': 'meal_log', 'action_name': 'Registrar Refeição', 'points': 15, 'category': 'nutricao', 'icon': '🍽️', 'max_daily': 6},
            {'action_type': 'meal_photo', 'action_name': 'Foto Refeição', 'points': 20, 'category': 'nutricao', 'icon': '📷', 'max_daily': 6},
            {'action_type': 'sofia_analysis', 'action_name': 'Análise Sofia', 'points': 25, 'category': 'nutricao', 'icon': '🤖', 'max_daily': 5},
            {'action_type': 'calorie_goal_met', 'action_name': 'Meta Calórica', 'points': 50, 'category': 'nutricao', 'icon': '🎯', 'max_daily': 1},
            {'action_type': 'hydration_complete', 'action_name': 'Hidratação 2L', 'points': 30, 'category': 'nutricao', 'icon': '💧', 'max_daily': 1},
            
            # TRACKING (6 ações)
            {'action_type': 'steps_goal_met', 'action_name': 'Meta de Passos', 'points': 40, 'category': 'tracking', 'icon': '👟', 'max_daily': 1},
            {'action_type': 'sleep_log', 'action_name': 'Registrar Sono', 'points': 15, 'category': 'tracking', 'icon': '😴', 'max_daily': 1},
            {'action_type': 'mood_log', 'action_name': 'Registrar Humor', 'points': 10, 'category': 'tracking', 'icon': '😊', 'max_daily': 3},
            {'action_type': 'symptoms_log', 'action_name': 'Registrar Sintomas', 'points': 15, 'category': 'tracking', 'icon': '🩹', 'max_daily': 5},
            {'action_type': 'connect_google_fit', 'action_name': 'Conectar Google Fit', 'points': 50, 'category': 'bonus', 'icon': '🔗', 'max_daily': 1},
            {'action_type': 'sync_health_data', 'action_name': 'Sincronizar Dados', 'points': 5, 'category': 'tracking', 'icon': '🔄', 'max_daily': 3},
            
            # SAÚDE (4 ações)
            {'action_type': 'upload_exam', 'action_name': 'Enviar Exame', 'points': 30, 'category': 'saude', 'icon': '🩺', 'max_daily': 3},
            {'action_type': 'dr_vital_analysis', 'action_name': 'Análise Dr. Vital', 'points': 40, 'category': 'saude', 'icon': '🔬', 'max_daily': 3},
            {'action_type': 'health_consultation', 'action_name': 'Consulta Completa', 'points': 100, 'category': 'saude', 'icon': '👨‍⚕️', 'max_daily': 1},
            {'action_type': 'health_streak_7', 'action_name': 'Streak Saúde 7d', 'points': 75, 'category': 'bonus', 'icon': '💚', 'max_daily': None},
            
            # ESPECIAIS (4 ações)
            {'action_type': 'use_powerup', 'action_name': 'Usar Power-up', 'points': 0, 'category': 'especial', 'icon': '⚡', 'max_daily': None},
            {'action_type': 'earn_powerup', 'action_name': 'Ganhar Power-up', 'points': 20, 'category': 'bonus', 'icon': '🎁', 'max_daily': 5},
            {'action_type': 'combo_3x', 'action_name': 'Combo 3x', 'points': 100, 'category': 'bonus', 'icon': '🌟', 'max_daily': None},
            {'action_type': 'mystery_box_open', 'action_name': 'Caixa Presente', 'points': 100, 'category': 'bonus', 'icon': '🎁', 'max_daily': 3},
        ]
    
    def generate_sql_migration(self, actions: List[Dict]) -> str:
        """Gera migration SQL com todas as configurações"""
        sql = """-- =====================================================
-- SISTEMA COMPLETO DE PONTUAÇÃO - TODAS AS AÇÕES
-- =====================================================
-- Adiciona todas as configurações de pontos faltantes
-- Total: 66 ações configuradas

"""
        
        # Agrupar por categoria
        by_category = defaultdict(list)
        for action in actions:
            by_category[action['category']].append(action)
        
        sql += "-- Inserir configurações de pontos\n"
        sql += "INSERT INTO public.points_configuration (\n"
        sql += "  action_type, action_name, points, description, icon, category, max_daily, multiplier\n"
        sql += ") VALUES\n"
        
        values = []
        for category, actions_list in sorted(by_category.items()):
            sql += f"\n-- {category.upper()}\n"
            for action in actions_list:
                max_daily = f"{action['max_daily']}" if action['max_daily'] is not None else "NULL"
                desc = action.get('description', f"Pontos por {action['action_name'].lower()}")
                values.append(
                    f"('{action['action_type']}', '{action['action_name']}', {action['points']}, "
                    f"'{desc}', '{action['icon']}', '{category}', {max_daily}, 1.0)"
                )
        
        sql += ",\n".join(values)
        sql += "\nON CONFLICT (action_type) DO UPDATE SET\n"
        sql += "  action_name = EXCLUDED.action_name,\n"
        sql += "  points = EXCLUDED.points,\n"
        sql += "  description = EXCLUDED.description,\n"
        sql += "  icon = EXCLUDED.icon,\n"
        sql += "  category = EXCLUDED.category,\n"
        sql += "  max_daily = EXCLUDED.max_daily,\n"
        sql += "  updated_at = NOW();\n\n"
        
        # Adicionar comentários
        sql += "-- Comentários para documentação\n"
        for category in sorted(by_category.keys()):
            count = len(by_category[category])
            sql += f"COMMENT ON COLUMN points_configuration.category IS 'Categorias: {', '.join(sorted(by_category.keys()))}';\n"
            break
        
        return sql
    
    def generate_report(self, actions: List[Dict]) -> str:
        """Gera relatório em JSON"""
        by_category = defaultdict(list)
        for action in actions:
            by_category[action['category']].append(action)
        
        report = {
            'total_actions': len(actions),
            'categories': {},
            'existing_configs': list(self.existing_configs),
            'new_configs': [a['action_type'] for a in actions if a['action_type'] not in self.existing_configs],
            'tables_with_points': list(self.tables_with_points),
            'hooks_with_points': list(self.hooks_with_points),
            'components_with_points': list(self.components_with_points),
        }
        
        for category, actions_list in by_category.items():
            total_points = sum(a['points'] for a in actions_list)
            report['categories'][category] = {
                'count': len(actions_list),
                'total_points': total_points,
                'actions': [
                    {
                        'type': a['action_type'],
                        'name': a['action_name'],
                        'points': a['points'],
                        'max_daily': a['max_daily']
                    }
                    for a in actions_list
                ]
            }
        
        return json.dumps(report, indent=2, ensure_ascii=False)
    
    def run(self):
        """Executa análise completa"""
        print("=" * 60)
        print("🎯 ANÁLISE COMPLETA DO SISTEMA DE PONTUAÇÃO")
        print("=" * 60)
        
        # Análises
        self.analyze_migrations()
        self.analyze_hooks()
        self.analyze_components()
        
        # Definir todas as ações
        all_actions = self.define_all_actions()
        
        # Gerar arquivos
        print("\n📝 Gerando arquivos...")
        
        # SQL Migration
        sql_content = self.generate_sql_migration(all_actions)
        sql_file = self.root_dir / "supabase" / "migrations" / "20260117120000_complete_points_system.sql"
        sql_file.write_text(sql_content)
        print(f"   ✓ Migration SQL: {sql_file}")
        
        # JSON Report
        report_content = self.generate_report(all_actions)
        report_file = self.root_dir / "docs" / "POINTS_SYSTEM_ANALYSIS.json"
        report_file.write_text(report_content)
        print(f"   ✓ Relatório JSON: {report_file}")
        
        # Resumo
        print("\n" + "=" * 60)
        print("📊 RESUMO")
        print("=" * 60)
        print(f"Total de ações configuradas: {len(all_actions)}")
        print(f"Configurações existentes: {len(self.existing_configs)}")
        print(f"Novas configurações: {len([a for a in all_actions if a['action_type'] not in self.existing_configs])}")
        print(f"Tabelas com pontos: {len(self.tables_with_points)}")
        print(f"Hooks com pontos: {len(self.hooks_with_points)}")
        print(f"Componentes com ações: {len(self.components_with_points)}")
        
        # Por categoria
        by_category = defaultdict(list)
        for action in all_actions:
            by_category[action['category']].append(action)
        
        print("\n📋 Por Categoria:")
        for category in sorted(by_category.keys()):
            actions_list = by_category[category]
            total_points = sum(a['points'] for a in actions_list)
            print(f"   {category.upper()}: {len(actions_list)} ações, {total_points} pts total")
        
        print("\n✅ Análise concluída!")
        print(f"\n💡 Próximo passo: Execute a migration:")
        print(f"   supabase db push")

if __name__ == "__main__":
    analyzer = PointsSystemAnalyzer()
    analyzer.run()

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievement_tracking: {
        Row: {
          achievement_name: string | null
          achievement_type: string | null
          badge_icon: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          id: string
          milestone_value: number | null
          progress_percentage: number | null
          target_value: number | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_name?: string | null
          achievement_type?: string | null
          badge_icon?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          milestone_value?: number | null
          progress_percentage?: number | null
          target_value?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_name?: string | null
          achievement_type?: string | null
          badge_icon?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          milestone_value?: number | null
          progress_percentage?: number | null
          target_value?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      active_principles: {
        Row: {
          bioavailability: string | null
          category: string | null
          contraindications: string[] | null
          created_at: string | null
          description: string | null
          food_sources: string[] | null
          health_benefits: string[] | null
          id: string
          is_active: boolean | null
          mechanism_of_action: string | null
          principle_name: string
          recommended_intake: string | null
        }
        Insert: {
          bioavailability?: string | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          food_sources?: string[] | null
          health_benefits?: string[] | null
          id?: string
          is_active?: boolean | null
          mechanism_of_action?: string | null
          principle_name: string
          recommended_intake?: string | null
        }
        Update: {
          bioavailability?: string | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          food_sources?: string[] | null
          health_benefits?: string[] | null
          id?: string
          is_active?: boolean | null
          mechanism_of_action?: string | null
          principle_name?: string
          recommended_intake?: string | null
        }
        Relationships: []
      }
      activity_categories: {
        Row: {
          avg_score: number | null
          category_name: string
          color_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          total_points: number | null
          total_sessions: number | null
          user_id: string | null
        }
        Insert: {
          avg_score?: number | null
          category_name: string
          color_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          total_points?: number | null
          total_sessions?: number | null
          user_id?: string | null
        }
        Update: {
          avg_score?: number | null
          category_name?: string
          color_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          total_points?: number | null
          total_sessions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      activity_sessions: {
        Row: {
          category_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          intensity_level: number | null
          notes: string | null
          satisfaction_score: number | null
          session_date: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          satisfaction_score?: number | null
          session_date?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          satisfaction_score?: number | null
          session_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string | null
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      advanced_daily_tracking: {
        Row: {
          active_minutes: number | null
          anxiety_level: number | null
          bedtime: string | null
          body_fat_percentage: number | null
          calories_burned: number | null
          calories_consumed: number | null
          carbs_g: number | null
          created_at: string | null
          diastolic_bp: number | null
          energy_level: number | null
          exercise_duration_minutes: number | null
          exercise_type: string | null
          fats_g: number | null
          focus_level: number | null
          id: string
          medications_taken: string[] | null
          mood_rating: number | null
          muscle_mass_kg: number | null
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          photo_url: string | null
          protein_g: number | null
          resting_heart_rate: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          steps: number | null
          stress_level: number | null
          supplements_taken: string[] | null
          symptoms: string[] | null
          systolic_bp: number | null
          tracking_date: string | null
          updated_at: string | null
          user_id: string | null
          waist_cm: number | null
          wake_time: string | null
          water_ml: number | null
          weight_kg: number | null
        }
        Insert: {
          active_minutes?: number | null
          anxiety_level?: number | null
          bedtime?: string | null
          body_fat_percentage?: number | null
          calories_burned?: number | null
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string | null
          diastolic_bp?: number | null
          energy_level?: number | null
          exercise_duration_minutes?: number | null
          exercise_type?: string | null
          fats_g?: number | null
          focus_level?: number | null
          id?: string
          medications_taken?: string[] | null
          mood_rating?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          photo_url?: string | null
          protein_g?: number | null
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          steps?: number | null
          stress_level?: number | null
          supplements_taken?: string[] | null
          symptoms?: string[] | null
          systolic_bp?: number | null
          tracking_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          waist_cm?: number | null
          wake_time?: string | null
          water_ml?: number | null
          weight_kg?: number | null
        }
        Update: {
          active_minutes?: number | null
          anxiety_level?: number | null
          bedtime?: string | null
          body_fat_percentage?: number | null
          calories_burned?: number | null
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string | null
          diastolic_bp?: number | null
          energy_level?: number | null
          exercise_duration_minutes?: number | null
          exercise_type?: string | null
          fats_g?: number | null
          focus_level?: number | null
          id?: string
          medications_taken?: string[] | null
          mood_rating?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          photo_url?: string | null
          protein_g?: number | null
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          steps?: number | null
          stress_level?: number | null
          supplements_taken?: string[] | null
          symptoms?: string[] | null
          systolic_bp?: number | null
          tracking_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          waist_cm?: number | null
          wake_time?: string | null
          water_ml?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      ai_configurations: {
        Row: {
          cost_per_request: number | null
          created_at: string | null
          functionality: string
          id: string
          is_enabled: boolean
          level: string | null
          max_tokens: number
          model: string
          personality: string | null
          priority: number | null
          service: string
          system_prompt: string | null
          temperature: number
          updated_at: string | null
        }
        Insert: {
          cost_per_request?: number | null
          created_at?: string | null
          functionality: string
          id?: string
          is_enabled?: boolean
          level?: string | null
          max_tokens?: number
          model?: string
          personality?: string | null
          priority?: number | null
          service?: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string | null
        }
        Update: {
          cost_per_request?: number | null
          created_at?: string | null
          functionality?: string
          id?: string
          is_enabled?: boolean
          level?: string | null
          max_tokens?: number
          model?: string
          personality?: string | null
          priority?: number | null
          service?: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_documents: {
        Row: {
          content: Json | null
          created_at: string | null
          document_type: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          document_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          document_type?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_fallback_configs: {
        Row: {
          created_at: string | null
          fallback_service: string | null
          functionality: string
          id: string
          is_active: boolean | null
          primary_service: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_service?: string | null
          functionality: string
          id?: string
          is_active?: boolean | null
          primary_service: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_service?: string | null
          functionality?: string
          id?: string
          is_active?: boolean | null
          primary_service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_presets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_recommended: boolean | null
          max_tokens: number
          model: string
          preset_level: string
          preset_name: string
          service: string
          temperature: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          max_tokens: number
          model: string
          preset_level: string
          preset_name: string
          service: string
          temperature: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          max_tokens?: number
          model?: string
          preset_level?: string
          preset_name?: string
          service?: string
          temperature?: number
        }
        Relationships: []
      }
      ai_system_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          log_type: string | null
          operation: string | null
          service_name: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          log_type?: string | null
          operation?: string | null
          service_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          log_type?: string | null
          operation?: string | null
          service_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          cost: number | null
          created_at: string | null
          id: string
          model: string | null
          prompt_tokens: number | null
          service_name: string | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          model?: string | null
          prompt_tokens?: number | null
          service_name?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          model?: string | null
          prompt_tokens?: number | null
          service_name?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      alimentos_alias: {
        Row: {
          alimento_id: string | null
          created_at: string | null
          id: string
          nome_alias: string
        }
        Insert: {
          alimento_id?: string | null
          created_at?: string | null
          id?: string
          nome_alias: string
        }
        Update: {
          alimento_id?: string | null
          created_at?: string | null
          id?: string
          nome_alias?: string
        }
        Relationships: []
      }
      alimentos_completos: {
        Row: {
          aliases: string[] | null
          categoria: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          nome: string
          peso_medio_g: number | null
          unidade_padrao: string | null
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          nome: string
          peso_medio_g?: number | null
          unidade_padrao?: string | null
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          nome?: string
          peso_medio_g?: number | null
          unidade_padrao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alimentos_principios_ativos: {
        Row: {
          alimento_id: string | null
          alimento_nome: string | null
          beneficios: string[] | null
          concentracao: string | null
          created_at: string | null
          id: string
          principio_ativo: string
          unidade_medida: string | null
          updated_at: string | null
        }
        Insert: {
          alimento_id?: string | null
          alimento_nome?: string | null
          beneficios?: string[] | null
          concentracao?: string | null
          created_at?: string | null
          id?: string
          principio_ativo: string
          unidade_medida?: string | null
          updated_at?: string | null
        }
        Update: {
          alimento_id?: string | null
          alimento_nome?: string | null
          beneficios?: string[] | null
          concentracao?: string | null
          created_at?: string | null
          id?: string
          principio_ativo?: string
          unidade_medida?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      análise_estatísticas: {
        Row: {
          created_at: string | null
          id: string
          insights: string[] | null
          metricas: Json
          periodo: string
          tendencias: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insights?: string[] | null
          metricas: Json
          periodo: string
          tendencias?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insights?: string[] | null
          metricas?: Json
          periodo?: string
          tendencias?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          assessment_name: string
          assessment_type: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          questions: Json | null
          scoring_system: Json | null
          updated_at: string | null
        }
        Insert: {
          assessment_name: string
          assessment_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          questions?: Json | null
          scoring_system?: Json | null
          updated_at?: string | null
        }
        Update: {
          assessment_name?: string
          assessment_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          questions?: Json | null
          scoring_system?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      avaliações_sabotadores: {
        Row: {
          completed: boolean | null
          created_at: string | null
          data_avaliacao: string
          id: string
          nivel_intensidade: string | null
          plano_acao: string | null
          pontuacao_total: number | null
          recomendacoes: string[] | null
          sabotadores_identificados: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          data_avaliacao?: string
          id?: string
          nivel_intensidade?: string | null
          plano_acao?: string | null
          pontuacao_total?: number | null
          recomendacoes?: string[] | null
          sabotadores_identificados?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          data_avaliacao?: string
          id?: string
          nivel_intensidade?: string | null
          plano_acao?: string | null
          pontuacao_total?: number | null
          recomendacoes?: string[] | null
          sabotadores_identificados?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backups_anamnese_do_usuário: {
        Row: {
          created_at: string | null
          dados_backup: Json
          data_backup: string | null
          data_restauracao: string | null
          id: string
          motivo_backup: string | null
          restaurado: boolean | null
          updated_at: string | null
          user_id: string
          versao_backup: string | null
        }
        Insert: {
          created_at?: string | null
          dados_backup: Json
          data_backup?: string | null
          data_restauracao?: string | null
          id?: string
          motivo_backup?: string | null
          restaurado?: boolean | null
          updated_at?: string | null
          user_id: string
          versao_backup?: string | null
        }
        Update: {
          created_at?: string | null
          dados_backup?: Json
          data_backup?: string | null
          data_restauracao?: string | null
          id?: string
          motivo_backup?: string | null
          restaurado?: boolean | null
          updated_at?: string | null
          user_id?: string
          versao_backup?: string | null
        }
        Relationships: []
      }
      bakery_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      base_de_conhecimento_da_empresa: {
        Row: {
          categoria: string | null
          conteudo: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          prioridade: number | null
          tags: string[] | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prioridade?: number | null
          tags?: string[] | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          conteudo?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prioridade?: number | null
          tags?: string[] | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      base_de_conhecimento_sofia: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string | null
          fonte: string | null
          id: string
          is_active: boolean | null
          referencias: string[] | null
          relevancia: number | null
          tags: string[] | null
          topico: string
          updated_at: string | null
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string | null
          fonte?: string | null
          id?: string
          is_active?: boolean | null
          referencias?: string[] | null
          relevancia?: number | null
          tags?: string[] | null
          topico: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string | null
          fonte?: string | null
          id?: string
          is_active?: boolean | null
          referencias?: string[] | null
          relevancia?: number | null
          tags?: string[] | null
          topico?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bean_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      bioimpedance_analysis: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          health_score: number | null
          id: string
          measurement_id: string | null
          recommendations: string | null
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          measurement_id?: string | null
          recommendations?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          measurement_id?: string | null
          recommendations?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bioimpedance_analysis_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "weight_measurements"
            referencedColumns: ["id"]
          },
        ]
      }
      carb_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      challenge_daily_logs: {
        Row: {
          challenge_name: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          log_date: string
          notes: string | null
          numeric_value: number | null
          participation_id: string
          photo_url: string | null
          points_earned: number | null
          value_logged: string | null
        }
        Insert: {
          challenge_name?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          log_date?: string
          notes?: string | null
          numeric_value?: number | null
          participation_id: string
          photo_url?: string | null
          points_earned?: number | null
          value_logged?: string | null
        }
        Update: {
          challenge_name?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          log_date?: string
          notes?: string | null
          numeric_value?: number | null
          participation_id?: string
          photo_url?: string | null
          points_earned?: number | null
          value_logged?: string | null
        }
        Relationships: []
      }
      challenge_group_messages: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          message: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          message: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_leaderboard: {
        Row: {
          challenge_id: string | null
          id: string
          rank: number | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_leaderboard_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participations: {
        Row: {
          best_streak: number | null
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_streak: number | null
          id: string
          is_completed: boolean | null
          points_earned: number | null
          progress: number | null
          started_at: string | null
          target_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          progress?: number | null
          started_at?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          progress?: number | null
          started_at?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          auto_assign: boolean | null
          badge_icon: string | null
          badge_name: string | null
          badge_reward: string | null
          challenge_type: string | null
          color: string | null
          completion_criteria: Json | null
          created_at: string | null
          created_by: string | null
          daily_log_target: number | null
          daily_log_type: string | null
          daily_log_unit: string | null
          description: string | null
          difficulty: string | null
          duration_days: number | null
          end_date: string | null
          entry_fee: number | null
          featured: boolean | null
          frequency: string | null
          icon: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_group_challenge: boolean | null
          max_participants: number | null
          notification_settings: Json | null
          points_reward: number | null
          progress_tracking: Json | null
          requirements: Json | null
          rewards: Json | null
          rules: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          target_unit: string | null
          target_value: number | null
          tips: string[] | null
          title: string
          unit: string | null
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          auto_assign?: boolean | null
          badge_icon?: string | null
          badge_name?: string | null
          badge_reward?: string | null
          challenge_type?: string | null
          color?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          featured?: boolean | null
          frequency?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          max_participants?: number | null
          notification_settings?: Json | null
          points_reward?: number | null
          progress_tracking?: Json | null
          requirements?: Json | null
          rewards?: Json | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_unit?: string | null
          target_value?: number | null
          tips?: string[] | null
          title: string
          unit?: string | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          auto_assign?: boolean | null
          badge_icon?: string | null
          badge_name?: string | null
          badge_reward?: string | null
          challenge_type?: string | null
          color?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          featured?: boolean | null
          frequency?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          max_participants?: number | null
          notification_settings?: Json | null
          points_reward?: number | null
          progress_tracking?: Json | null
          requirements?: Json | null
          rewards?: Json | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_unit?: string | null
          target_value?: number | null
          tips?: string[] | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      chat_configurations: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          personality: string | null
          title: string | null
          total_tokens: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          personality?: string | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          personality?: string | null
          title?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_emotional_analysis: {
        Row: {
          achievements_mentioned: string[] | null
          analysis_metadata: Json | null
          concerns_mentioned: string[] | null
          conversation_id: string
          created_at: string
          emotional_topics: string[] | null
          emotions_detected: string[] | null
          energy_level: number | null
          goals_mentioned: string[] | null
          id: string
          mood_keywords: string[] | null
          pain_level: number | null
          physical_symptoms: string[] | null
          sentiment_score: number | null
          stress_level: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          achievements_mentioned?: string[] | null
          analysis_metadata?: Json | null
          concerns_mentioned?: string[] | null
          conversation_id: string
          created_at?: string
          emotional_topics?: string[] | null
          emotions_detected?: string[] | null
          energy_level?: number | null
          goals_mentioned?: string[] | null
          id?: string
          mood_keywords?: string[] | null
          pain_level?: number | null
          physical_symptoms?: string[] | null
          sentiment_score?: number | null
          stress_level?: number | null
          user_id: string
          week_start?: string
        }
        Update: {
          achievements_mentioned?: string[] | null
          analysis_metadata?: Json | null
          concerns_mentioned?: string[] | null
          conversation_id?: string
          created_at?: string
          emotional_topics?: string[] | null
          emotions_detected?: string[] | null
          energy_level?: number | null
          goals_mentioned?: string[] | null
          id?: string
          mood_keywords?: string[] | null
          pain_level?: number | null
          physical_symptoms?: string[] | null
          sentiment_score?: number | null
          stress_level?: number | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          personality: string | null
          role: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          personality?: string | null
          role?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          personality?: string | null
          role?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      combinacoes_ideais: {
        Row: {
          alimento_combinado: string
          alimento_principal: string
          beneficio: string | null
          categoria_combinacao: string | null
          created_at: string | null
          id: string
          potencializacao_percentual: number | null
          referencias_cientificas: string[] | null
          sinergia_nutricional: string | null
          updated_at: string | null
        }
        Insert: {
          alimento_combinado: string
          alimento_principal: string
          beneficio?: string | null
          categoria_combinacao?: string | null
          created_at?: string | null
          id?: string
          potencializacao_percentual?: number | null
          referencias_cientificas?: string[] | null
          sinergia_nutricional?: string | null
          updated_at?: string | null
        }
        Update: {
          alimento_combinado?: string
          alimento_principal?: string
          beneficio?: string | null
          categoria_combinacao?: string | null
          created_at?: string | null
          id?: string
          potencializacao_percentual?: number | null
          referencias_cientificas?: string[] | null
          sinergia_nutricional?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comidas_favoritas_do_usuário: {
        Row: {
          alimento_nome: string
          categoria: string | null
          created_at: string | null
          frequencia_consumo: string | null
          id: string
          nivel_preferencia: number | null
          notas: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alimento_nome: string
          categoria?: string | null
          created_at?: string | null
          frequencia_consumo?: string | null
          id?: string
          nivel_preferencia?: number | null
          notas?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alimento_nome?: string
          categoria?: string | null
          created_at?: string | null
          frequencia_consumo?: string | null
          id?: string
          nivel_preferencia?: number | null
          notas?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      company_configurations: {
        Row: {
          about_us: string | null
          company_culture: string | null
          company_name: string | null
          created_at: string
          differentials: string | null
          health_philosophy: string | null
          id: string
          main_services: string | null
          mission: string | null
          target_audience: string | null
          updated_at: string
          values: string | null
          vision: string | null
        }
        Insert: {
          about_us?: string | null
          company_culture?: string | null
          company_name?: string | null
          created_at?: string
          differentials?: string | null
          health_philosophy?: string | null
          id?: string
          main_services?: string | null
          mission?: string | null
          target_audience?: string | null
          updated_at?: string
          values?: string | null
          vision?: string | null
        }
        Update: {
          about_us?: string | null
          company_culture?: string | null
          company_name?: string | null
          created_at?: string
          differentials?: string | null
          health_philosophy?: string | null
          id?: string
          main_services?: string | null
          mission?: string | null
          target_audience?: string | null
          updated_at?: string
          values?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      company_data: {
        Row: {
          address: string | null
          company_logo: string | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_logo?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_logo?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_knowledge_base: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configurações_ai: {
        Row: {
          created_at: string | null
          custo_por_requisicao: number | null
          funcionalidade: string
          id: string
          is_enabled: boolean
          max_tokens: number
          modelo: string
          nivel: string | null
          personalidade: string | null
          prioridade: number | null
          servico: string
          system_prompt: string | null
          temperatura: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_por_requisicao?: number | null
          funcionalidade: string
          id?: string
          is_enabled?: boolean
          max_tokens?: number
          modelo?: string
          nivel?: string | null
          personalidade?: string | null
          prioridade?: number | null
          servico?: string
          system_prompt?: string | null
          temperatura?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_por_requisicao?: number | null
          funcionalidade?: string
          id?: string
          is_enabled?: boolean
          max_tokens?: number
          modelo?: string
          nivel?: string | null
          personalidade?: string | null
          prioridade?: number | null
          servico?: string
          system_prompt?: string | null
          temperatura?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      conquistas_do_usuário: {
        Row: {
          created_at: string | null
          data_desbloqueio: string | null
          descricao: string | null
          icone_badge: string | null
          id: string
          nome_conquista: string
          progresso_atual: number | null
          progresso_total: number | null
          tipo_conquista: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_desbloqueio?: string | null
          descricao?: string | null
          icone_badge?: string | null
          id?: string
          nome_conquista: string
          progresso_atual?: number | null
          progresso_total?: number | null
          tipo_conquista?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_desbloqueio?: string | null
          descricao?: string | null
          icone_badge?: string | null
          id?: string
          nome_conquista?: string
          progresso_atual?: number | null
          progresso_total?: number | null
          tipo_conquista?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_access: {
        Row: {
          access_level: string | null
          content_id: string | null
          content_type: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_level?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_attachments: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          message_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message_id?: string | null
        }
        Relationships: []
      }
      conversation_facts: {
        Row: {
          created_at: string | null
          fact_content: string | null
          fact_type: string | null
          id: string
          importance_score: number | null
          is_active: boolean | null
          source_message_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fact_content?: string | null
          fact_type?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          source_message_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fact_content?: string | null
          fact_type?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          source_message_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          attachments: Json | null
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_content: string | null
          message_type: string | null
          metadata: Json | null
          sender_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_content?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_content?: string | null
          message_type?: string | null
          metadata?: Json | null
          sender_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_completed: boolean | null
          is_premium: boolean | null
          lesson_type: string | null
          module_id: string | null
          order_index: number
          prerequisites: string[] | null
          quiz_questions: Json | null
          resources: Json | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          is_premium?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index: number
          prerequisites?: string[] | null
          quiz_questions?: Json | null
          resources?: Json | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          is_premium?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index?: number
          prerequisites?: string[] | null
          quiz_questions?: Json | null
          resources?: Json | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_name: string | null
          is_premium: boolean | null
          is_published: boolean | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cultural_context: {
        Row: {
          celebration_foods: Json | null
          country: string | null
          created_at: string | null
          cultural_practices: Json | null
          dietary_customs: string[] | null
          id: string
          is_active: boolean | null
          region: string | null
          religious_considerations: string[] | null
          traditional_foods: string[] | null
        }
        Insert: {
          celebration_foods?: Json | null
          country?: string | null
          created_at?: string | null
          cultural_practices?: Json | null
          dietary_customs?: string[] | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          religious_considerations?: string[] | null
          traditional_foods?: string[] | null
        }
        Update: {
          celebration_foods?: Json | null
          country?: string | null
          created_at?: string | null
          cultural_practices?: Json | null
          dietary_customs?: string[] | null
          id?: string
          is_active?: boolean | null
          region?: string | null
          religious_considerations?: string[] | null
          traditional_foods?: string[] | null
        }
        Relationships: []
      }
      custom_saboteurs: {
        Row: {
          behavioral_patterns: string[] | null
          category: string | null
          common_triggers: string[] | null
          coping_strategies: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mental_patterns: string[] | null
          physical_symptoms: string[] | null
          related_saboteurs: string[] | null
          saboteur_name: string
          severity_levels: Json | null
        }
        Insert: {
          behavioral_patterns?: string[] | null
          category?: string | null
          common_triggers?: string[] | null
          coping_strategies?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mental_patterns?: string[] | null
          physical_symptoms?: string[] | null
          related_saboteurs?: string[] | null
          saboteur_name: string
          severity_levels?: Json | null
        }
        Update: {
          behavioral_patterns?: string[] | null
          category?: string | null
          common_triggers?: string[] | null
          coping_strategies?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mental_patterns?: string[] | null
          physical_symptoms?: string[] | null
          related_saboteurs?: string[] | null
          saboteur_name?: string
          severity_levels?: Json | null
        }
        Relationships: []
      }
      dados_físicos_do_usuário: {
        Row: {
          altura_cm: number | null
          created_at: string | null
          data_nascimento: string | null
          id: string
          peso_atual_kg: number | null
          sexo: string | null
          tipo_sanguineo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          altura_cm?: number | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          peso_atual_kg?: number | null
          sexo?: string | null
          tipo_sanguineo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          altura_cm?: number | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          peso_atual_kg?: number | null
          sexo?: string | null
          tipo_sanguineo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_mission_sessions: {
        Row: {
          completed_sections: Json | null
          created_at: string | null
          date: string | null
          id: string
          is_completed: boolean | null
          missions_completed: number | null
          session_date: string | null
          streak_days: number | null
          total_points: number | null
          user_id: string | null
        }
        Insert: {
          completed_sections?: Json | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_completed?: boolean | null
          missions_completed?: number | null
          session_date?: string | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
        }
        Update: {
          completed_sections?: Json | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_completed?: boolean | null
          missions_completed?: number | null
          session_date?: string | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_nutrition_summary: {
        Row: {
          adherence_to_plan_percentage: number | null
          breakfast_calories: number | null
          created_at: string | null
          date: string | null
          dinner_calories: number | null
          goals_met: boolean | null
          health_score: number | null
          id: string
          lunch_calories: number | null
          meals_count: number | null
          notes: string | null
          snacks_calories: number | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_proteins: number | null
          total_water_ml: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          adherence_to_plan_percentage?: number | null
          breakfast_calories?: number | null
          created_at?: string | null
          date?: string | null
          dinner_calories?: number | null
          goals_met?: boolean | null
          health_score?: number | null
          id?: string
          lunch_calories?: number | null
          meals_count?: number | null
          notes?: string | null
          snacks_calories?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          total_water_ml?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          adherence_to_plan_percentage?: number | null
          breakfast_calories?: number | null
          created_at?: string | null
          date?: string | null
          dinner_calories?: number | null
          goals_met?: boolean | null
          health_score?: number | null
          id?: string
          lunch_calories?: number | null
          meals_count?: number | null
          notes?: string | null
          snacks_calories?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          total_water_ml?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_responses: {
        Row: {
          answer: string | null
          created_at: string | null
          date: string | null
          id: string
          points_earned: number | null
          question_id: string | null
          response: string | null
          response_type: string | null
          score: number | null
          section: string | null
          text_response: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          points_earned?: number | null
          question_id?: string | null
          response?: string | null
          response_type?: string | null
          score?: number | null
          section?: string | null
          text_response?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          points_earned?: number | null
          question_id?: string | null
          response?: string | null
          response_type?: string | null
          score?: number | null
          section?: string | null
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      demographic_nutrition: {
        Row: {
          age_group: string | null
          created_at: string | null
          gender: string | null
          id: string
          life_stage: string | null
          nutritional_needs: Json | null
          recommended_intake: Json | null
          special_considerations: string[] | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          life_stage?: string | null
          nutritional_needs?: Json | null
          recommended_intake?: Json | null
          special_considerations?: string[] | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          life_stage?: string | null
          nutritional_needs?: Json | null
          recommended_intake?: Json | null
          special_considerations?: string[] | null
        }
        Relationships: []
      }
      desafios_esportivos: {
        Row: {
          badge_recompensa: string | null
          created_at: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          duracao_dias: number | null
          esporte: string | null
          id: string
          instrucoes: string | null
          is_grupo: boolean | null
          max_participantes: number | null
          meta_unidade: string | null
          meta_valor: number | null
          nivel_dificuldade: string | null
          pontos_recompensa: number | null
          regras: string | null
          tipo_desafio: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          badge_recompensa?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          duracao_dias?: number | null
          esporte?: string | null
          id?: string
          instrucoes?: string | null
          is_grupo?: boolean | null
          max_participantes?: number | null
          meta_unidade?: string | null
          meta_valor?: number | null
          nivel_dificuldade?: string | null
          pontos_recompensa?: number | null
          regras?: string | null
          tipo_desafio?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          badge_recompensa?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          duracao_dias?: number | null
          esporte?: string | null
          id?: string
          instrucoes?: string | null
          is_grupo?: boolean | null
          max_participantes?: number | null
          meta_unidade?: string | null
          meta_valor?: number | null
          nivel_dificuldade?: string | null
          pontos_recompensa?: number | null
          regras?: string | null
          tipo_desafio?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      device_sync_log: {
        Row: {
          created_at: string | null
          data_synced: Json | null
          device_id: string | null
          device_type: string | null
          error_message: string | null
          id: string
          records_synced: number | null
          sync_status: string | null
          sync_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_synced?: Json | null
          device_id?: string | null
          device_type?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          sync_status?: string | null
          sync_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_synced?: Json | null
          device_id?: string | null
          device_type?: string | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          sync_status?: string | null
          sync_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      diseases_conditions: {
        Row: {
          category: string | null
          condition_name: string
          created_at: string | null
          description: string | null
          dietary_recommendations: string[] | null
          exercise_recommendations: string[] | null
          id: string
          is_active: boolean | null
          lifestyle_modifications: string[] | null
          prevention_tips: string[] | null
          related_conditions: string[] | null
          risk_factors: string[] | null
          severity_levels: Json | null
          symptoms: string[] | null
          treatment_approaches: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          condition_name: string
          created_at?: string | null
          description?: string | null
          dietary_recommendations?: string[] | null
          exercise_recommendations?: string[] | null
          id?: string
          is_active?: boolean | null
          lifestyle_modifications?: string[] | null
          prevention_tips?: string[] | null
          related_conditions?: string[] | null
          risk_factors?: string[] | null
          severity_levels?: Json | null
          symptoms?: string[] | null
          treatment_approaches?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          condition_name?: string
          created_at?: string | null
          description?: string | null
          dietary_recommendations?: string[] | null
          exercise_recommendations?: string[] | null
          id?: string
          is_active?: boolean | null
          lifestyle_modifications?: string[] | null
          prevention_tips?: string[] | null
          related_conditions?: string[] | null
          risk_factors?: string[] | null
          severity_levels?: Json | null
          symptoms?: string[] | null
          treatment_approaches?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documentos_médicos: {
        Row: {
          alertas: string[] | null
          analise_completa: Json | null
          analise_ia: string | null
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_url: string | null
          categoria: string | null
          compartilhado_com: string[] | null
          created_at: string | null
          data_documento: string | null
          data_processamento: string | null
          data_proxima_revisao: string | null
          descricao: string | null
          id: string
          instituicao: string | null
          is_publico: boolean | null
          medico_responsavel: string | null
          metadata: Json | null
          notas_profissional: string | null
          notas_usuario: string | null
          prioridade: string | null
          processado: boolean | null
          resultado_geral: string | null
          resultados_exames: Json | null
          status: string | null
          tags: string[] | null
          tipo_documento: string
          tipo_mime: string | null
          titulo: string
          updated_at: string | null
          user_id: string
          versao_processamento: string | null
        }
        Insert: {
          alertas?: string[] | null
          analise_completa?: Json | null
          analise_ia?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          categoria?: string | null
          compartilhado_com?: string[] | null
          created_at?: string | null
          data_documento?: string | null
          data_processamento?: string | null
          data_proxima_revisao?: string | null
          descricao?: string | null
          id?: string
          instituicao?: string | null
          is_publico?: boolean | null
          medico_responsavel?: string | null
          metadata?: Json | null
          notas_profissional?: string | null
          notas_usuario?: string | null
          prioridade?: string | null
          processado?: boolean | null
          resultado_geral?: string | null
          resultados_exames?: Json | null
          status?: string | null
          tags?: string[] | null
          tipo_documento: string
          tipo_mime?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
          versao_processamento?: string | null
        }
        Update: {
          alertas?: string[] | null
          analise_completa?: Json | null
          analise_ia?: string | null
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_url?: string | null
          categoria?: string | null
          compartilhado_com?: string[] | null
          created_at?: string | null
          data_documento?: string | null
          data_processamento?: string | null
          data_proxima_revisao?: string | null
          descricao?: string | null
          id?: string
          instituicao?: string | null
          is_publico?: boolean | null
          medico_responsavel?: string | null
          metadata?: Json | null
          notas_profissional?: string | null
          notas_usuario?: string | null
          prioridade?: string | null
          processado?: boolean | null
          resultado_geral?: string | null
          resultados_exames?: Json | null
          status?: string | null
          tags?: string[] | null
          tipo_documento?: string
          tipo_mime?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
          versao_processamento?: string | null
        }
        Relationships: []
      }
      dr_vital_memory: {
        Row: {
          created_at: string | null
          id: string
          memory_key: string
          memory_value: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_key: string
          memory_value?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      economic_information: {
        Row: {
          availability: string | null
          average_price: number | null
          currency: string | null
          food_name: string | null
          id: string
          price_range_max: number | null
          price_range_min: number | null
          region: string | null
          season: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          average_price?: number | null
          currency?: string | null
          food_name?: string | null
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          region?: string | null
          season?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          average_price?: number | null
          currency?: string | null
          food_name?: string | null
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          region?: string | null
          season?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      environmental_impact: {
        Row: {
          carbon_footprint_kg: number | null
          created_at: string | null
          eco_certifications: string[] | null
          food_name: string
          id: string
          land_usage_sqm: number | null
          local_production: boolean | null
          seasonal_availability: string[] | null
          sustainability_rating: string | null
          water_usage_liters: number | null
        }
        Insert: {
          carbon_footprint_kg?: number | null
          created_at?: string | null
          eco_certifications?: string[] | null
          food_name: string
          id?: string
          land_usage_sqm?: number | null
          local_production?: boolean | null
          seasonal_availability?: string[] | null
          sustainability_rating?: string | null
          water_usage_liters?: number | null
        }
        Update: {
          carbon_footprint_kg?: number | null
          created_at?: string | null
          eco_certifications?: string[] | null
          food_name?: string
          id?: string
          land_usage_sqm?: number | null
          local_production?: boolean | null
          seasonal_availability?: string[] | null
          sustainability_rating?: string | null
          water_usage_liters?: number | null
        }
        Relationships: []
      }
      exercise_ai_recommendations: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          priority_level: string | null
          reasoning: string | null
          recommendation_text: string | null
          recommendation_type: string | null
          recommended_exercises: Json | null
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority_level?: string | null
          reasoning?: string | null
          recommendation_text?: string | null
          recommendation_type?: string | null
          recommended_exercises?: Json | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority_level?: string | null
          reasoning?: string | null
          recommendation_text?: string | null
          recommendation_type?: string | null
          recommended_exercises?: Json | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      exercise_nutrition: {
        Row: {
          created_at: string | null
          exercise_type: string
          hydration_guidelines: string | null
          id: string
          is_active: boolean | null
          post_workout_recommendations: Json | null
          pre_workout_recommendations: Json | null
          supplement_suggestions: string[] | null
          timing_guidelines: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_type: string
          hydration_guidelines?: string | null
          id?: string
          is_active?: boolean | null
          post_workout_recommendations?: Json | null
          pre_workout_recommendations?: Json | null
          supplement_suggestions?: string[] | null
          timing_guidelines?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_type?: string
          hydration_guidelines?: string | null
          id?: string
          is_active?: boolean | null
          post_workout_recommendations?: Json | null
          pre_workout_recommendations?: Json | null
          supplement_suggestions?: string[] | null
          timing_guidelines?: string | null
        }
        Relationships: []
      }
      exercise_programs: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_weeks: number | null
          exercises: Json | null
          goal: string | null
          id: string
          is_active: boolean | null
          name: string
          sessions_per_week: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sessions_per_week?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sessions_per_week?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_progress_analysis: {
        Row: {
          analysis_period: string | null
          avg_intensity: number | null
          created_at: string | null
          id: string
          improvements: Json | null
          next_goals: string[] | null
          period_end: string | null
          period_start: string | null
          recommendations: string[] | null
          total_duration_minutes: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_period?: string | null
          avg_intensity?: number | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          next_goals?: string[] | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          total_duration_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_period?: string | null
          avg_intensity?: number | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          next_goals?: string[] | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          total_duration_minutes?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_progress_logs: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string | null
          exercise_name: string
          id: string
          notes: string | null
          perceived_difficulty: number | null
          reps_completed: number | null
          set_number: number
          user_id: string
          weight_kg: number | null
          workout_date: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          perceived_difficulty?: number | null
          reps_completed?: number | null
          set_number?: number
          user_id: string
          weight_kg?: number | null
          workout_date?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          perceived_difficulty?: number | null
          reps_completed?: number | null
          set_number?: number
          user_id?: string
          weight_kg?: number | null
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progress_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_library"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          duration_minutes: number | null
          exercises: Json | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          intensity_level: string | null
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          performance_rating: number | null
          session_date: string | null
          session_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          intensity_level?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          performance_rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          intensity_level?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          performance_rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_tracking: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          date: string | null
          distance_km: number | null
          duration_minutes: number | null
          exercise_type: string | null
          heart_rate_avg: number | null
          id: string
          notes: string | null
          steps: number | null
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          exercise_type?: string | null
          heart_rate_avg?: number | null
          id?: string
          notes?: string | null
          steps?: number | null
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          exercise_type?: string | null
          heart_rate_avg?: number | null
          id?: string
          notes?: string | null
          steps?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          calories_per_minute: number | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_seconds: number | null
          equipment: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          muscle_group: string | null
          name: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          calories_per_minute?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          muscle_group?: string | null
          name: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          calories_per_minute?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          muscle_group?: string | null
          name?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      exercises_library: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          equipment_needed: string[] | null
          id: string
          image_url: string | null
          instructions: string[] | null
          is_active: boolean | null
          location: string
          muscle_group: string | null
          name: string
          order_index: number | null
          reps: string | null
          rest_time: string | null
          sets: string | null
          tips: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_active?: boolean | null
          location: string
          muscle_group?: string | null
          name: string
          order_index?: number | null
          reps?: string | null
          rest_time?: string | null
          sets?: string | null
          tips?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_active?: boolean | null
          location?: string
          muscle_group?: string | null
          name?: string
          order_index?: number | null
          reps?: string | null
          rest_time?: string | null
          sets?: string | null
          tips?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      fatos_da_conversação: {
        Row: {
          conteudo_fato: string | null
          created_at: string | null
          id: string
          importancia: number | null
          is_active: boolean | null
          mensagem_origem_id: string | null
          tags: string[] | null
          tipo_fato: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conteudo_fato?: string | null
          created_at?: string | null
          id?: string
          importancia?: number | null
          is_active?: boolean | null
          mensagem_origem_id?: string | null
          tags?: string[] | null
          tipo_fato?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conteudo_fato?: string | null
          created_at?: string | null
          id?: string
          importancia?: number | null
          is_active?: boolean | null
          mensagem_origem_id?: string | null
          tags?: string[] | null
          tipo_fato?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_active_principles: {
        Row: {
          active_principle_name: string
          concentration: string | null
          created_at: string | null
          food_id: string | null
          health_benefit: string | null
          id: string
          is_verified: boolean | null
          scientific_evidence: string | null
        }
        Insert: {
          active_principle_name: string
          concentration?: string | null
          created_at?: string | null
          food_id?: string | null
          health_benefit?: string | null
          id?: string
          is_verified?: boolean | null
          scientific_evidence?: string | null
        }
        Update: {
          active_principle_name?: string
          concentration?: string | null
          created_at?: string | null
          food_id?: string | null
          health_benefit?: string | null
          id?: string
          is_verified?: boolean | null
          scientific_evidence?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_active_principles_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "nutrition_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_aliases: {
        Row: {
          alias_name: string
          food_id: string | null
          id: string
          language: string | null
        }
        Insert: {
          alias_name: string
          food_id?: string | null
          id?: string
          language?: string | null
        }
        Update: {
          alias_name?: string
          food_id?: string | null
          id?: string
          language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_aliases_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "nutrition_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_analysis: {
        Row: {
          created_at: string | null
          food_items: string[] | null
          health_rating: number | null
          id: string
          image_url: string | null
          meal_type: string | null
          nutrition_analysis: Json | null
          recommendations: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_proteins: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          food_items?: string[] | null
          health_rating?: number | null
          id?: string
          image_url?: string | null
          meal_type?: string | null
          nutrition_analysis?: Json | null
          recommendations?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_proteins?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          food_items?: string[] | null
          health_rating?: number | null
          id?: string
          image_url?: string | null
          meal_type?: string | null
          nutrition_analysis?: Json | null
          recommendations?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_proteins?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_contraindications: {
        Row: {
          alternative_suggestions: string[] | null
          condition_name: string | null
          contraindication_type: string | null
          created_at: string | null
          food_name: string
          id: string
          is_active: boolean | null
          reason: string | null
          scientific_reference: string | null
          severity: string | null
        }
        Insert: {
          alternative_suggestions?: string[] | null
          condition_name?: string | null
          contraindication_type?: string | null
          created_at?: string | null
          food_name: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          scientific_reference?: string | null
          severity?: string | null
        }
        Update: {
          alternative_suggestions?: string[] | null
          condition_name?: string | null
          contraindication_type?: string | null
          created_at?: string | null
          food_name?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
          scientific_reference?: string | null
          severity?: string | null
        }
        Relationships: []
      }
      food_densities: {
        Row: {
          density_g_ml: number | null
          food_name: string
        }
        Insert: {
          density_g_ml?: number | null
          food_name: string
        }
        Update: {
          density_g_ml?: number | null
          food_name?: string
        }
        Relationships: []
      }
      food_diseases: {
        Row: {
          benefit_level: string | null
          created_at: string | null
          disease_id: string | null
          disease_name: string | null
          dosage_recommendation: string | null
          evidence_quality: string | null
          food_id: string | null
          food_name: string | null
          id: string
          is_active: boolean | null
          mechanism: string | null
          precautions: string[] | null
          relationship_type: string | null
        }
        Insert: {
          benefit_level?: string | null
          created_at?: string | null
          disease_id?: string | null
          disease_name?: string | null
          dosage_recommendation?: string | null
          evidence_quality?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          is_active?: boolean | null
          mechanism?: string | null
          precautions?: string[] | null
          relationship_type?: string | null
        }
        Update: {
          benefit_level?: string | null
          created_at?: string | null
          disease_id?: string | null
          disease_name?: string | null
          dosage_recommendation?: string | null
          evidence_quality?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          is_active?: boolean | null
          mechanism?: string | null
          precautions?: string[] | null
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_diseases_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "nutrition_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_preparation_preservation: {
        Row: {
          best_practices: string[] | null
          common_mistakes: string[] | null
          cooking_tips: string[] | null
          created_at: string | null
          food_name: string
          food_safety_tips: string[] | null
          id: string
          is_active: boolean | null
          nutritional_impact: Json | null
          preparation_methods: Json | null
          preservation_methods: Json | null
          storage_conditions: string | null
          storage_duration: string | null
        }
        Insert: {
          best_practices?: string[] | null
          common_mistakes?: string[] | null
          cooking_tips?: string[] | null
          created_at?: string | null
          food_name: string
          food_safety_tips?: string[] | null
          id?: string
          is_active?: boolean | null
          nutritional_impact?: Json | null
          preparation_methods?: Json | null
          preservation_methods?: Json | null
          storage_conditions?: string | null
          storage_duration?: string | null
        }
        Update: {
          best_practices?: string[] | null
          common_mistakes?: string[] | null
          cooking_tips?: string[] | null
          created_at?: string | null
          food_name?: string
          food_safety_tips?: string[] | null
          id?: string
          is_active?: boolean | null
          nutritional_impact?: Json | null
          preparation_methods?: Json | null
          preservation_methods?: Json | null
          storage_conditions?: string | null
          storage_duration?: string | null
        }
        Relationships: []
      }
      food_security: {
        Row: {
          allergen_info: string[] | null
          created_at: string | null
          cross_contamination_risks: string[] | null
          expiration_guidelines: string | null
          food_name: string
          foodborne_illness_risks: string[] | null
          handling_precautions: string[] | null
          id: string
          is_active: boolean | null
          recall_history: Json | null
          safe_temperature_range: string | null
          storage_safety: string | null
        }
        Insert: {
          allergen_info?: string[] | null
          created_at?: string | null
          cross_contamination_risks?: string[] | null
          expiration_guidelines?: string | null
          food_name: string
          foodborne_illness_risks?: string[] | null
          handling_precautions?: string[] | null
          id?: string
          is_active?: boolean | null
          recall_history?: Json | null
          safe_temperature_range?: string | null
          storage_safety?: string | null
        }
        Update: {
          allergen_info?: string[] | null
          created_at?: string | null
          cross_contamination_risks?: string[] | null
          expiration_guidelines?: string | null
          food_name?: string
          foodborne_illness_risks?: string[] | null
          handling_precautions?: string[] | null
          id?: string
          is_active?: boolean | null
          recall_history?: Json | null
          safe_temperature_range?: string | null
          storage_safety?: string | null
        }
        Relationships: []
      }
      food_yields: {
        Row: {
          cooked_weight_g: number | null
          food_name: string
          id: string
          raw_weight_g: number | null
          yield_percentage: number | null
        }
        Insert: {
          cooked_weight_g?: number | null
          food_name: string
          id?: string
          raw_weight_g?: number | null
          yield_percentage?: number | null
        }
        Update: {
          cooked_weight_g?: number | null
          food_name?: string
          id?: string
          raw_weight_g?: number | null
          yield_percentage?: number | null
        }
        Relationships: []
      }
      fruit_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      goal_benefits: {
        Row: {
          benefit_description: string | null
          benefit_title: string | null
          created_at: string | null
          evidence_level: string | null
          goal_type: string
          health_impact: string | null
          id: string
          is_active: boolean | null
          sustainability_level: string | null
          time_to_benefit: string | null
        }
        Insert: {
          benefit_description?: string | null
          benefit_title?: string | null
          created_at?: string | null
          evidence_level?: string | null
          goal_type: string
          health_impact?: string | null
          id?: string
          is_active?: boolean | null
          sustainability_level?: string | null
          time_to_benefit?: string | null
        }
        Update: {
          benefit_description?: string | null
          benefit_title?: string | null
          created_at?: string | null
          evidence_level?: string | null
          goal_type?: string
          health_impact?: string | null
          id?: string
          is_active?: boolean | null
          sustainability_level?: string | null
          time_to_benefit?: string | null
        }
        Relationships: []
      }
      goal_updates: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          new_value: number | null
          notes: string | null
          previous_value: number | null
          update_type: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_value?: number | null
          notes?: string | null
          previous_value?: number | null
          update_type?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_value?: number | null
          notes?: string | null
          previous_value?: number | null
          update_type?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_updates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      google_fit_analysis: {
        Row: {
          activity_trend: string | null
          analysis_date: string | null
          avg_daily_steps: number | null
          avg_heart_rate: number | null
          avg_sleep_hours: number | null
          created_at: string | null
          data_quality_score: number | null
          health_score: number | null
          id: string
          insights: string[] | null
          period_end: string | null
          period_start: string | null
          period_type: string | null
          recommendations: string[] | null
          resting_heart_rate: number | null
          sleep_quality_avg: number | null
          total_active_minutes: number | null
          total_calories: number | null
          total_distance_km: number | null
          total_steps: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_trend?: string | null
          analysis_date?: string | null
          avg_daily_steps?: number | null
          avg_heart_rate?: number | null
          avg_sleep_hours?: number | null
          created_at?: string | null
          data_quality_score?: number | null
          health_score?: number | null
          id?: string
          insights?: string[] | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          recommendations?: string[] | null
          resting_heart_rate?: number | null
          sleep_quality_avg?: number | null
          total_active_minutes?: number | null
          total_calories?: number | null
          total_distance_km?: number | null
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_trend?: string | null
          analysis_date?: string | null
          avg_daily_steps?: number | null
          avg_heart_rate?: number | null
          avg_sleep_hours?: number | null
          created_at?: string | null
          data_quality_score?: number | null
          health_score?: number | null
          id?: string
          insights?: string[] | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          recommendations?: string[] | null
          resting_heart_rate?: number | null
          sleep_quality_avg?: number | null
          total_active_minutes?: number | null
          total_calories?: number | null
          total_distance_km?: number | null
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      google_fit_data: {
        Row: {
          active_minutes: number | null
          bmi: number | null
          body_fat_percentage: number | null
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          data_quality: number | null
          data_source: string | null
          date: string
          device_type: string | null
          distance_meters: number | null
          exercise_calories: number | null
          exercise_minutes: number | null
          fat_g: number | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          heart_rate_min: number | null
          heart_rate_resting: number | null
          height_cm: number | null
          hydration_ml: number | null
          id: string
          location: string | null
          muscle_mass_kg: number | null
          nutrition_calories: number | null
          oxygen_saturation: number | null
          protein_g: number | null
          raw_data: Json | null
          respiratory_rate: number | null
          sleep_efficiency: number | null
          sleep_hours: number | null
          sleep_stages: Json | null
          steps: number | null
          sync_timestamp: string | null
          temperature_celsius: number | null
          user_id: string
          water_intake_ml: number | null
          weather: string | null
          weight_kg: number | null
          workout_sessions: number | null
        }
        Insert: {
          active_minutes?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          data_quality?: number | null
          data_source?: string | null
          date: string
          device_type?: string | null
          distance_meters?: number | null
          exercise_calories?: number | null
          exercise_minutes?: number | null
          fat_g?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_min?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          hydration_ml?: number | null
          id?: string
          location?: string | null
          muscle_mass_kg?: number | null
          nutrition_calories?: number | null
          oxygen_saturation?: number | null
          protein_g?: number | null
          raw_data?: Json | null
          respiratory_rate?: number | null
          sleep_efficiency?: number | null
          sleep_hours?: number | null
          sleep_stages?: Json | null
          steps?: number | null
          sync_timestamp?: string | null
          temperature_celsius?: number | null
          user_id: string
          water_intake_ml?: number | null
          weather?: string | null
          weight_kg?: number | null
          workout_sessions?: number | null
        }
        Update: {
          active_minutes?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          data_quality?: number | null
          data_source?: string | null
          date?: string
          device_type?: string | null
          distance_meters?: number | null
          exercise_calories?: number | null
          exercise_minutes?: number | null
          fat_g?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_min?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          hydration_ml?: number | null
          id?: string
          location?: string | null
          muscle_mass_kg?: number | null
          nutrition_calories?: number | null
          oxygen_saturation?: number | null
          protein_g?: number | null
          raw_data?: Json | null
          respiratory_rate?: number | null
          sleep_efficiency?: number | null
          sleep_hours?: number | null
          sleep_stages?: Json | null
          steps?: number | null
          sync_timestamp?: string | null
          temperature_celsius?: number | null
          user_id?: string
          water_intake_ml?: number | null
          weather?: string | null
          weight_kg?: number | null
          workout_sessions?: number | null
        }
        Relationships: []
      }
      google_fit_data_extended: {
        Row: {
          active_minutes: number | null
          awake_minutes: number | null
          body_fat_percentage: number | null
          calories_burned: number | null
          created_at: string | null
          data_source: string | null
          data_type: string | null
          deep_sleep_minutes: number | null
          distance_meters: number | null
          end_time: string | null
          energy_level: number | null
          heart_rate_avg: number | null
          heart_rate_bpm: number | null
          heart_rate_max: number | null
          heart_rate_min: number | null
          heart_rate_resting: number | null
          height_cm: number | null
          id: string
          light_sleep_minutes: number | null
          metadata: Json | null
          mood_score: number | null
          nutrition_calories: number | null
          nutrition_carbs_g: number | null
          nutrition_fat_g: number | null
          nutrition_protein_g: number | null
          raw_data: Json | null
          rem_sleep_minutes: number | null
          sleep_duration_minutes: number | null
          sleep_quality_score: number | null
          start_time: string | null
          steps: number | null
          stress_level: number | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
          value: number | null
          water_ml: number | null
          weight_kg: number | null
        }
        Insert: {
          active_minutes?: number | null
          awake_minutes?: number | null
          body_fat_percentage?: number | null
          calories_burned?: number | null
          created_at?: string | null
          data_source?: string | null
          data_type?: string | null
          deep_sleep_minutes?: number | null
          distance_meters?: number | null
          end_time?: string | null
          energy_level?: number | null
          heart_rate_avg?: number | null
          heart_rate_bpm?: number | null
          heart_rate_max?: number | null
          heart_rate_min?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          id?: string
          light_sleep_minutes?: number | null
          metadata?: Json | null
          mood_score?: number | null
          nutrition_calories?: number | null
          nutrition_carbs_g?: number | null
          nutrition_fat_g?: number | null
          nutrition_protein_g?: number | null
          raw_data?: Json | null
          rem_sleep_minutes?: number | null
          sleep_duration_minutes?: number | null
          sleep_quality_score?: number | null
          start_time?: string | null
          steps?: number | null
          stress_level?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
          water_ml?: number | null
          weight_kg?: number | null
        }
        Update: {
          active_minutes?: number | null
          awake_minutes?: number | null
          body_fat_percentage?: number | null
          calories_burned?: number | null
          created_at?: string | null
          data_source?: string | null
          data_type?: string | null
          deep_sleep_minutes?: number | null
          distance_meters?: number | null
          end_time?: string | null
          energy_level?: number | null
          heart_rate_avg?: number | null
          heart_rate_bpm?: number | null
          heart_rate_max?: number | null
          heart_rate_min?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          id?: string
          light_sleep_minutes?: number | null
          metadata?: Json | null
          mood_score?: number | null
          nutrition_calories?: number | null
          nutrition_carbs_g?: number | null
          nutrition_fat_g?: number | null
          nutrition_protein_g?: number | null
          raw_data?: Json | null
          rem_sleep_minutes?: number | null
          sleep_duration_minutes?: number | null
          sleep_quality_score?: number | null
          start_time?: string | null
          steps?: number | null
          stress_level?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
          water_ml?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      google_fit_tokens: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_alerts: {
        Row: {
          acknowledged_at: string | null
          action_required: boolean | null
          alert_type: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string | null
          related_data: Json | null
          severity: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          action_required?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string | null
          related_data?: Json | null
          severity?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          action_required?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string | null
          related_data?: Json | null
          severity?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          condition_name: string | null
          created_at: string | null
          diagnosed_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          condition_name?: string | null
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          condition_name?: string | null
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_diary: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          exercise_minutes: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          sleep_hours: number | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      health_feed_comments: {
        Row: {
          comment_text: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "health_feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      health_feed_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      health_feed_group_members: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_feed_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "health_feed_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      health_feed_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          group_name: string
          group_type: string | null
          id: string
          members_count: number | null
          privacy_level: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_name: string
          group_type?: string | null
          id?: string
          members_count?: number | null
          privacy_level?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_name?: string
          group_type?: string | null
          id?: string
          members_count?: number | null
          privacy_level?: string | null
        }
        Relationships: []
      }
      health_feed_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          metadata: Json | null
          post_type: string | null
          shares_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          metadata?: Json | null
          post_type?: string | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          metadata?: Json | null
          post_type?: string | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      health_feed_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_feed_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "health_feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      health_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          integration_type: string | null
          is_active: boolean | null
          last_sync_at: string | null
          provider_name: string | null
          refresh_token: string | null
          token_expires_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          provider_name?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          provider_name?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      heart_rate_data: {
        Row: {
          activity_context: string | null
          created_at: string | null
          device_source: string | null
          heart_rate_bpm: number
          heart_rate_variability: number | null
          id: string
          max_heart_rate: number | null
          measurement_time: string | null
          measurement_type: string | null
          notes: string | null
          recovery_time_minutes: number | null
          resting_heart_rate: number | null
          stress_level: string | null
          user_id: string | null
        }
        Insert: {
          activity_context?: string | null
          created_at?: string | null
          device_source?: string | null
          heart_rate_bpm: number
          heart_rate_variability?: number | null
          id?: string
          max_heart_rate?: number | null
          measurement_time?: string | null
          measurement_type?: string | null
          notes?: string | null
          recovery_time_minutes?: number | null
          resting_heart_rate?: number | null
          stress_level?: string | null
          user_id?: string | null
        }
        Update: {
          activity_context?: string | null
          created_at?: string | null
          device_source?: string | null
          heart_rate_bpm?: number
          heart_rate_variability?: number | null
          id?: string
          max_heart_rate?: number | null
          measurement_time?: string | null
          measurement_type?: string | null
          notes?: string | null
          recovery_time_minutes?: number | null
          resting_heart_rate?: number | null
          stress_level?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      image_cache: {
        Row: {
          access_count: number | null
          accessed_at: string | null
          base64_data: string | null
          created_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          storage_path: string
        }
        Insert: {
          access_count?: number | null
          accessed_at?: string | null
          base64_data?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_path: string
        }
        Update: {
          access_count?: number | null
          accessed_at?: string | null
          base64_data?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string
        }
        Relationships: []
      }
      informações_economicas: {
        Row: {
          alimento_nome: string | null
          disponibilidade: string | null
          faixa_preco_max: number | null
          faixa_preco_min: number | null
          id: string
          moeda: string | null
          preco_medio: number | null
          regiao: string | null
          sazonalidade: string | null
          updated_at: string | null
        }
        Insert: {
          alimento_nome?: string | null
          disponibilidade?: string | null
          faixa_preco_max?: number | null
          faixa_preco_min?: number | null
          id?: string
          moeda?: string | null
          preco_medio?: number | null
          regiao?: string | null
          sazonalidade?: string | null
          updated_at?: string | null
        }
        Update: {
          alimento_nome?: string | null
          disponibilidade?: string | null
          faixa_preco_max?: number | null
          faixa_preco_min?: number | null
          id?: string
          moeda?: string | null
          preco_medio?: number | null
          regiao?: string | null
          sazonalidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      information_feedback: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string | null
          feedback_text: string | null
          feedback_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      institute_nutritional_catalog: {
        Row: {
          bioactive_compounds: Json | null
          category: string | null
          certification_info: Json | null
          contraindications: string[] | null
          created_at: string | null
          drug_interactions: string[] | null
          food_code: string | null
          food_name: string
          health_benefits: string[] | null
          id: string
          is_verified: boolean | null
          nutritional_data: Json | null
          preparation_notes: string | null
          quality_grade: string | null
          recommended_portions: string | null
          research_references: string[] | null
          source: string | null
          subcategory: string | null
          therapeutic_uses: string[] | null
        }
        Insert: {
          bioactive_compounds?: Json | null
          category?: string | null
          certification_info?: Json | null
          contraindications?: string[] | null
          created_at?: string | null
          drug_interactions?: string[] | null
          food_code?: string | null
          food_name: string
          health_benefits?: string[] | null
          id?: string
          is_verified?: boolean | null
          nutritional_data?: Json | null
          preparation_notes?: string | null
          quality_grade?: string | null
          recommended_portions?: string | null
          research_references?: string[] | null
          source?: string | null
          subcategory?: string | null
          therapeutic_uses?: string[] | null
        }
        Update: {
          bioactive_compounds?: Json | null
          category?: string | null
          certification_info?: Json | null
          contraindications?: string[] | null
          created_at?: string | null
          drug_interactions?: string[] | null
          food_code?: string | null
          food_name?: string
          health_benefits?: string[] | null
          id?: string
          is_verified?: boolean | null
          nutritional_data?: Json | null
          preparation_notes?: string | null
          quality_grade?: string | null
          recommended_portions?: string | null
          research_references?: string[] | null
          source?: string | null
          subcategory?: string | null
          therapeutic_uses?: string[] | null
        }
        Relationships: []
      }
      layout_config: {
        Row: {
          config_key: string
          config_value: Json | null
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          is_premium: boolean | null
          module_id: string
          order_index: number
          quiz_questions: Json | null
          resources: Json | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          module_id: string
          order_index: number
          quiz_questions?: Json | null
          resources?: Json | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          module_id?: string
          order_index?: number
          quiz_questions?: Json | null
          resources?: Json | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lições: {
        Row: {
          conteudo: string | null
          created_at: string | null
          curso_id: string | null
          descricao: string | null
          duracao_minutos: number | null
          id: string
          is_completed: boolean | null
          is_premium: boolean | null
          modulo_id: string | null
          ordem_index: number
          prerequisitos: string[] | null
          questoes_quiz: Json | null
          recursos: Json | null
          tipo_licao: string | null
          titulo: string
          updated_at: string | null
          url_thumbnail: string | null
          url_video: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          is_completed?: boolean | null
          is_premium?: boolean | null
          modulo_id?: string | null
          ordem_index: number
          prerequisitos?: string[] | null
          questoes_quiz?: Json | null
          recursos?: Json | null
          tipo_licao?: string | null
          titulo: string
          updated_at?: string | null
          url_thumbnail?: string | null
          url_video?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          is_completed?: boolean | null
          is_premium?: boolean | null
          modulo_id?: string | null
          ordem_index?: number
          prerequisitos?: string[] | null
          questoes_quiz?: Json | null
          recursos?: Json | null
          tipo_licao?: string | null
          titulo?: string
          updated_at?: string | null
          url_thumbnail?: string | null
          url_video?: string | null
        }
        Relationships: []
      }
      meal_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          meal_id: string | null
          rating: number | null
          user_id: string | null
          would_eat_again: boolean | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          meal_id?: string | null
          rating?: number | null
          user_id?: string | null
          would_eat_again?: boolean | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          meal_id?: string | null
          rating?: number | null
          user_id?: string | null
          would_eat_again?: boolean | null
        }
        Relationships: []
      }
      meal_plan_history: {
        Row: {
          created_at: string | null
          id: string
          meal_plan_data: Json | null
          plan_type: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_plan_data?: Json | null
          plan_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_plan_data?: Json | null
          plan_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          day_of_week: number | null
          fats: number | null
          food_items: Json | null
          id: string
          meal_name: string | null
          meal_plan_id: string | null
          meal_type: string | null
          order_index: number | null
          preparation_instructions: string | null
          proteins: number | null
          recipe_id: string | null
          timing: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          day_of_week?: number | null
          fats?: number | null
          food_items?: Json | null
          id?: string
          meal_name?: string | null
          meal_plan_id?: string | null
          meal_type?: string | null
          order_index?: number | null
          preparation_instructions?: string | null
          proteins?: number | null
          recipe_id?: string | null
          timing?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          day_of_week?: number | null
          fats?: number | null
          food_items?: Json | null
          id?: string
          meal_name?: string | null
          meal_plan_id?: string | null
          meal_type?: string | null
          order_index?: number | null
          preparation_instructions?: string | null
          proteins?: number | null
          recipe_id?: string | null
          timing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          daily_calories: number | null
          daily_carbs: number | null
          daily_fats: number | null
          daily_proteins: number | null
          description: string | null
          goal: string | null
          id: string
          is_active: boolean | null
          meals: Json | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fats?: number | null
          daily_proteins?: number | null
          description?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          meals?: Json | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fats?: number | null
          daily_proteins?: number | null
          description?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          meals?: Json | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meal_suggestions: {
        Row: {
          created_at: string | null
          date_suggested: string | null
          health_score: number | null
          id: string
          is_favorite: boolean | null
          meal_type: string | null
          nutritional_values: Json | null
          reason: string | null
          suggestion_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_suggested?: string | null
          health_score?: number | null
          id?: string
          is_favorite?: boolean | null
          meal_type?: string | null
          nutritional_values?: Json | null
          reason?: string | null
          suggestion_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_suggested?: string | null
          health_score?: number | null
          id?: string
          is_favorite?: boolean | null
          meal_type?: string | null
          nutritional_values?: Json | null
          reason?: string | null
          suggestion_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          analysis_result: Json | null
          analysis_status: string | null
          created_at: string | null
          doctor_name: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          idempotency_key: string | null
          images_processed: number | null
          images_total: number | null
          processing_stage: string | null
          processing_started_at: string | null
          progress_pct: number | null
          report_meta: Json | null
          report_path: string | null
          results: Json | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          analysis_status?: string | null
          created_at?: string | null
          doctor_name?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          idempotency_key?: string | null
          images_processed?: number | null
          images_total?: number | null
          processing_stage?: string | null
          processing_started_at?: string | null
          progress_pct?: number | null
          report_meta?: Json | null
          report_path?: string | null
          results?: Json | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          analysis_status?: string | null
          created_at?: string | null
          doctor_name?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          idempotency_key?: string | null
          images_processed?: number | null
          images_total?: number | null
          processing_stage?: string | null
          processing_started_at?: string | null
          progress_pct?: number | null
          report_meta?: Json | null
          report_path?: string | null
          results?: Json | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medical_exam_analyses: {
        Row: {
          analysis_result: string | null
          created_at: string
          document_id: string | null
          exam_type: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: string | null
          created_at?: string
          document_id?: string | null
          exam_type?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: string | null
          created_at?: string
          document_id?: string | null
          exam_type?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medidas_de_peso: {
        Row: {
          agua_corporal_percentual: number | null
          altura_cm: number | null
          circunferencia_abdominal_cm: number | null
          circunferencia_braco_cm: number | null
          circunferencia_cintura_cm: number | null
          circunferencia_coxa_cm: number | null
          circunferencia_panturrilha_cm: number | null
          circunferencia_quadril_cm: number | null
          created_at: string | null
          data_medicao: string
          dobra_biceps_mm: number | null
          dobra_subescapular_mm: number | null
          dobra_suprailiaca_mm: number | null
          dobra_triceps_mm: number | null
          gordura_corporal_percentual: number | null
          gordura_visceral: number | null
          id: string
          idade_metabolica: number | null
          imc: number | null
          massa_muscular_kg: number | null
          massa_ossea_kg: number | null
          notas: string | null
          peso_kg: number | null
          pressao_diastolica: number | null
          pressao_sistolica: number | null
          risco_cardiometabolico: string | null
          taxa_metabolica_basal: number | null
          tipo_dispositivo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agua_corporal_percentual?: number | null
          altura_cm?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_cintura_cm?: number | null
          circunferencia_coxa_cm?: number | null
          circunferencia_panturrilha_cm?: number | null
          circunferencia_quadril_cm?: number | null
          created_at?: string | null
          data_medicao?: string
          dobra_biceps_mm?: number | null
          dobra_subescapular_mm?: number | null
          dobra_suprailiaca_mm?: number | null
          dobra_triceps_mm?: number | null
          gordura_corporal_percentual?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          massa_ossea_kg?: number | null
          notas?: string | null
          peso_kg?: number | null
          pressao_diastolica?: number | null
          pressao_sistolica?: number | null
          risco_cardiometabolico?: string | null
          taxa_metabolica_basal?: number | null
          tipo_dispositivo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agua_corporal_percentual?: number | null
          altura_cm?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_cintura_cm?: number | null
          circunferencia_coxa_cm?: number | null
          circunferencia_panturrilha_cm?: number | null
          circunferencia_quadril_cm?: number | null
          created_at?: string | null
          data_medicao?: string
          dobra_biceps_mm?: number | null
          dobra_subescapular_mm?: number | null
          dobra_suprailiaca_mm?: number | null
          dobra_triceps_mm?: number | null
          gordura_corporal_percentual?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          massa_ossea_kg?: number | null
          notas?: string | null
          peso_kg?: number | null
          pressao_diastolica?: number | null
          pressao_sistolica?: number | null
          risco_cardiometabolico?: string | null
          taxa_metabolica_basal?: number | null
          tipo_dispositivo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      membros_do_grupo_feed_de_saúde: {
        Row: {
          created_at: string | null
          grupo_id: string
          id: string
          papel: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grupo_id: string
          id?: string
          papel?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          grupo_id?: string
          id?: string
          papel?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memória_sofia: {
        Row: {
          conteudo: string
          contexto: Json | null
          created_at: string | null
          expira_em: string | null
          frequencia_acesso: number | null
          id: string
          importancia: number | null
          is_active: boolean | null
          tags: string[] | null
          tipo_memoria: string
          ultimo_acesso: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conteudo: string
          contexto?: Json | null
          created_at?: string | null
          expira_em?: string | null
          frequencia_acesso?: number | null
          id?: string
          importancia?: number | null
          is_active?: boolean | null
          tags?: string[] | null
          tipo_memoria: string
          ultimo_acesso?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conteudo?: string
          contexto?: Json | null
          created_at?: string | null
          expira_em?: string | null
          frequencia_acesso?: number | null
          id?: string
          importancia?: number | null
          is_active?: boolean | null
          tags?: string[] | null
          tipo_memoria?: string
          ultimo_acesso?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      missões_diárias: {
        Row: {
          categoria: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          dificuldade: string | null
          icone: string | null
          id: string
          is_active: boolean | null
          is_diaria: boolean | null
          objetivo_unidade: string | null
          objetivo_valor: number | null
          pontos_recompensa: number | null
          tipo_missao: string | null
          titulo: string
          updated_at: string | null
          xp_recompensa: number | null
        }
        Insert: {
          categoria?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          dificuldade?: string | null
          icone?: string | null
          id?: string
          is_active?: boolean | null
          is_diaria?: boolean | null
          objetivo_unidade?: string | null
          objetivo_valor?: number | null
          pontos_recompensa?: number | null
          tipo_missao?: string | null
          titulo: string
          updated_at?: string | null
          xp_recompensa?: number | null
        }
        Update: {
          categoria?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          dificuldade?: string | null
          icone?: string | null
          id?: string
          is_active?: boolean | null
          is_diaria?: boolean | null
          objetivo_unidade?: string | null
          objetivo_valor?: number | null
          pontos_recompensa?: number | null
          tipo_missao?: string | null
          titulo?: string
          updated_at?: string | null
          xp_recompensa?: number | null
        }
        Relationships: []
      }
      mock_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          mock_data: Json | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          mock_data?: Json | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          mock_data?: Json | null
          username?: string
        }
        Relationships: []
      }
      mood_monitoring: {
        Row: {
          context: string | null
          created_at: string | null
          date: string | null
          id: string
          mood_rating: number | null
          mood_tags: string[] | null
          notes: string | null
          time: string | null
          triggers: string[] | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          mood_rating?: number | null
          mood_tags?: string[] | null
          notes?: string | null
          time?: string | null
          triggers?: string[] | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          mood_rating?: number | null
          mood_tags?: string[] | null
          notes?: string | null
          time?: string | null
          triggers?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      notificações_enviadas: {
        Row: {
          acao_url: string | null
          canal: string | null
          created_at: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          prioridade: string | null
          status_envio: string | null
          tipo_notificacao: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acao_url?: string | null
          canal?: string | null
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          prioridade?: string | null
          status_envio?: string | null
          tipo_notificacao: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acao_url?: string | null
          canal?: string | null
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          prioridade?: string | null
          status_envio?: string | null
          tipo_notificacao?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          channels: Json | null
          created_at: string | null
          frequency: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nutrition_foods: {
        Row: {
          aliases: string[] | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string | null
          created_at: string | null
          fats_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          is_verified: boolean | null
          name: string
          proteins_per_100g: number | null
          sodium_per_100g: number | null
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string | null
          fats_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_verified?: boolean | null
          name: string
          proteins_per_100g?: number | null
          sodium_per_100g?: number | null
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string | null
          fats_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          is_verified?: boolean | null
          name?: string
          proteins_per_100g?: number | null
          sodium_per_100g?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nutrition_tracking: {
        Row: {
          created_at: string | null
          date: string | null
          food_items: Json | null
          id: string
          meal_type: string | null
          notes: string | null
          photo_url: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_proteins: number | null
          updated_at: string | null
          user_id: string | null
          water_ml: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          food_items?: Json | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_ml?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          food_items?: Json | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_ml?: number | null
        }
        Relationships: []
      }
      nutritional_aliases: {
        Row: {
          alias: string
          created_at: string | null
          food_id: string | null
          id: string
        }
        Insert: {
          alias: string
          created_at?: string | null
          food_id?: string | null
          id?: string
        }
        Update: {
          alias?: string
          created_at?: string | null
          food_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutritional_aliases_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "nutrition_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritional_food_patterns: {
        Row: {
          created_at: string | null
          description: string | null
          food_combinations: Json | null
          health_benefits: string[] | null
          id: string
          is_active: boolean | null
          meal_examples: Json | null
          pattern_name: string
          pattern_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          food_combinations?: Json | null
          health_benefits?: string[] | null
          id?: string
          is_active?: boolean | null
          meal_examples?: Json | null
          pattern_name: string
          pattern_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          food_combinations?: Json | null
          health_benefits?: string[] | null
          id?: string
          is_active?: boolean | null
          meal_examples?: Json | null
          pattern_name?: string
          pattern_type?: string | null
        }
        Relationships: []
      }
      nutritional_goals: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_weight_kg: number | null
          goal_name: string
          goal_type: string | null
          id: string
          notes: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          target_calories: number | null
          target_carbs_g: number | null
          target_date: string | null
          target_fats_g: number | null
          target_fiber_g: number | null
          target_protein_g: number | null
          target_water_ml: number | null
          target_weight_kg: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_weight_kg?: number | null
          goal_name: string
          goal_type?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_date?: string | null
          target_fats_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          target_water_ml?: number | null
          target_weight_kg?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_weight_kg?: number | null
          goal_name?: string
          goal_type?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_date?: string | null
          target_fats_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          target_water_ml?: number | null
          target_weight_kg?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nutritional_protocols: {
        Row: {
          created_at: string | null
          description: string | null
          dietary_guidelines: Json | null
          duration_weeks: number | null
          evidence_level: string | null
          expected_outcomes: string[] | null
          health_condition: string | null
          id: string
          is_active: boolean | null
          meal_timing: Json | null
          monitoring_metrics: string[] | null
          phases: Json | null
          protocol_name: string
          restrictions: string[] | null
          supplement_recommendations: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dietary_guidelines?: Json | null
          duration_weeks?: number | null
          evidence_level?: string | null
          expected_outcomes?: string[] | null
          health_condition?: string | null
          id?: string
          is_active?: boolean | null
          meal_timing?: Json | null
          monitoring_metrics?: string[] | null
          phases?: Json | null
          protocol_name: string
          restrictions?: string[] | null
          supplement_recommendations?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dietary_guidelines?: Json | null
          duration_weeks?: number | null
          evidence_level?: string | null
          expected_outcomes?: string[] | null
          health_condition?: string | null
          id?: string
          is_active?: boolean | null
          meal_timing?: Json | null
          monitoring_metrics?: string[] | null
          phases?: Json | null
          protocol_name?: string
          restrictions?: string[] | null
          supplement_recommendations?: Json | null
        }
        Relationships: []
      }
      nutritional_recommendations: {
        Row: {
          created_at: string | null
          foods_to_avoid: string[] | null
          foods_to_include: string[] | null
          id: string
          is_read: boolean | null
          priority: string | null
          recommendation_text: string | null
          recommendation_type: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          foods_to_avoid?: string[] | null
          foods_to_include?: string[] | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          recommendation_text?: string | null
          recommendation_type?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          foods_to_avoid?: string[] | null
          foods_to_include?: string[] | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          recommendation_text?: string | null
          recommendation_type?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      nutritional_yields: {
        Row: {
          created_at: string | null
          food_name: string
          id: string
          notes: string | null
          preparation_method: string | null
          yield_factor: number | null
        }
        Insert: {
          created_at?: string | null
          food_name: string
          id?: string
          notes?: string | null
          preparation_method?: string | null
          yield_factor?: number | null
        }
        Update: {
          created_at?: string | null
          food_name?: string
          id?: string
          notes?: string | null
          preparation_method?: string | null
          yield_factor?: number | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          offer_code: string | null
          offer_title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          offer_code?: string | null
          offer_title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          offer_code?: string | null
          offer_title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          invoice_id: string | null
          metadata: Json | null
          payment_date: string | null
          payment_method: string | null
          payment_provider: string | null
          refunded_at: string | null
          status: string | null
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          refunded_at?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          refunded_at?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "subscription_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_nutritional_aliases: {
        Row: {
          alias: string
          created_at: string | null
          food_name: string
          id: string
          status: string | null
          submitted_by: string | null
        }
        Insert: {
          alias: string
          created_at?: string | null
          food_name: string
          id?: string
          status?: string | null
          submitted_by?: string | null
        }
        Update: {
          alias?: string
          created_at?: string | null
          food_name?: string
          id?: string
          status?: string | null
          submitted_by?: string | null
        }
        Relationships: []
      }
      pontos_do_usuário: {
        Row: {
          created_at: string | null
          experiencia_atual: number | null
          experiencia_proximo_nivel: number | null
          id: string
          nivel_atual: number | null
          pontos_mes: number | null
          pontos_semana: number | null
          total_pontos: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experiencia_atual?: number | null
          experiencia_proximo_nivel?: number | null
          id?: string
          nivel_atual?: number | null
          pontos_mes?: number | null
          pontos_semana?: number | null
          total_pontos?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experiencia_atual?: number | null
          experiencia_proximo_nivel?: number | null
          id?: string
          nivel_atual?: number | null
          pontos_mes?: number | null
          pontos_semana?: number | null
          total_pontos?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pontuações_do_usuário: {
        Row: {
          categoria: string
          created_at: string | null
          data_avaliacao: string
          detalhes: Json | null
          id: string
          pontuacao: number
          pontuacao_maxima: number | null
          tendencia: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data_avaliacao?: string
          detalhes?: Json | null
          id?: string
          pontuacao: number
          pontuacao_maxima?: number | null
          tendencia?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_avaliacao?: string
          detalhes?: Json | null
          id?: string
          pontuacao?: number
          pontuacao_maxima?: number | null
          tendencia?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pregnancy_nutrition: {
        Row: {
          benefits: string | null
          created_at: string | null
          food_sources: string[] | null
          id: string
          is_essential: boolean | null
          nutrient_name: string | null
          precautions: string[] | null
          recommended_amount: string | null
          trimester: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          food_sources?: string[] | null
          id?: string
          is_essential?: boolean | null
          nutrient_name?: string | null
          precautions?: string[] | null
          recommended_amount?: string | null
          trimester?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          food_sources?: string[] | null
          id?: string
          is_essential?: boolean | null
          nutrient_name?: string | null
          precautions?: string[] | null
          recommended_amount?: string | null
          trimester?: string | null
        }
        Relationships: []
      }
      premium_medical_reports: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          generated_at: string | null
          html_path: string | null
          id: string
          pdf_path: string | null
          report_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          html_path?: string | null
          id?: string
          pdf_path?: string | null
          report_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          html_path?: string | null
          id?: string
          pdf_path?: string | null
          report_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      premium_report_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string | null
          id: string
          processed: boolean | null
          processed_at: string | null
          report_id: string | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          report_id?: string | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          report_id?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_report_events_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "premium_medical_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_health_analyses: {
        Row: {
          action_plan: string | null
          analysis_type: string | null
          created_at: string | null
          health_indicators: Json | null
          id: string
          lifestyle_score: number | null
          next_steps: string[] | null
          recommendations: Json | null
          risk_factors: Json | null
          risk_score: number | null
          user_id: string | null
        }
        Insert: {
          action_plan?: string | null
          analysis_type?: string | null
          created_at?: string | null
          health_indicators?: Json | null
          id?: string
          lifestyle_score?: number | null
          next_steps?: string[] | null
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          user_id?: string | null
        }
        Update: {
          action_plan?: string | null
          analysis_type?: string | null
          created_at?: string | null
          health_indicators?: Json | null
          id?: string
          lifestyle_score?: number | null
          next_steps?: string[] | null
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      professional_evaluations: {
        Row: {
          abdominal_circumference_cm: number | null
          bmi: number | null
          bmr_kcal: number | null
          body_fat_percentage: number | null
          created_at: string | null
          evaluation_date: string | null
          evaluator_id: string | null
          fat_mass_kg: number | null
          height_cm: number | null
          hip_circumference_cm: number | null
          id: string
          lean_mass_kg: number | null
          muscle_mass_kg: number | null
          muscle_to_fat_ratio: number | null
          notes: string | null
          recommendations: string | null
          risk_level: string | null
          updated_at: string | null
          user_id: string
          waist_circumference_cm: number | null
          waist_to_height_ratio: number | null
          waist_to_hip_ratio: number | null
          weight_kg: number
        }
        Insert: {
          abdominal_circumference_cm?: number | null
          bmi?: number | null
          bmr_kcal?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          fat_mass_kg?: number | null
          height_cm?: number | null
          hip_circumference_cm?: number | null
          id?: string
          lean_mass_kg?: number | null
          muscle_mass_kg?: number | null
          muscle_to_fat_ratio?: number | null
          notes?: string | null
          recommendations?: string | null
          risk_level?: string | null
          updated_at?: string | null
          user_id: string
          waist_circumference_cm?: number | null
          waist_to_height_ratio?: number | null
          waist_to_hip_ratio?: number | null
          weight_kg: number
        }
        Update: {
          abdominal_circumference_cm?: number | null
          bmi?: number | null
          bmr_kcal?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          evaluator_id?: string | null
          fat_mass_kg?: number | null
          height_cm?: number | null
          hip_circumference_cm?: number | null
          id?: string
          lean_mass_kg?: number | null
          muscle_mass_kg?: number | null
          muscle_to_fat_ratio?: number | null
          notes?: string | null
          recommendations?: string | null
          risk_level?: string | null
          updated_at?: string | null
          user_id?: string
          waist_circumference_cm?: number | null
          waist_to_height_ratio?: number | null
          waist_to_hip_ratio?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          current_weight: number | null
          email: string | null
          fitness_level: string | null
          full_name: string | null
          gender: string | null
          google_fit_enabled: boolean | null
          height: number | null
          id: string
          phone: string | null
          points: number | null
          provider: string | null
          role: string | null
          state: string | null
          target_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          current_weight?: number | null
          email?: string | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          google_fit_enabled?: boolean | null
          height?: number | null
          id?: string
          phone?: string | null
          points?: number | null
          provider?: string | null
          role?: string | null
          state?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          current_weight?: number | null
          email?: string | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          google_fit_enabled?: boolean | null
          height?: number | null
          id?: string
          phone?: string | null
          points?: number | null
          provider?: string | null
          role?: string | null
          state?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protein_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      protocol_supplements: {
        Row: {
          created_at: string | null
          dosage: string | null
          frequency: string | null
          id: string
          is_required: boolean | null
          notes: string | null
          protocol_id: string | null
          supplement_name: string
          timing: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_required?: boolean | null
          notes?: string | null
          protocol_id?: string | null
          supplement_name: string
          timing?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_required?: boolean | null
          notes?: string | null
          protocol_id?: string | null
          supplement_name?: string
          timing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_supplements_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "supplement_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      reações_feed_de_saúde: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          tipo_reacao: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          tipo_reacao: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          tipo_reacao?: string
          user_id?: string
        }
        Relationships: []
      }
      receitas_terapeuticas: {
        Row: {
          beneficios_terapeuticos: string[] | null
          calorias_por_porcao: number | null
          condicao_alvo: string | null
          contraindicacoes: string[] | null
          created_at: string | null
          descricao: string | null
          id: string
          ingredientes: Json
          modo_preparo: string | null
          nome_receita: string
          porcoes: number | null
          tempo_preparo_minutos: number | null
          updated_at: string | null
        }
        Insert: {
          beneficios_terapeuticos?: string[] | null
          calorias_por_porcao?: number | null
          condicao_alvo?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ingredientes?: Json
          modo_preparo?: string | null
          nome_receita: string
          porcoes?: number | null
          tempo_preparo_minutos?: number | null
          updated_at?: string | null
        }
        Update: {
          beneficios_terapeuticos?: string[] | null
          calorias_por_porcao?: number | null
          condicao_alvo?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ingredientes?: Json
          modo_preparo?: string | null
          nome_receita?: string
          porcoes?: number | null
          tempo_preparo_minutos?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_components: {
        Row: {
          food_name: string | null
          order_index: number | null
          quantity_g: number | null
          recipe_id: string | null
        }
        Insert: {
          food_name?: string | null
          order_index?: number | null
          quantity_g?: number | null
          recipe_id?: string | null
        }
        Update: {
          food_name?: string | null
          order_index?: number | null
          quantity_g?: number | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_components_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_items: {
        Row: {
          food_id: string | null
          id: string
          notes: string | null
          quantity_g: number | null
          recipe_id: string | null
        }
        Insert: {
          food_id?: string | null
          id?: string
          notes?: string | null
          quantity_g?: number | null
          recipe_id?: string | null
        }
        Update: {
          food_id?: string | null
          id?: string
          notes?: string | null
          quantity_g?: number | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "nutrition_foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_templates: {
        Row: {
          base_ingredients: Json | null
          category: string | null
          created_at: string | null
          id: string
          instructions_template: string | null
          tags: string[] | null
          template_name: string
        }
        Insert: {
          base_ingredients?: Json | null
          category?: string | null
          created_at?: string | null
          id?: string
          instructions_template?: string | null
          tags?: string[] | null
          template_name: string
        }
        Update: {
          base_ingredients?: Json | null
          category?: string | null
          created_at?: string | null
          id?: string
          instructions_template?: string | null
          tags?: string[] | null
          template_name?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          instructions: string | null
          name: string
        }
        Insert: {
          id?: string
          instructions?: string | null
          name: string
        }
        Update: {
          id?: string
          instructions?: string | null
          name?: string
        }
        Relationships: []
      }
      registros_diários_de_desafio: {
        Row: {
          completado: boolean | null
          created_at: string | null
          data_registro: string
          id: string
          notas: string | null
          participacao_id: string
          valor_numerico: number | null
          valor_registrado: string | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          data_registro?: string
          id?: string
          notas?: string | null
          participacao_id: string
          valor_numerico?: number | null
          valor_registrado?: string | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          data_registro?: string
          id?: string
          notas?: string | null
          participacao_id?: string
          valor_numerico?: number | null
          valor_registrado?: string | null
        }
        Relationships: []
      }
      respostas_do_sabotador: {
        Row: {
          avaliacao_id: string | null
          created_at: string | null
          id: string
          intensidade: string | null
          pontuacao: number | null
          questao_id: string | null
          resposta: string | null
          sabotador_identificado: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avaliacao_id?: string | null
          created_at?: string | null
          id?: string
          intensidade?: string | null
          pontuacao?: number | null
          questao_id?: string | null
          resposta?: string | null
          sabotador_identificado?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avaliacao_id?: string | null
          created_at?: string | null
          id?: string
          intensidade?: string | null
          pontuacao?: number | null
          questao_id?: string | null
          resposta?: string | null
          sabotador_identificado?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resumo_nutricional_diário: {
        Row: {
          aderencia_plano_percentual: number | null
          calorias_almoco: number | null
          calorias_cafe: number | null
          calorias_jantar: number | null
          calorias_lanches: number | null
          created_at: string | null
          data: string
          id: string
          metas_atingidas: boolean | null
          notas: string | null
          quantidade_refeicoes: number | null
          score_saude: number | null
          total_agua_ml: number | null
          total_calorias: number | null
          total_carboidratos: number | null
          total_fibras: number | null
          total_gorduras: number | null
          total_proteinas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aderencia_plano_percentual?: number | null
          calorias_almoco?: number | null
          calorias_cafe?: number | null
          calorias_jantar?: number | null
          calorias_lanches?: number | null
          created_at?: string | null
          data?: string
          id?: string
          metas_atingidas?: boolean | null
          notas?: string | null
          quantidade_refeicoes?: number | null
          score_saude?: number | null
          total_agua_ml?: number | null
          total_calorias?: number | null
          total_carboidratos?: number | null
          total_fibras?: number | null
          total_gorduras?: number | null
          total_proteinas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aderencia_plano_percentual?: number | null
          calorias_almoco?: number | null
          calorias_cafe?: number | null
          calorias_jantar?: number | null
          calorias_lanches?: number | null
          created_at?: string | null
          data?: string
          id?: string
          metas_atingidas?: boolean | null
          notas?: string | null
          quantidade_refeicoes?: number | null
          score_saude?: number | null
          total_agua_ml?: number | null
          total_calorias?: number | null
          total_carboidratos?: number | null
          total_fibras?: number | null
          total_gorduras?: number | null
          total_proteinas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sabotadores_personalizados: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          estrategias_enfrentamento: string[] | null
          gatilhos_comuns: string[] | null
          id: string
          is_active: boolean | null
          niveis_gravidade: Json | null
          nome_sabotador: string
          padroes_comportamentais: string[] | null
          padroes_mentais: string[] | null
          sabotadores_relacionados: string[] | null
          sintomas_fisicos: string[] | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          estrategias_enfrentamento?: string[] | null
          gatilhos_comuns?: string[] | null
          id?: string
          is_active?: boolean | null
          niveis_gravidade?: Json | null
          nome_sabotador: string
          padroes_comportamentais?: string[] | null
          padroes_mentais?: string[] | null
          sabotadores_relacionados?: string[] | null
          sintomas_fisicos?: string[] | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          estrategias_enfrentamento?: string[] | null
          gatilhos_comuns?: string[] | null
          id?: string
          is_active?: boolean | null
          niveis_gravidade?: Json | null
          nome_sabotador?: string
          padroes_comportamentais?: string[] | null
          padroes_mentais?: string[] | null
          sabotadores_relacionados?: string[] | null
          sintomas_fisicos?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saboteur_assessments: {
        Row: {
          assessment_date: string | null
          created_at: string | null
          id: string
          impact_areas: string[] | null
          intensity_score: number | null
          notes: string | null
          saboteur_type: string | null
          trigger_situations: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          impact_areas?: string[] | null
          intensity_score?: number | null
          notes?: string | null
          saboteur_type?: string | null
          trigger_situations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          impact_areas?: string[] | null
          intensity_score?: number | null
          notes?: string | null
          saboteur_type?: string | null
          trigger_situations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saboteur_responses: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          id: string
          question_id: string | null
          question_text: string | null
          response_text: string | null
          response_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          question_text?: string | null
          response_text?: string | null
          response_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          question_text?: string | null
          response_text?: string | null
          response_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saboteur_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "saboteur_results"
            referencedColumns: ["id"]
          },
        ]
      }
      saboteur_results: {
        Row: {
          assessment_date: string | null
          created_at: string | null
          dominant_saboteurs: string[] | null
          id: string
          percentage: number | null
          recommendations: string[] | null
          saboteur_type: string | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          created_at?: string | null
          dominant_saboteurs?: string[] | null
          id?: string
          percentage?: number | null
          recommendations?: string[] | null
          saboteur_type?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          created_at?: string | null
          dominant_saboteurs?: string[] | null
          id?: string
          percentage?: number | null
          recommendations?: string[] | null
          saboteur_type?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saude_especifica: {
        Row: {
          condicao: string
          created_at: string | null
          data_diagnostico: string | null
          diagnostico_confirmado: boolean | null
          gravidade: string | null
          id: string
          medicamentos: string[] | null
          notas: string | null
          restricoes_alimentares: string[] | null
          tratamento_atual: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condicao: string
          created_at?: string | null
          data_diagnostico?: string | null
          diagnostico_confirmado?: boolean | null
          gravidade?: string | null
          id?: string
          medicamentos?: string[] | null
          notas?: string | null
          restricoes_alimentares?: string[] | null
          tratamento_atual?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condicao?: string
          created_at?: string | null
          data_diagnostico?: string | null
          diagnostico_confirmado?: boolean | null
          gravidade?: string | null
          id?: string
          medicamentos?: string[] | null
          notas?: string | null
          restricoes_alimentares?: string[] | null
          tratamento_atual?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_analysis_records: {
        Row: {
          analysis_type: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          result_data: Json | null
          scheduled_for: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          result_data?: Json | null
          scheduled_for?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          result_data?: Json | null
          scheduled_for?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sent_notifications: {
        Row: {
          channel: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_templates: {
        Row: {
          activities: Json | null
          benefits: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          goals: string[] | null
          id: string
          instructions: string | null
          is_active: boolean | null
          materials_needed: string[] | null
          precautions: string[] | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          goals?: string[] | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          materials_needed?: string[] | null
          precautions?: string[] | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          goals?: string[] | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          materials_needed?: string[] | null
          precautions?: string[] | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_time: number | null
          follow_up_questions: string[] | null
          id: string
          is_active: boolean | null
          materials_needed: string[] | null
          target_saboteurs: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_monitoring: {
        Row: {
          created_at: string | null
          deep_sleep_hours: number | null
          id: string
          notes: string | null
          sleep_date: string | null
          sleep_duration_hours: number | null
          sleep_quality_rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deep_sleep_hours?: number | null
          id?: string
          notes?: string | null
          sleep_date?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deep_sleep_hours?: number | null
          id?: string
          notes?: string | null
          sleep_date?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      smart_notifications: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          message: string
          priority: string | null
          read_at: string | null
          title: string
          trigger_conditions: Json | null
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: string | null
          read_at?: string | null
          title: string
          trigger_conditions?: Json | null
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          trigger_conditions?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      sofia_comprehensive_analyses: {
        Row: {
          analysis_data: Json | null
          analysis_type: string | null
          created_at: string | null
          id: string
          insights: string[] | null
          priority_level: string | null
          recommendations: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          analysis_type?: string | null
          created_at?: string | null
          id?: string
          insights?: string[] | null
          priority_level?: string | null
          recommendations?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          analysis_type?: string | null
          created_at?: string | null
          id?: string
          insights?: string[] | null
          priority_level?: string | null
          recommendations?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sofia_conversation_context: {
        Row: {
          context_data: Json | null
          context_type: string | null
          created_at: string | null
          id: string
          relevance_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          relevance_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          relevance_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sofia_food_analysis: {
        Row: {
          analysis_result: Json | null
          calories: number | null
          carbs: number | null
          confirmed_by_user: boolean | null
          created_at: string | null
          fats: number | null
          food_image_url: string | null
          food_name: string | null
          health_score: number | null
          id: string
          proteins: number | null
          recommendations: string | null
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          calories?: number | null
          carbs?: number | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          fats?: number | null
          food_image_url?: string | null
          food_name?: string | null
          health_score?: number | null
          id?: string
          proteins?: number | null
          recommendations?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          calories?: number | null
          carbs?: number | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          fats?: number | null
          food_image_url?: string | null
          food_name?: string | null
          health_score?: number | null
          id?: string
          proteins?: number | null
          recommendations?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sofia_knowledge_base: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          language: string | null
          priority: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          language?: string | null
          priority?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          language?: string | null
          priority?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sofia_learning: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          is_validated: boolean | null
          learning_data: Json | null
          learning_topic: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_validated?: boolean | null
          learning_data?: Json | null
          learning_topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_validated?: boolean | null
          learning_data?: Json | null
          learning_topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sofia_memory: {
        Row: {
          access_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          importance_score: number | null
          is_active: boolean | null
          last_accessed_at: string | null
          memory_key: string | null
          memory_type: string | null
          memory_value: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_key?: string | null
          memory_type?: string | null
          memory_value?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_key?: string | null
          memory_type?: string | null
          memory_value?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sofia_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      specific_health: {
        Row: {
          condition_name: string | null
          created_at: string | null
          current_treatment: string | null
          diagnosis_date: string | null
          health_category: string | null
          id: string
          notes: string | null
          severity: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          condition_name?: string | null
          created_at?: string | null
          current_treatment?: string | null
          diagnosis_date?: string | null
          health_category?: string | null
          id?: string
          notes?: string | null
          severity?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          condition_name?: string | null
          created_at?: string | null
          current_treatment?: string | null
          diagnosis_date?: string | null
          health_category?: string | null
          id?: string
          notes?: string | null
          severity?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sport_training_plans: {
        Row: {
          completed_at: string | null
          completed_workouts: number | null
          created_at: string | null
          current_week: number | null
          difficulty: string | null
          duration_weeks: number | null
          exercises: Json | null
          goal: string | null
          id: string
          modality: string | null
          name: string
          sport_type: string | null
          started_at: string | null
          status: string | null
          total_workouts: number | null
          updated_at: string | null
          user_id: string | null
          workouts_per_week: number | null
        }
        Insert: {
          completed_at?: string | null
          completed_workouts?: number | null
          created_at?: string | null
          current_week?: number | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          modality?: string | null
          name: string
          sport_type?: string | null
          started_at?: string | null
          status?: string | null
          total_workouts?: number | null
          updated_at?: string | null
          user_id?: string | null
          workouts_per_week?: number | null
        }
        Update: {
          completed_at?: string | null
          completed_workouts?: number | null
          created_at?: string | null
          current_week?: number | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          modality?: string | null
          name?: string
          sport_type?: string | null
          started_at?: string | null
          status?: string | null
          total_workouts?: number | null
          updated_at?: string | null
          user_id?: string | null
          workouts_per_week?: number | null
        }
        Relationships: []
      }
      sport_workout_logs: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          duration_minutes: number | null
          exercises_completed: Json | null
          id: string
          notes: string | null
          plan_id: string | null
          rating: number | null
          user_id: string | null
          workout_name: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          rating?: number | null
          user_id?: string | null
          workout_name?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          rating?: number | null
          user_id?: string | null
          workout_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_workout_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "sport_training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string | null
          badge_icon: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          points_earned: number | null
          sport_type: string | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_name: string
          achievement_type?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          sport_type?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          sport_type?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sports_challenge_participations: {
        Row: {
          achievements: Json | null
          challenge_id: string | null
          completed_at: string | null
          current_progress: number | null
          id: string
          joined_at: string | null
          notes: string | null
          rank: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          rank?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          rank?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "sports_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_challenges: {
        Row: {
          challenge_name: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_days: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_team_challenge: boolean | null
          max_participants: number | null
          rewards: Json | null
          rules: Json | null
          sport_type: string | null
          start_date: string | null
          target_metric: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          challenge_name: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_team_challenge?: boolean | null
          max_participants?: number | null
          rewards?: Json | null
          rules?: Json | null
          sport_type?: string | null
          start_date?: string | null
          target_metric?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          challenge_name?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_team_challenge?: boolean | null
          max_participants?: number | null
          rewards?: Json | null
          rules?: Json | null
          sport_type?: string | null
          start_date?: string | null
          target_metric?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sports_training_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_weeks: number | null
          equipment_needed: string[] | null
          exercises: Json | null
          goal: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          nutrition_recommendations: string | null
          performance_metrics: string[] | null
          plan_name: string
          progression_plan: Json | null
          recovery_guidelines: string | null
          sessions_per_week: number | null
          sport_type: string | null
          start_date: string | null
          training_phases: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          nutrition_recommendations?: string | null
          performance_metrics?: string[] | null
          plan_name: string
          progression_plan?: Json | null
          recovery_guidelines?: string | null
          sessions_per_week?: number | null
          sport_type?: string | null
          start_date?: string | null
          training_phases?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          nutrition_recommendations?: string | null
          performance_metrics?: string[] | null
          plan_name?: string
          progression_plan?: Json | null
          recovery_guidelines?: string | null
          sessions_per_week?: number | null
          sport_type?: string | null
          start_date?: string | null
          training_phases?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sports_training_records: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          exercises_completed: Json | null
          id: string
          intensity_level: string | null
          performance_notes: string | null
          session_date: string | null
          session_type: string | null
          training_plan_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          intensity_level?: string | null
          performance_notes?: string | null
          session_date?: string | null
          session_type?: string | null
          training_plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          intensity_level?: string | null
          performance_notes?: string | null
          session_date?: string | null
          session_type?: string | null
          training_plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_training_records_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "sports_training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          paid_at: string | null
          status: string | null
          subscription_id: string | null
          tax: number | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          status?: string | null
          subscription_id?: string | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          status?: string | null
          subscription_id?: string | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_users: number | null
          plan_name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          plan_name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          plan_name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sugestões_nutracêuticas_do_usuário: {
        Row: {
          beneficios_esperados: string[] | null
          condicao_alvo: string | null
          contraindicacoes: string[] | null
          created_at: string | null
          created_by: string | null
          criado_por_ia: boolean | null
          data_inicio_sugerida: string | null
          data_revisao: string | null
          dosagem: string | null
          duracao_sugerida: string | null
          evidencia_cientifica: string | null
          frequencia: string | null
          id: string
          interacoes_medicamentosas: string[] | null
          nome_suplemento: string
          notas: string | null
          objetivo: string | null
          prioridade: string | null
          status_sugestao: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beneficios_esperados?: string[] | null
          condicao_alvo?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          created_by?: string | null
          criado_por_ia?: boolean | null
          data_inicio_sugerida?: string | null
          data_revisao?: string | null
          dosagem?: string | null
          duracao_sugerida?: string | null
          evidencia_cientifica?: string | null
          frequencia?: string | null
          id?: string
          interacoes_medicamentosas?: string[] | null
          nome_suplemento: string
          notas?: string | null
          objetivo?: string | null
          prioridade?: string | null
          status_sugestao?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beneficios_esperados?: string[] | null
          condicao_alvo?: string | null
          contraindicacoes?: string[] | null
          created_at?: string | null
          created_by?: string | null
          criado_por_ia?: boolean | null
          data_inicio_sugerida?: string | null
          data_revisao?: string | null
          dosagem?: string | null
          duracao_sugerida?: string | null
          evidencia_cientifica?: string | null
          frequencia?: string | null
          id?: string
          interacoes_medicamentosas?: string[] | null
          nome_suplemento?: string
          notas?: string | null
          objetivo?: string | null
          prioridade?: string | null
          status_sugestao?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suplementos_do_usuário: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          dosagem: string | null
          frequencia: string | null
          horario_tomada: string | null
          id: string
          is_ativo: boolean | null
          nome_suplemento: string
          notas: string | null
          objetivo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dosagem?: string | null
          frequencia?: string | null
          horario_tomada?: string | null
          id?: string
          is_ativo?: boolean | null
          nome_suplemento: string
          notas?: string | null
          objetivo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dosagem?: string | null
          frequencia?: string | null
          horario_tomada?: string | null
          id?: string
          is_ativo?: boolean | null
          nome_suplemento?: string
          notas?: string | null
          objetivo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      supplement_protocols: {
        Row: {
          conditions: string[] | null
          created_at: string | null
          description: string | null
          dosages: Json | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          name: string
          precautions: string | null
          supplements: Json | null
          updated_at: string | null
        }
        Insert: {
          conditions?: string[] | null
          created_at?: string | null
          description?: string | null
          dosages?: Json | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          precautions?: string | null
          supplements?: Json | null
          updated_at?: string | null
        }
        Update: {
          conditions?: string[] | null
          created_at?: string | null
          description?: string | null
          dosages?: Json | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          precautions?: string | null
          supplements?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplements: {
        Row: {
          affiliate_link: string | null
          benefits: string[] | null
          brand: string | null
          category: string | null
          created_at: string | null
          description: string | null
          discount_price: number | null
          dosage: string | null
          external_id: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_active: boolean | null
          is_approved: boolean | null
          name: string
          original_price: number | null
          price: number | null
          score: number | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          name: string
          original_price?: number | null
          price?: number | null
          score?: number | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          benefits?: string[] | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_price?: number | null
          dosage?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          name?: string
          original_price?: number | null
          price?: number | null
          score?: number | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      taco_foods: {
        Row: {
          ash_g: number | null
          calcium_mg: number | null
          carbohydrate_g: number | null
          category: string | null
          cholesterol_mg: number | null
          code: number | null
          copper_mg: number | null
          created_at: string | null
          energy_kcal: number | null
          energy_kj: number | null
          fiber_g: number | null
          food_name: string
          id: string
          iron_mg: number | null
          is_verified: boolean | null
          lipids_g: number | null
          magnesium_mg: number | null
          manganese_mg: number | null
          monounsaturated_g: number | null
          niacin_mg: number | null
          phosphorus_mg: number | null
          polyunsaturated_g: number | null
          potassium_mg: number | null
          protein_g: number | null
          pyridoxine_mg: number | null
          rae_mcg: number | null
          re_mcg: number | null
          retinol_mcg: number | null
          riboflavin_mg: number | null
          saturated_g: number | null
          sodium_mg: number | null
          thiamine_mg: number | null
          updated_at: string | null
          vitamin_c_mg: number | null
          zinc_mg: number | null
        }
        Insert: {
          ash_g?: number | null
          calcium_mg?: number | null
          carbohydrate_g?: number | null
          category?: string | null
          cholesterol_mg?: number | null
          code?: number | null
          copper_mg?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          iron_mg?: number | null
          is_verified?: boolean | null
          lipids_g?: number | null
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_g?: number | null
          niacin_mg?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          pyridoxine_mg?: number | null
          rae_mcg?: number | null
          re_mcg?: number | null
          retinol_mcg?: number | null
          riboflavin_mg?: number | null
          saturated_g?: number | null
          sodium_mg?: number | null
          thiamine_mg?: number | null
          updated_at?: string | null
          vitamin_c_mg?: number | null
          zinc_mg?: number | null
        }
        Update: {
          ash_g?: number | null
          calcium_mg?: number | null
          carbohydrate_g?: number | null
          category?: string | null
          cholesterol_mg?: number | null
          code?: number | null
          copper_mg?: number | null
          created_at?: string | null
          energy_kcal?: number | null
          energy_kj?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          iron_mg?: number | null
          is_verified?: boolean | null
          lipids_g?: number | null
          magnesium_mg?: number | null
          manganese_mg?: number | null
          monounsaturated_g?: number | null
          niacin_mg?: number | null
          phosphorus_mg?: number | null
          polyunsaturated_g?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          pyridoxine_mg?: number | null
          rae_mcg?: number | null
          re_mcg?: number | null
          retinol_mcg?: number | null
          riboflavin_mg?: number | null
          saturated_g?: number | null
          sodium_mg?: number | null
          thiamine_mg?: number | null
          updated_at?: string | null
          vitamin_c_mg?: number | null
          zinc_mg?: number | null
        }
        Relationships: []
      }
      taco_stage: {
        Row: {
          acido_folico_mcg: number | null
          alimento: string | null
          calcio_mg: number | null
          carboidrato_g: number | null
          categoria: string | null
          cobre_mg: number | null
          colesterol_mg: number | null
          created_at: string | null
          energia_kcal: number | null
          ferro_mg: number | null
          fibra_g: number | null
          fosforo_mg: number | null
          id: string
          lipidios_g: number | null
          magnesio_mg: number | null
          manganes_mg: number | null
          numero: number | null
          potassio_mg: number | null
          proteina_g: number | null
          selenio_mcg: number | null
          sodio_mg: number | null
          vitamina_a_rae_mcg: number | null
          vitamina_b1_mg: number | null
          vitamina_b12_mcg: number | null
          vitamina_b2_mg: number | null
          vitamina_b3_mg: number | null
          vitamina_b6_mg: number | null
          vitamina_c_mg: number | null
          vitamina_d_mcg: number | null
          vitamina_e_mg: number | null
          zinco_mg: number | null
        }
        Insert: {
          acido_folico_mcg?: number | null
          alimento?: string | null
          calcio_mg?: number | null
          carboidrato_g?: number | null
          categoria?: string | null
          cobre_mg?: number | null
          colesterol_mg?: number | null
          created_at?: string | null
          energia_kcal?: number | null
          ferro_mg?: number | null
          fibra_g?: number | null
          fosforo_mg?: number | null
          id?: string
          lipidios_g?: number | null
          magnesio_mg?: number | null
          manganes_mg?: number | null
          numero?: number | null
          potassio_mg?: number | null
          proteina_g?: number | null
          selenio_mcg?: number | null
          sodio_mg?: number | null
          vitamina_a_rae_mcg?: number | null
          vitamina_b1_mg?: number | null
          vitamina_b12_mcg?: number | null
          vitamina_b2_mg?: number | null
          vitamina_b3_mg?: number | null
          vitamina_b6_mg?: number | null
          vitamina_c_mg?: number | null
          vitamina_d_mcg?: number | null
          vitamina_e_mg?: number | null
          zinco_mg?: number | null
        }
        Update: {
          acido_folico_mcg?: number | null
          alimento?: string | null
          calcio_mg?: number | null
          carboidrato_g?: number | null
          categoria?: string | null
          cobre_mg?: number | null
          colesterol_mg?: number | null
          created_at?: string | null
          energia_kcal?: number | null
          ferro_mg?: number | null
          fibra_g?: number | null
          fosforo_mg?: number | null
          id?: string
          lipidios_g?: number | null
          magnesio_mg?: number | null
          manganes_mg?: number | null
          numero?: number | null
          potassio_mg?: number | null
          proteina_g?: number | null
          selenio_mcg?: number | null
          sodio_mg?: number | null
          vitamina_a_rae_mcg?: number | null
          vitamina_b1_mg?: number | null
          vitamina_b12_mcg?: number | null
          vitamina_b2_mg?: number | null
          vitamina_b3_mg?: number | null
          vitamina_b6_mg?: number | null
          vitamina_c_mg?: number | null
          vitamina_d_mcg?: number | null
          vitamina_e_mg?: number | null
          zinco_mg?: number | null
        }
        Relationships: []
      }
      therapeutic_recipes: {
        Row: {
          created_at: string | null
          health_condition: string | null
          id: string
          ingredients: Json | null
          instructions: string | null
          is_active: boolean | null
          nutritional_info: Json | null
          precautions: string[] | null
          preparation_time_minutes: number | null
          recipe_name: string
          servings: number | null
          therapeutic_benefits: string[] | null
        }
        Insert: {
          created_at?: string | null
          health_condition?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          nutritional_info?: Json | null
          precautions?: string[] | null
          preparation_time_minutes?: number | null
          recipe_name: string
          servings?: number | null
          therapeutic_benefits?: string[] | null
        }
        Update: {
          created_at?: string | null
          health_condition?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          nutritional_info?: Json | null
          precautions?: string[] | null
          preparation_time_minutes?: number | null
          recipe_name?: string
          servings?: number | null
          therapeutic_benefits?: string[] | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          achievement_name: string | null
          achievement_type: string | null
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          achievement_id?: string | null
          achievement_name?: string | null
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          achievement_id?: string | null
          achievement_name?: string | null
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: []
      }
      user_anamnesis: {
        Row: {
          additional_notes: string | null
          alcohol_consumption: string | null
          biggest_weight_loss_challenge: string | null
          body_fat_percentage: number | null
          chronic_diseases: string | null
          compulsive_eating_situations: string | null
          created_at: string | null
          current_bmi: number | null
          current_medications: string | null
          current_weight_kg: number | null
          daily_energy_level: number | null
          daily_stress_level: string | null
          digestive_issues: string | null
          eating_habits: string | null
          eats_in_secret: boolean | null
          eats_until_uncomfortable: boolean | null
          emotional_events_during_weight_gain: string | null
          family_depression_anxiety_history: boolean | null
          family_diabetes_history: boolean | null
          family_eating_disorders_history: boolean | null
          family_heart_disease_history: boolean | null
          family_history: string | null
          family_obesity_history: boolean | null
          family_other_chronic_diseases: string | null
          family_thyroid_problems_history: boolean | null
          feels_guilt_after_eating: boolean | null
          food_allergies: string | null
          food_intolerances: string | null
          food_relationship_score: number | null
          forbidden_foods: string | null
          general_quality_of_life: number | null
          had_rebound_effect: boolean | null
          has_compulsive_eating: boolean | null
          health_goals: string | null
          height_cm: number | null
          herbal_medicines: string | null
          highest_adult_weight: number | null
          hip_circumference_cm: number | null
          how_found_method: string | null
          id: string
          ideal_weight_goal: number | null
          least_effective_treatment: string | null
          lowest_adult_weight: number | null
          main_treatment_goals: string | null
          major_weight_gain_periods: string | null
          marital_status: string | null
          most_effective_treatment: string | null
          motivation_for_seeking_treatment: string | null
          physical_activity: string | null
          physical_activity_frequency: string | null
          physical_activity_type: string | null
          previous_weight_treatments: string | null
          problematic_foods: string | null
          profession: string | null
          sleep_hours_per_night: number | null
          sleep_quality: string | null
          sleep_quality_score: number | null
          smoking: string | null
          stress_level: string | null
          supplements: string | null
          timeframe_to_achieve_goal: string | null
          treatment_success_definition: string | null
          updated_at: string | null
          user_id: string | null
          waist_circumference_cm: number | null
          water_intake: string | null
          weight_fluctuation_classification: string | null
          weight_gain_started_age: number | null
        }
        Insert: {
          additional_notes?: string | null
          alcohol_consumption?: string | null
          biggest_weight_loss_challenge?: string | null
          body_fat_percentage?: number | null
          chronic_diseases?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_medications?: string | null
          current_weight_kg?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: string | null
          digestive_issues?: string | null
          eating_habits?: string | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_history?: string | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_allergies?: string | null
          food_intolerances?: string | null
          food_relationship_score?: number | null
          forbidden_foods?: string | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          health_goals?: string | null
          height_cm?: number | null
          herbal_medicines?: string | null
          highest_adult_weight?: number | null
          hip_circumference_cm?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: string | null
          problematic_foods?: string | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          smoking?: string | null
          stress_level?: string | null
          supplements?: string | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id?: string | null
          waist_circumference_cm?: number | null
          water_intake?: string | null
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Update: {
          additional_notes?: string | null
          alcohol_consumption?: string | null
          biggest_weight_loss_challenge?: string | null
          body_fat_percentage?: number | null
          chronic_diseases?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_medications?: string | null
          current_weight_kg?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: string | null
          digestive_issues?: string | null
          eating_habits?: string | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_history?: string | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_allergies?: string | null
          food_intolerances?: string | null
          food_relationship_score?: number | null
          forbidden_foods?: string | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          health_goals?: string | null
          height_cm?: number | null
          herbal_medicines?: string | null
          highest_adult_weight?: number | null
          hip_circumference_cm?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: string | null
          problematic_foods?: string | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          smoking?: string | null
          stress_level?: string | null
          supplements?: string | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id?: string | null
          waist_circumference_cm?: number | null
          water_intake?: string | null
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Relationships: []
      }
      user_anamnesis_history: {
        Row: {
          anamnesis_id: string | null
          change_type: string | null
          changed_by: string | null
          changes: Json | null
          created_at: string | null
          id: string
          previous_data: Json | null
          reason: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anamnesis_id?: string | null
          change_type?: string | null
          changed_by?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          previous_data?: Json | null
          reason?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anamnesis_id?: string | null
          change_type?: string | null
          changed_by?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          previous_data?: Json | null
          reason?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_assessments: {
        Row: {
          assessment_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          responses: Json | null
          result_data: Json | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          responses?: Json | null
          result_data?: Json | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          responses?: Json | null
          result_data?: Json | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_saboteurs: {
        Row: {
          created_at: string | null
          id: string
          intensity_level: string | null
          saboteur_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity_level?: string | null
          saboteur_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity_level?: string | null
          saboteur_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_saboteurs_saboteur_id_fkey"
            columns: ["saboteur_id"]
            isOneToOne: false
            referencedRelation: "custom_saboteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_feedback: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_name: string
          expected_difficulty: string | null
          id: string
          perceived_difficulty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_name: string
          expected_difficulty?: string | null
          id?: string
          perceived_difficulty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          expected_difficulty?: string | null
          id?: string
          perceived_difficulty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exercise_programs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_week: number | null
          id: string
          program_id: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_week?: number | null
          id?: string
          program_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_week?: number | null
          id?: string
          program_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "exercise_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_foods: {
        Row: {
          category: string | null
          created_at: string | null
          food_id: string | null
          food_name: string | null
          id: string
          notes: string | null
          preference_level: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          notes?: string | null
          preference_level?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          notes?: string | null
          preference_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_food_preferences: {
        Row: {
          auto_detected: boolean | null
          created_at: string | null
          food_name: string
          id: string
          notes: string | null
          preference_type: string | null
          severity_level: string | null
          user_id: string | null
        }
        Insert: {
          auto_detected?: boolean | null
          created_at?: string | null
          food_name: string
          id?: string
          notes?: string | null
          preference_type?: string | null
          severity_level?: string | null
          user_id?: string | null
        }
        Update: {
          auto_detected?: boolean | null
          created_at?: string | null
          food_name?: string
          id?: string
          notes?: string | null
          preference_type?: string | null
          severity_level?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          achievements: Json | null
          badges: Json | null
          created_at: string | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_goal_invites: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          invited_at: string | null
          invitee_id: string | null
          inviter_id: string | null
          message: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          invited_at?: string | null
          invitee_id?: string | null
          inviter_id?: string | null
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          invited_at?: string | null
          invitee_id?: string | null
          inviter_id?: string | null
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_goal_invites_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goal_participants: {
        Row: {
          goal_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          goal_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          goal_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_goal_participants_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          challenge_id: string | null
          created_at: string | null
          current_value: number | null
          data_fim: string | null
          data_inicio: string | null
          description: string | null
          difficulty: string | null
          estimated_points: number | null
          evidence_required: boolean | null
          final_points: number | null
          goal_type: string | null
          gordura_corporal_meta_percent: number | null
          id: string
          imc_meta: number | null
          is_group_goal: boolean | null
          peso_meta_kg: number | null
          rejection_reason: string | null
          status: string | null
          target_date: string | null
          target_value: number | null
          title: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          final_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          final_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_ingredient_history: {
        Row: {
          created_at: string | null
          id: string
          ingredient_name: string | null
          is_favorite: boolean | null
          last_used_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_name?: string | null
          is_favorite?: boolean | null
          last_used_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_name?: string | null
          is_favorite?: boolean | null
          last_used_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_layout_preferences: {
        Row: {
          created_at: string
          dashboard_cards_order: string[] | null
          default_section: string | null
          hidden_dashboard_cards: string[] | null
          hidden_sidebar_items: string[] | null
          id: string
          sidebar_order: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_cards_order?: string[] | null
          default_section?: string | null
          hidden_dashboard_cards?: string[] | null
          hidden_sidebar_items?: string[] | null
          id?: string
          sidebar_order?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_cards_order?: string[] | null
          default_section?: string | null
          hidden_dashboard_cards?: string[] | null
          hidden_sidebar_items?: string[] | null
          id?: string
          sidebar_order?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_medical_reports: {
        Row: {
          analysis_data: Json | null
          created_at: string | null
          description: string | null
          doctor_name: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          follow_up_date: string | null
          id: string
          is_critical: boolean | null
          key_findings: string[] | null
          notes: string | null
          recommendations: string[] | null
          report_date: string | null
          report_type: string | null
          specialty: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          follow_up_date?: string | null
          id?: string
          is_critical?: boolean | null
          key_findings?: string[] | null
          notes?: string | null
          recommendations?: string[] | null
          report_date?: string | null
          report_type?: string | null
          specialty?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          follow_up_date?: string | null
          id?: string
          is_critical?: boolean | null
          key_findings?: string[] | null
          notes?: string | null
          recommendations?: string[] | null
          report_date?: string | null
          report_type?: string | null
          specialty?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          date_assigned: string
          id: string
          is_completed: boolean | null
          mission_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          enabled_types: Json | null
          id: string
          notification_frequency: string | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          enabled_types?: Json | null
          id?: string
          notification_frequency?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          enabled_types?: Json | null
          id?: string
          notification_frequency?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_nutraceutical_suggestions: {
        Row: {
          benefits: string[] | null
          cost_estimate: number | null
          created_at: string | null
          dosage: string | null
          duration_days: number | null
          evidence_quality: string | null
          frequency: string | null
          health_goal: string | null
          id: string
          interactions: string[] | null
          notes: string | null
          precautions: string[] | null
          priority_level: string | null
          status: string | null
          suggested_by: string | null
          supplement_name: string
          timing: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          benefits?: string[] | null
          cost_estimate?: number | null
          created_at?: string | null
          dosage?: string | null
          duration_days?: number | null
          evidence_quality?: string | null
          frequency?: string | null
          health_goal?: string | null
          id?: string
          interactions?: string[] | null
          notes?: string | null
          precautions?: string[] | null
          priority_level?: string | null
          status?: string | null
          suggested_by?: string | null
          supplement_name: string
          timing?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          benefits?: string[] | null
          cost_estimate?: number | null
          created_at?: string | null
          dosage?: string | null
          duration_days?: number | null
          evidence_quality?: string | null
          frequency?: string | null
          health_goal?: string | null
          id?: string
          interactions?: string[] | null
          notes?: string | null
          precautions?: string[] | null
          priority_level?: string | null
          status?: string | null
          suggested_by?: string | null
          supplement_name?: string
          timing?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_physical_data: {
        Row: {
          altura_cm: number
          created_at: string | null
          id: string
          idade: number
          nivel_atividade: string | null
          sexo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          altura_cm: number
          created_at?: string | null
          id?: string
          idade: number
          nivel_atividade?: string | null
          sexo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          altura_cm?: number
          created_at?: string | null
          id?: string
          idade?: number
          nivel_atividade?: string | null
          sexo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          best_streak: number | null
          completed_challenges: number | null
          created_at: string | null
          current_streak: number | null
          daily_points: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          monthly_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          best_streak?: number | null
          completed_challenges?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          monthly_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          best_streak?: number | null
          completed_challenges?: number | null
          created_at?: string | null
          current_streak?: number | null
          daily_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          monthly_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          payment_method: string | null
          product_id: string | null
          product_name: string | null
          status: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          product_name?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          product_name?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          feedback: Json | null
          id: string
          notes: string | null
          progress: number | null
          session_id: string | null
          started_at: string | null
          status: string | null
          tools_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          progress?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          tools_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          progress?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          tools_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sport_modalities: {
        Row: {
          created_at: string | null
          experience_level: string | null
          frequency_per_week: number | null
          id: string
          is_active: boolean | null
          modality: string
          preferred_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          frequency_per_week?: number | null
          id?: string
          is_active?: boolean | null
          modality: string
          preferred_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          frequency_per_week?: number | null
          id?: string
          is_active?: boolean | null
          modality?: string
          preferred_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sports_modalities: {
        Row: {
          created_at: string | null
          goals: string[] | null
          id: string
          is_primary: boolean | null
          skill_level: string | null
          sport_name: string
          training_frequency: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          is_primary?: boolean | null
          skill_level?: string | null
          sport_name: string
          training_frequency?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          is_primary?: boolean | null
          skill_level?: string | null
          sport_name?: string
          training_frequency?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          started_at: string | null
          status: string
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string
          subscription_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_supplements: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          start_date: string | null
          supplement_id: string | null
          supplement_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date?: string | null
          supplement_id?: string | null
          supplement_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date?: string | null
          supplement_id?: string | null
          supplement_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_supplements_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      users_needing_analysis: {
        Row: {
          analysis_type: string | null
          completed_at: string | null
          id: string
          notes: string | null
          priority: number | null
          requested_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          requested_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          requested_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      valores_nutricionais_completos: {
        Row: {
          alimento_id: string | null
          alimento_nome: string
          carboidratos: number | null
          created_at: string | null
          fibras: number | null
          gorduras: number | null
          id: string
          kcal: number | null
          proteina: number | null
          sodio: number | null
        }
        Insert: {
          alimento_id?: string | null
          alimento_nome: string
          carboidratos?: number | null
          created_at?: string | null
          fibras?: number | null
          gorduras?: number | null
          id?: string
          kcal?: number | null
          proteina?: number | null
          sodio?: number | null
        }
        Update: {
          alimento_id?: string | null
          alimento_nome?: string
          carboidratos?: number | null
          created_at?: string | null
          fibras?: number | null
          gorduras?: number | null
          id?: string
          kcal?: number | null
          proteina?: number | null
          sodio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valores_nutricionais_completos_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      vegetable_pool: {
        Row: {
          category: string | null
          food_name: string
        }
        Insert: {
          category?: string | null
          food_name: string
        }
        Update: {
          category?: string | null
          food_name?: string
        }
        Relationships: []
      }
      water_tracking: {
        Row: {
          amount_ml: number | null
          created_at: string | null
          date: string | null
          id: string
          time: string | null
          user_id: string | null
        }
        Insert: {
          amount_ml?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          time?: string | null
          user_id?: string | null
        }
        Update: {
          amount_ml?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          time?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_analyses: {
        Row: {
          created_at: string | null
          id: string
          media_imc: number | null
          observacoes: string | null
          peso_final: number | null
          peso_inicial: number | null
          semana_fim: string
          semana_inicio: string
          tendencia: string | null
          user_id: string | null
          variacao_gordura_corporal: number | null
          variacao_massa_muscular: number | null
          variacao_peso: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim: string
          semana_inicio: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim?: string
          semana_inicio?: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Relationships: []
      }
      weekly_goal_progress: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          notes: string | null
          progress_value: number | null
          user_id: string | null
          week_start: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          progress_value?: number | null
          user_id?: string | null
          week_start?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          progress_value?: number | null
          user_id?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_insights: {
        Row: {
          average_energy: number | null
          average_mood: number | null
          average_stress: number | null
          created_at: string | null
          exercise_frequency: number | null
          id: string
          most_common_gratitude: string | null
          sleep_consistency: number | null
          total_points: number | null
          user_id: string
          water_consistency: number | null
          week_start_date: string
        }
        Insert: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          total_points?: number | null
          user_id: string
          water_consistency?: number | null
          week_start_date: string
        }
        Update: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          total_points?: number | null
          user_id?: string
          water_consistency?: number | null
          week_start_date?: string
        }
        Relationships: []
      }
      weighings: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          created_at: string | null
          date: string | null
          id: string
          measurement_context: string | null
          mood: string | null
          notes: string | null
          time: string | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          measurement_context?: string | null
          mood?: string | null
          notes?: string | null
          time?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg: number
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          measurement_context?: string | null
          mood?: string | null
          notes?: string | null
          time?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      weight_measurements: {
        Row: {
          agua_corporal_percent: number | null
          circunferencia_abdominal_cm: number | null
          circunferencia_braco_cm: number | null
          circunferencia_perna_cm: number | null
          created_at: string | null
          device_type: string | null
          gordura_corporal_percent: number | null
          gordura_visceral: number | null
          id: string
          idade_metabolica: number | null
          imc: number | null
          massa_muscular_kg: number | null
          massa_ossea_kg: number | null
          measurement_date: string | null
          metabolismo_basal_kcal: number | null
          notes: string | null
          osso_kg: number | null
          peso_kg: number
          risco_cardiometabolico: string | null
          risco_metabolico: string | null
          user_id: string | null
        }
        Insert: {
          agua_corporal_percent?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          massa_ossea_kg?: number | null
          measurement_date?: string | null
          metabolismo_basal_kcal?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg: number
          risco_cardiometabolico?: string | null
          risco_metabolico?: string | null
          user_id?: string | null
        }
        Update: {
          agua_corporal_percent?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          massa_ossea_kg?: number | null
          measurement_date?: string | null
          metabolismo_basal_kcal?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg?: number
          risco_cardiometabolico?: string | null
          risco_metabolico?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weight_measures: {
        Row: {
          arm_circumference_cm: number | null
          basal_metabolic_rate: number | null
          bmi: number | null
          body_fat_percentage: number | null
          body_type: string | null
          bone_mass_kg: number | null
          calf_circumference_cm: number | null
          chest_circumference_cm: number | null
          created_at: string | null
          device_used: string | null
          height_cm: number | null
          hip_circumference_cm: number | null
          id: string
          measurement_conditions: string | null
          measurement_date: string | null
          measurement_method: string | null
          metabolic_age: number | null
          muscle_mass_kg: number | null
          neck_circumference_cm: number | null
          notes: string | null
          photo_url: string | null
          protein_percentage: number | null
          thigh_circumference_cm: number | null
          updated_at: string | null
          user_id: string | null
          visceral_fat_level: number | null
          waist_circumference_cm: number | null
          water_percentage: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_circumference_cm?: number | null
          basal_metabolic_rate?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          body_type?: string | null
          bone_mass_kg?: number | null
          calf_circumference_cm?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          device_used?: string | null
          height_cm?: number | null
          hip_circumference_cm?: number | null
          id?: string
          measurement_conditions?: string | null
          measurement_date?: string | null
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          neck_circumference_cm?: number | null
          notes?: string | null
          photo_url?: string | null
          protein_percentage?: number | null
          thigh_circumference_cm?: number | null
          updated_at?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          waist_circumference_cm?: number | null
          water_percentage?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_circumference_cm?: number | null
          basal_metabolic_rate?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          body_type?: string | null
          bone_mass_kg?: number | null
          calf_circumference_cm?: number | null
          chest_circumference_cm?: number | null
          created_at?: string | null
          device_used?: string | null
          height_cm?: number | null
          hip_circumference_cm?: number | null
          id?: string
          measurement_conditions?: string | null
          measurement_date?: string | null
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          neck_circumference_cm?: number | null
          notes?: string | null
          photo_url?: string | null
          protein_percentage?: number | null
          thigh_circumference_cm?: number | null
          updated_at?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          waist_circumference_cm?: number | null
          water_percentage?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      wheel_of_life: {
        Row: {
          assessment_date: string | null
          career_score: number | null
          created_at: string | null
          environment_score: number | null
          finances_score: number | null
          fun_recreation_score: number | null
          health_score: number | null
          id: string
          notes: string | null
          overall_balance: number | null
          personal_growth_score: number | null
          relationships_score: number | null
          spirituality_score: number | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          career_score?: number | null
          created_at?: string | null
          environment_score?: number | null
          finances_score?: number | null
          fun_recreation_score?: number | null
          health_score?: number | null
          id?: string
          notes?: string | null
          overall_balance?: number | null
          personal_growth_score?: number | null
          relationships_score?: number | null
          spirituality_score?: number | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          career_score?: number | null
          created_at?: string | null
          environment_score?: number | null
          finances_score?: number | null
          fun_recreation_score?: number | null
          health_score?: number | null
          id?: string
          notes?: string | null
          overall_balance?: number | null
          personal_growth_score?: number | null
          relationships_score?: number | null
          spirituality_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_weeks: number | null
          exercises: Json | null
          goal: string | null
          id: string
          is_active: boolean | null
          name: string | null
          updated_at: string | null
          user_id: string | null
          workouts_per_week: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
          workouts_per_week?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          exercises?: Json | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
          workouts_per_week?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      exercise_progress_stats: {
        Row: {
          avg_reps: number | null
          avg_weight: number | null
          exercise_id: string | null
          exercise_name: string | null
          first_workout: string | null
          last_workout: string | null
          max_reps: number | null
          max_weight: number | null
          total_sessions: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progress_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_library"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ingestão_diária_de_macronutrientes: {
        Row: {
          agua_ml_dia: number | null
          calorias_dia: number | null
          carboidratos_dia: number | null
          data: string | null
          fibras_dia: number | null
          gorduras_dia: number | null
          proteinas_dia: number | null
          registros_dia: number | null
          score_medio: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_user_conversation_summary: {
        Row: {
          conversas_ids: string[] | null
          sentimento_medio: number | null
          total_conversas: number | null
          ultima_conversa: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_session_to_all_users: {
        Args: { session_id_param: string }
        Returns: boolean
      }
      assign_session_to_users: {
        Args: { session_id_param: string; user_ids_param: string[] }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_role_text: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

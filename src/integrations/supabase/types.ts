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
          energy_drop_time: string | null
          energy_level: number | null
          exercise_duration_minutes: number | null
          exercise_type: string | null
          fats_g: number | null
          focus_level: number | null
          id: string
          light_walks_minutes: number | null
          medications_taken: string[] | null
          mood_rating: number | null
          movement_quality: string | null
          muscle_mass_kg: number | null
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          photo_url: string | null
          protein_g: number | null
          resting_heart_rate: number | null
          sitting_hours: number | null
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
          energy_drop_time?: string | null
          energy_level?: number | null
          exercise_duration_minutes?: number | null
          exercise_type?: string | null
          fats_g?: number | null
          focus_level?: number | null
          id?: string
          light_walks_minutes?: number | null
          medications_taken?: string[] | null
          mood_rating?: number | null
          movement_quality?: string | null
          muscle_mass_kg?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          photo_url?: string | null
          protein_g?: number | null
          resting_heart_rate?: number | null
          sitting_hours?: number | null
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
          energy_drop_time?: string | null
          energy_level?: number | null
          exercise_duration_minutes?: number | null
          exercise_type?: string | null
          fats_g?: number | null
          focus_level?: number | null
          id?: string
          light_walks_minutes?: number | null
          medications_taken?: string[] | null
          mood_rating?: number | null
          movement_quality?: string | null
          muscle_mass_kg?: number | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          photo_url?: string | null
          protein_g?: number | null
          resting_heart_rate?: number | null
          sitting_hours?: number | null
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
      ai_response_cache: {
        Row: {
          created_at: string
          expires_at: string
          hit_count: number | null
          id: string
          last_hit_at: string | null
          model_used: string | null
          query_hash: string
          query_input: string
          query_type: string
          response_text: string
          tokens_used: number | null
          ttl_hours: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          model_used?: string | null
          query_hash: string
          query_input: string
          query_type: string
          response_text: string
          tokens_used?: number | null
          ttl_hours?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          model_used?: string | null
          query_hash?: string
          query_input?: string
          query_type?: string
          response_text?: string
          tokens_used?: number | null
          ttl_hours?: number | null
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
          created_at: string | null
          error_message: string | null
          estimated_cost: number | null
          functionality: string | null
          id: string
          metadata: Json | null
          method: string
          model_name: string | null
          provider: string
          response_time_ms: number | null
          success: boolean | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          functionality?: string | null
          id?: string
          metadata?: Json | null
          method: string
          model_name?: string | null
          provider: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          functionality?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          model_name?: string | null
          provider?: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
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
      analysis_cache: {
        Row: {
          analysis_type: string
          cache_key: string | null
          created_at: string | null
          expires_at: string | null
          hits: number | null
          id: string
          image_hash: string
          last_hit_at: string | null
          model_used: string | null
          processing_time_ms: number | null
          result: Json
          yolo_confidence: number | null
        }
        Insert: {
          analysis_type: string
          cache_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          hits?: number | null
          id?: string
          image_hash: string
          last_hit_at?: string | null
          model_used?: string | null
          processing_time_ms?: number | null
          result: Json
          yolo_confidence?: number | null
        }
        Update: {
          analysis_type?: string
          cache_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          hits?: number | null
          id?: string
          image_hash?: string
          last_hit_at?: string | null
          model_used?: string | null
          processing_time_ms?: number | null
          result?: Json
          yolo_confidence?: number | null
        }
        Relationships: []
      }
      analysis_jobs: {
        Row: {
          actual_duration_seconds: number | null
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          estimated_duration_seconds: number | null
          id: string
          input_data: Json
          job_type: string
          max_attempts: number | null
          priority: number | null
          result: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          worker_id: string | null
        }
        Insert: {
          actual_duration_seconds?: number | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          input_data?: Json
          job_type: string
          max_attempts?: number | null
          priority?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          worker_id?: string | null
        }
        Update: {
          actual_duration_seconds?: number | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          input_data?: Json
          job_type?: string
          max_attempts?: number | null
          priority?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          worker_id?: string | null
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
      challenge_participations: {
        Row: {
          best_streak: number | null
          boss_defeated: boolean | null
          challenge_id: string
          combo_days: number | null
          combo_multiplier: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_streak: number | null
          id: string
          is_completed: boolean | null
          journey_checkpoint: number | null
          points_earned: number | null
          powerups_used: Json | null
          progress: number | null
          started_at: string | null
          target_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          boss_defeated?: boolean | null
          challenge_id: string
          combo_days?: number | null
          combo_multiplier?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_completed?: boolean | null
          journey_checkpoint?: number | null
          points_earned?: number | null
          powerups_used?: Json | null
          progress?: number | null
          started_at?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          boss_defeated?: boolean | null
          challenge_id?: string
          combo_days?: number | null
          combo_multiplier?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          is_completed?: boolean | null
          journey_checkpoint?: number | null
          points_earned?: number | null
          powerups_used?: Json | null
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
      challenge_team_members: {
        Row: {
          contribution_xp: number | null
          id: string
          joined_at: string | null
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          contribution_xp?: number | null
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          contribution_xp?: number | null
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "challenge_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_teams: {
        Row: {
          avatar_emoji: string | null
          challenges_completed: number | null
          color: string | null
          created_at: string | null
          current_rank: number | null
          description: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          leader_id: string
          max_members: number | null
          name: string
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          challenges_completed?: number | null
          color?: string | null
          created_at?: string | null
          current_rank?: number | null
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          leader_id: string
          max_members?: number | null
          name: string
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          challenges_completed?: number | null
          color?: string | null
          created_at?: string | null
          current_rank?: number | null
          description?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          leader_id?: string
          max_members?: number | null
          name?: string
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          auto_assign: boolean | null
          badge_icon: string | null
          badge_name: string | null
          badge_reward: string | null
          challenge_mode: Database["public"]["Enums"]["challenge_mode"] | null
          challenge_type: string | null
          color: string | null
          combo_enabled: boolean | null
          completion_criteria: Json | null
          created_at: string | null
          created_by: string | null
          daily_log_target: number | null
          daily_log_type: string | null
          daily_log_unit: string | null
          description: string | null
          difficulty: string | null
          display_mode: string | null
          display_priority: number | null
          duration_days: number | null
          end_date: string | null
          entry_fee: number | null
          event_id: string | null
          featured: boolean | null
          featured_until: string | null
          frequency: string | null
          icon: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_group_challenge: boolean | null
          journey_id: string | null
          max_combo_multiplier: number | null
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
          team_only: boolean | null
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
          challenge_mode?: Database["public"]["Enums"]["challenge_mode"] | null
          challenge_type?: string | null
          color?: string | null
          combo_enabled?: boolean | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          display_mode?: string | null
          display_priority?: number | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          event_id?: string | null
          featured?: boolean | null
          featured_until?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          journey_id?: string | null
          max_combo_multiplier?: number | null
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
          team_only?: boolean | null
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
          challenge_mode?: Database["public"]["Enums"]["challenge_mode"] | null
          challenge_type?: string | null
          color?: string | null
          combo_enabled?: boolean | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          display_mode?: string | null
          display_priority?: number | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          event_id?: string | null
          featured?: boolean | null
          featured_until?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          journey_id?: string | null
          max_combo_multiplier?: number | null
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
          team_only?: boolean | null
          tips?: string[] | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversation_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          personality: string | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          personality: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          personality?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
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
          session_attempt_id: string | null
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
          session_attempt_id?: string | null
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
          session_attempt_id?: string | null
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_settings: {
        Row: {
          banner_image_url: string | null
          banner_subtitle: string | null
          banner_title: string | null
          banner_video_url: string | null
          created_at: string
          key: string
          updated_at: string
          view_mode: string | null
        }
        Insert: {
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          banner_video_url?: string | null
          created_at?: string
          key: string
          updated_at?: string
          view_mode?: string | null
        }
        Update: {
          banner_image_url?: string | null
          banner_subtitle?: string | null
          banner_title?: string | null
          banner_video_url?: string | null
          created_at?: string
          key?: string
          updated_at?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      exercise_challenges: {
        Row: {
          accepted_at: string | null
          challenge_type: string
          challenged_id: string
          challenged_progress: number | null
          challenger_id: string
          challenger_progress: number | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          exercise_emoji: string | null
          exercise_name: string
          expires_at: string | null
          id: string
          started_at: string | null
          status: string | null
          target_value: number | null
          winner_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          challenge_type: string
          challenged_id: string
          challenged_progress?: number | null
          challenger_id: string
          challenger_progress?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          exercise_emoji?: string | null
          exercise_name: string
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          winner_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          challenge_type?: string
          challenged_id?: string
          challenged_progress?: number | null
          challenger_id?: string
          challenger_progress?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          exercise_emoji?: string | null
          exercise_name?: string
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          winner_id?: string | null
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
      exercises_library: {
        Row: {
          age_appropriate: string[] | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          equipment_needed: string[] | null
          gender_focus: string | null
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
          special_condition: string | null
          tags: string[] | null
          target_audience: string[] | null
          tips: string | null
          updated_at: string | null
          youtube_channel: string | null
          youtube_quality: string | null
          youtube_url: string | null
        }
        Insert: {
          age_appropriate?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string[] | null
          gender_focus?: string | null
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
          special_condition?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          tips?: string | null
          updated_at?: string | null
          youtube_channel?: string | null
          youtube_quality?: string | null
          youtube_url?: string | null
        }
        Update: {
          age_appropriate?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string[] | null
          gender_focus?: string | null
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
          special_condition?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          tips?: string | null
          updated_at?: string | null
          youtube_channel?: string | null
          youtube_quality?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      flash_challenges: {
        Row: {
          bonus_multiplier: number | null
          challenge_type: string
          created_at: string | null
          description: string | null
          duration_hours: number
          emoji: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          starts_at: string
          target_value: number
          title: string
          unit: string | null
          xp_reward: number
        }
        Insert: {
          bonus_multiplier?: number | null
          challenge_type: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          emoji?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          target_value: number
          title: string
          unit?: string | null
          xp_reward?: number
        }
        Update: {
          bonus_multiplier?: number | null
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          emoji?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          starts_at?: string
          target_value?: number
          title?: string
          unit?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      food_history: {
        Row: {
          ai_analysis: string | null
          confidence_score: number | null
          created_at: string | null
          deleted_at: string | null
          food_items: Json | null
          id: string
          meal_date: string
          meal_time: string | null
          meal_type: string | null
          photo_url: string | null
          source: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_proteins: number | null
          updated_at: string | null
          user_confirmed: boolean | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          food_items?: Json | null
          id?: string
          meal_date?: string
          meal_time?: string | null
          meal_type?: string | null
          photo_url?: string | null
          source?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_confirmed?: boolean | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          food_items?: Json | null
          id?: string
          meal_date?: string
          meal_time?: string | null
          meal_type?: string | null
          photo_url?: string | null
          source?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_confirmed?: boolean | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      goal_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          goal_id: string | null
          id: string
          last_update_date: string | null
          longest_streak: number | null
          protection_used_at: string | null
          streak_protected: boolean | null
          streak_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          goal_id?: string | null
          id?: string
          last_update_date?: string | null
          longest_streak?: number | null
          protection_used_at?: string | null
          streak_protected?: boolean | null
          streak_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          goal_id?: string | null
          id?: string
          last_update_date?: string | null
          longest_streak?: number | null
          protection_used_at?: string | null
          streak_protected?: boolean | null
          streak_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_streaks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
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
      health_feed_direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "fk_health_feed_follows_follower"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_health_feed_follows_following"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      health_feed_notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
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
          mentions: string[] | null
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
          mentions?: string[] | null
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
          mentions?: string[] | null
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
      health_feed_stories: {
        Row: {
          background_color: string | null
          category: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string | null
          media_url: string
          text_content: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          background_color?: string | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string | null
          media_url: string
          text_content?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          background_color?: string | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string
          text_content?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      health_feed_story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_feed_story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "health_feed_stories"
            referencedColumns: ["id"]
          },
        ]
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
      job_queue: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          lock_expires_at: string | null
          locked_at: string | null
          locked_by: string | null
          priority: number
          scheduled_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          lock_expires_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          priority?: number
          scheduled_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          lock_expires_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          priority?: number
          scheduled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
        ]
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
      medical_pdf_reports: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_size_bytes: number | null
          html_url: string | null
          id: string
          is_permanent: boolean | null
          medical_document_id: string | null
          pdf_path: string
          pdf_url: string
          public_link_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          html_url?: string | null
          id?: string
          is_permanent?: boolean | null
          medical_document_id?: string | null
          pdf_path: string
          pdf_url: string
          public_link_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          html_url?: string | null
          id?: string
          is_permanent?: boolean | null
          medical_document_id?: string | null
          pdf_path?: string
          pdf_url?: string
          public_link_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_pdf_reports_medical_document_id_fkey"
            columns: ["medical_document_id"]
            isOneToOne: false
            referencedRelation: "medical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_pdf_reports_public_link_id_fkey"
            columns: ["public_link_id"]
            isOneToOne: false
            referencedRelation: "public_report_links"
            referencedColumns: ["id"]
          },
        ]
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
      notification_queue_unified: {
        Row: {
          action_url: string | null
          body: string
          category: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          read_at: string | null
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          sent_via: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          category?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_via?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          category?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_via?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
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
          deleted_at: string | null
          food_items: Json | null
          id: string
          meal_type: string | null
          notes: string | null
          photo_url: string | null
          status: string | null
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
          deleted_at?: string | null
          food_items?: Json | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          status?: string | null
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
          deleted_at?: string | null
          food_items?: Json | null
          id?: string
          meal_type?: string | null
          notes?: string | null
          photo_url?: string | null
          status?: string | null
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
          calories_target: number | null
          carbs_target: number | null
          created_at: string | null
          fats_target: number | null
          fiber_target: number | null
          id: string
          protein_target: number | null
          updated_at: string | null
          user_id: string
          water_target: number | null
        }
        Insert: {
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          fats_target?: number | null
          fiber_target?: number | null
          id?: string
          protein_target?: number | null
          updated_at?: string | null
          user_id: string
          water_target?: number | null
        }
        Update: {
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          fats_target?: number | null
          fiber_target?: number | null
          id?: string
          protein_target?: number | null
          updated_at?: string | null
          user_id?: string
          water_target?: number | null
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
      points_configuration: {
        Row: {
          action_name: string
          action_type: string
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          max_daily: number | null
          multiplier: number | null
          points: number | null
          updated_at: string | null
        }
        Insert: {
          action_name: string
          action_type: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          multiplier?: number | null
          points?: number | null
          updated_at?: string | null
        }
        Update: {
          action_name?: string
          action_type?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_daily?: number | null
          multiplier?: number | null
          points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preventive_health_analyses: {
        Row: {
          analysis_type: string | null
          created_at: string | null
          id: string
          recommendations: Json | null
          risk_factors: Json | null
          risk_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_type?: string | null
          created_at?: string | null
          id?: string
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_type?: string | null
          created_at?: string | null
          id?: string
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      productivity_tracking: {
        Row: {
          created_at: string | null
          energy_correlation: string | null
          focus_rating: number | null
          id: string
          main_distractions: string[] | null
          notes: string | null
          peak_productivity_time: string | null
          procrastination_episodes: number | null
          productivity_rating: number | null
          tasks_completed: number | null
          tasks_planned: number | null
          tracking_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_correlation?: string | null
          focus_rating?: number | null
          id?: string
          main_distractions?: string[] | null
          notes?: string | null
          peak_productivity_time?: string | null
          procrastination_episodes?: number | null
          productivity_rating?: number | null
          tasks_completed?: number | null
          tasks_planned?: number | null
          tracking_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_correlation?: string | null
          focus_rating?: number | null
          id?: string
          main_distractions?: string[] | null
          notes?: string | null
          peak_productivity_time?: string | null
          procrastination_episodes?: number | null
          productivity_rating?: number | null
          tasks_completed?: number | null
          tasks_planned?: number | null
          tracking_date?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          bio: string | null
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
          instagram_handle: string | null
          interests: string[] | null
          phone: string | null
          points: number | null
          preferences: Json | null
          provider: string | null
          role: string | null
          show_points: boolean | null
          show_streak: boolean | null
          show_weight_results: boolean | null
          state: string | null
          target_weight: number | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
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
          instagram_handle?: string | null
          interests?: string[] | null
          phone?: string | null
          points?: number | null
          preferences?: Json | null
          provider?: string | null
          role?: string | null
          show_points?: boolean | null
          show_streak?: boolean | null
          show_weight_results?: boolean | null
          state?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
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
          instagram_handle?: string | null
          interests?: string[] | null
          phone?: string | null
          points?: number | null
          preferences?: Json | null
          provider?: string | null
          role?: string | null
          show_points?: boolean | null
          show_streak?: boolean | null
          show_weight_results?: boolean | null
          state?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      public_report_links: {
        Row: {
          created_at: string | null
          exam_date: string | null
          exam_type: string | null
          expires_at: string | null
          id: string
          last_viewed_at: string | null
          medical_document_id: string | null
          report_path: string
          title: string | null
          token: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          exam_date?: string | null
          exam_type?: string | null
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          medical_document_id?: string | null
          report_path: string
          title?: string | null
          token?: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          exam_date?: string | null
          exam_type?: string | null
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          medical_document_id?: string | null
          report_path?: string
          title?: string | null
          token?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string
          endpoint: string
          id: string
          is_blocked: boolean | null
          max_requests: number | null
          request_count: number | null
          updated_at: string
          user_id: string
          window_hours: number | null
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          endpoint: string
          id?: string
          is_blocked?: boolean | null
          max_requests?: number | null
          request_count?: number | null
          updated_at?: string
          user_id: string
          window_hours?: number | null
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          is_blocked?: boolean | null
          max_requests?: number | null
          request_count?: number | null
          updated_at?: string
          user_id?: string
          window_hours?: number | null
          window_start?: string
        }
        Relationships: []
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
      received_leads: {
        Row: {
          created_at: string
          id: string
          lead_data: Json
          notes: string | null
          processed: boolean | null
          processed_at: string | null
          received_at: string
          source_name: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_data: Json
          notes?: string | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          source_name?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_data?: Json
          notes?: string | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          source_name?: string | null
          source_url?: string | null
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
        Relationships: []
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
      seasonal_events: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          ends_at: string
          exclusive_rewards: Json | null
          id: string
          is_active: boolean | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          starts_at: string
          theme: string
          total_challenges: number | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          ends_at: string
          exclusive_rewards?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          starts_at: string
          theme: string
          total_challenges?: number | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          ends_at?: string
          exclusive_rewards?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          starts_at?: string
          theme?: string
          total_challenges?: number | null
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
          confirmation_prompt_sent: boolean | null
          confirmation_status: string | null
          confirmed_by_user: boolean | null
          created_at: string | null
          fats: number | null
          food_image_url: string | null
          food_name: string | null
          foods_detected: Json | null
          health_score: number | null
          id: string
          image_deleted: boolean | null
          image_deleted_at: string | null
          image_url: string | null
          label_studio_task_id: string | null
          meal_date: string | null
          meal_time: string | null
          meal_type: string | null
          proteins: number | null
          recommendations: string | null
          sofia_analysis: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          analysis_result?: Json | null
          calories?: number | null
          carbs?: number | null
          confirmation_prompt_sent?: boolean | null
          confirmation_status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          fats?: number | null
          food_image_url?: string | null
          food_name?: string | null
          foods_detected?: Json | null
          health_score?: number | null
          id?: string
          image_deleted?: boolean | null
          image_deleted_at?: string | null
          image_url?: string | null
          label_studio_task_id?: string | null
          meal_date?: string | null
          meal_time?: string | null
          meal_type?: string | null
          proteins?: number | null
          recommendations?: string | null
          sofia_analysis?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          analysis_result?: Json | null
          calories?: number | null
          carbs?: number | null
          confirmation_prompt_sent?: boolean | null
          confirmation_status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          fats?: number | null
          food_image_url?: string | null
          food_name?: string | null
          foods_detected?: Json | null
          health_score?: number | null
          id?: string
          image_deleted?: boolean | null
          image_deleted_at?: string | null
          image_url?: string | null
          label_studio_task_id?: string | null
          meal_date?: string | null
          meal_time?: string | null
          meal_type?: string | null
          proteins?: number | null
          recommendations?: string | null
          sofia_analysis?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          user_id?: string | null
          user_name?: string | null
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
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
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
      team_challenge_contributions: {
        Row: {
          contribution_value: number | null
          id: string
          last_updated: string | null
          team_challenge_id: string
          user_id: string
        }
        Insert: {
          contribution_value?: number | null
          id?: string
          last_updated?: string | null
          team_challenge_id: string
          user_id: string
        }
        Update: {
          contribution_value?: number | null
          id?: string
          last_updated?: string | null
          team_challenge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_challenge_contributions_team_challenge_id_fkey"
            columns: ["team_challenge_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          challenge_type: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          description: string | null
          ends_at: string
          id: string
          is_completed: boolean | null
          starts_at: string | null
          target_value: number
          team_id: string
          title: string
          total_xp_reward: number | null
          unit: string | null
        }
        Insert: {
          challenge_type: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          ends_at: string
          id?: string
          is_completed?: boolean | null
          starts_at?: string | null
          target_value: number
          team_id: string
          title: string
          total_xp_reward?: number | null
          unit?: string | null
        }
        Update: {
          challenge_type?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          description?: string | null
          ends_at?: string
          id?: string
          is_completed?: boolean | null
          starts_at?: string | null
          target_value?: number
          team_id?: string
          title?: string
          total_xp_reward?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_challenges_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "challenge_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_chat_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "challenge_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_name: string | null
          achievement_type: string | null
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_name?: string | null
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_name?: string | null
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements_v2: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          description: string | null
          icon: string | null
          id: string
          related_challenge_id: string | null
          related_duel_id: string | null
          related_event_id: string | null
          title: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          description?: string | null
          icon?: string | null
          id?: string
          related_challenge_id?: string | null
          related_duel_id?: string | null
          related_event_id?: string | null
          title: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          description?: string | null
          icon?: string | null
          id?: string
          related_challenge_id?: string | null
          related_duel_id?: string | null
          related_event_id?: string | null
          title?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_v2_related_challenge_id_fkey"
            columns: ["related_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_v2_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
        ]
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
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
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
      user_exercise_history: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          difficulty_level: string | null
          duration_seconds: number | null
          exercise_name: string
          exercise_type: string | null
          id: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          user_id: string
          weight_used: number | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          exercise_name: string
          exercise_type?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id: string
          weight_used?: number | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          exercise_name?: string
          exercise_type?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id?: string
          weight_used?: number | null
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
      user_goal_levels: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_xp: number | null
          id: string
          level_title: string | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp_to_next_level: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          level_title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp_to_next_level?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          level_title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp_to_next_level?: number | null
        }
        Relationships: []
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
          evidence_urls: string[] | null
          final_points: number | null
          goal_type: string | null
          gordura_corporal_meta_percent: number | null
          id: string
          imc_meta: number | null
          is_group_goal: boolean | null
          last_update_date: string | null
          level: number | null
          participant_ids: string[] | null
          peso_meta_kg: number | null
          rejection_reason: string | null
          status: string | null
          streak_days: number | null
          target_date: string | null
          target_value: number | null
          title: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
          xp_earned: number | null
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
          evidence_urls?: string[] | null
          final_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          last_update_date?: string | null
          level?: number | null
          participant_ids?: string[] | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          streak_days?: number | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
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
          evidence_urls?: string[] | null
          final_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          last_update_date?: string | null
          level?: number | null
          participant_ids?: string[] | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          streak_days?: number | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
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
      user_leagues: {
        Row: {
          created_at: string | null
          current_league: Database["public"]["Enums"]["league_tier"]
          highest_league: Database["public"]["Enums"]["league_tier"] | null
          id: string
          rank_position: number | null
          total_demotions: number | null
          total_promotions: number | null
          updated_at: string | null
          user_id: string
          week_start: string
          weekly_xp: number
          weeks_in_current_league: number | null
        }
        Insert: {
          created_at?: string | null
          current_league?: Database["public"]["Enums"]["league_tier"]
          highest_league?: Database["public"]["Enums"]["league_tier"] | null
          id?: string
          rank_position?: number | null
          total_demotions?: number | null
          total_promotions?: number | null
          updated_at?: string | null
          user_id: string
          week_start?: string
          weekly_xp?: number
          weeks_in_current_league?: number | null
        }
        Update: {
          created_at?: string | null
          current_league?: Database["public"]["Enums"]["league_tier"]
          highest_league?: Database["public"]["Enums"]["league_tier"] | null
          id?: string
          rank_position?: number | null
          total_demotions?: number | null
          total_promotions?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
          weekly_xp?: number
          weeks_in_current_league?: number | null
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
          whatsapp_challenges_enabled: boolean | null
          whatsapp_challenges_time: string | null
          whatsapp_daily_motivation: boolean | null
          whatsapp_daily_summary_enabled: boolean | null
          whatsapp_daily_summary_time: string | null
          whatsapp_daily_time: string | null
          whatsapp_enabled: boolean | null
          whatsapp_goals_enabled: boolean | null
          whatsapp_goals_time: string | null
          whatsapp_mission_enabled: boolean | null
          whatsapp_mission_time: string | null
          whatsapp_nutrition_enabled: boolean | null
          whatsapp_nutrition_times: Json | null
          whatsapp_reminders: boolean | null
          whatsapp_water_enabled: boolean | null
          whatsapp_water_times: string[] | null
          whatsapp_weekly_day: number | null
          whatsapp_weekly_report: boolean | null
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
          whatsapp_challenges_enabled?: boolean | null
          whatsapp_challenges_time?: string | null
          whatsapp_daily_motivation?: boolean | null
          whatsapp_daily_summary_enabled?: boolean | null
          whatsapp_daily_summary_time?: string | null
          whatsapp_daily_time?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_goals_enabled?: boolean | null
          whatsapp_goals_time?: string | null
          whatsapp_mission_enabled?: boolean | null
          whatsapp_mission_time?: string | null
          whatsapp_nutrition_enabled?: boolean | null
          whatsapp_nutrition_times?: Json | null
          whatsapp_reminders?: boolean | null
          whatsapp_water_enabled?: boolean | null
          whatsapp_water_times?: string[] | null
          whatsapp_weekly_day?: number | null
          whatsapp_weekly_report?: boolean | null
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
          whatsapp_challenges_enabled?: boolean | null
          whatsapp_challenges_time?: string | null
          whatsapp_daily_motivation?: boolean | null
          whatsapp_daily_summary_enabled?: boolean | null
          whatsapp_daily_summary_time?: string | null
          whatsapp_daily_time?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_goals_enabled?: boolean | null
          whatsapp_goals_time?: string | null
          whatsapp_mission_enabled?: boolean | null
          whatsapp_mission_time?: string | null
          whatsapp_nutrition_enabled?: boolean | null
          whatsapp_nutrition_times?: Json | null
          whatsapp_reminders?: boolean | null
          whatsapp_water_enabled?: boolean | null
          whatsapp_water_times?: string[] | null
          whatsapp_weekly_day?: number | null
          whatsapp_weekly_report?: boolean | null
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
          missions_completed: number | null
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
          missions_completed?: number | null
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
          missions_completed?: number | null
          monthly_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
      user_powerups: {
        Row: {
          acquired_at: string | null
          expires_at: string | null
          id: string
          powerup_type: Database["public"]["Enums"]["powerup_type"]
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          expires_at?: string | null
          id?: string
          powerup_type: Database["public"]["Enums"]["powerup_type"]
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          expires_at?: string | null
          id?: string
          powerup_type?: Database["public"]["Enums"]["powerup_type"]
          quantity?: number
          user_id?: string
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
          auto_save_data: Json | null
          completed_at: string | null
          created_at: string | null
          cycle_number: number | null
          due_date: string | null
          feedback: Json | null
          id: string
          is_locked: boolean | null
          next_available_date: string | null
          notes: string | null
          progress: number | null
          review_count: number | null
          session_id: string | null
          started_at: string | null
          status: string | null
          tools_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          auto_save_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          cycle_number?: number | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          is_locked?: boolean | null
          next_available_date?: string | null
          notes?: string | null
          progress?: number | null
          review_count?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          tools_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          auto_save_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          cycle_number?: number | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          is_locked?: boolean | null
          next_available_date?: string | null
          notes?: string | null
          progress?: number | null
          review_count?: number | null
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
          created_at: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          subscription_type?: string | null
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
      user_workout_evolution: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          last_workout_date: string | null
          max_reps: number | null
          max_weight_kg: number | null
          progression_trend: string | null
          total_sets: number | null
          total_volume: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          last_workout_date?: string | null
          max_reps?: number | null
          max_weight_kg?: number | null
          progression_trend?: string | null
          total_sets?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          last_workout_date?: string | null
          max_reps?: number | null
          max_weight_kg?: number | null
          progression_trend?: string | null
          total_sets?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
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
      water_tracking: {
        Row: {
          amount_ml: number
          created_at: string | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_destinations: {
        Row: {
          created_at: string | null
          events: string[] | null
          headers: Json | null
          id: string
          is_active: boolean | null
          name: string
          retry_count: number | null
          secret_key: string | null
          timeout_seconds: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          retry_count?: number | null
          secret_key?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          retry_count?: number | null
          secret_key?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      webhook_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          destination_id: string | null
          destination_url: string
          event_type: string
          execution_time_ms: number | null
          headers_sent: Json | null
          id: string
          last_error: string | null
          payload: Json
          response_body: string | null
          response_code: number | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          destination_id?: string | null
          destination_url: string
          event_type: string
          execution_time_ms?: number | null
          headers_sent?: Json | null
          id?: string
          last_error?: string | null
          payload: Json
          response_body?: string | null
          response_code?: number | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          destination_id?: string | null
          destination_url?: string
          event_type?: string
          execution_time_ms?: number | null
          headers_sent?: Json | null
          id?: string
          last_error?: string | null
          payload?: Json
          response_body?: string | null
          response_code?: number | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_queue_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "webhook_destinations"
            referencedColumns: ["id"]
          },
        ]
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
      whatsapp_evolution_logs: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          evolution_response: Json | null
          id: string
          media_type: string | null
          media_url: string | null
          message_content: string | null
          message_type: string
          phone: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          evolution_response?: Json | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_content?: string | null
          message_type: string
          phone: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          evolution_response?: Json | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_content?: string | null
          message_type?: string
          phone?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_evolution_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      whatsapp_message_templates: {
        Row: {
          ai_prompt: string | null
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          media_url: string | null
          name: string
          schedule_days: number[] | null
          schedule_time: string | null
          template_key: string
          updated_at: string | null
          use_ai_enhancement: boolean | null
          variables: Json | null
        }
        Insert: {
          ai_prompt?: string | null
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          name: string
          schedule_days?: number[] | null
          schedule_time?: string | null
          template_key: string
          updated_at?: string | null
          use_ai_enhancement?: boolean | null
          variables?: Json | null
        }
        Update: {
          ai_prompt?: string | null
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_url?: string | null
          name?: string
          schedule_days?: number[] | null
          schedule_time?: string | null
          template_key?: string
          updated_at?: string | null
          use_ai_enhancement?: boolean | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      whatsapp_pending_medical: {
        Row: {
          analysis_result: Json | null
          confirmed: boolean | null
          created_at: string | null
          doctor_name: string | null
          exam_date: string | null
          exam_type: string | null
          expires_at: string | null
          id: string
          image_base64: string | null
          image_url: string | null
          image_urls: Json
          images_count: number
          is_processed: boolean
          last_image_at: string | null
          medical_document_id: string | null
          phone: string
          public_link_token: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          waiting_confirmation: boolean
        }
        Insert: {
          analysis_result?: Json | null
          confirmed?: boolean | null
          created_at?: string | null
          doctor_name?: string | null
          exam_date?: string | null
          exam_type?: string | null
          expires_at?: string | null
          id?: string
          image_base64?: string | null
          image_url?: string | null
          image_urls?: Json
          images_count?: number
          is_processed?: boolean
          last_image_at?: string | null
          medical_document_id?: string | null
          phone: string
          public_link_token?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          waiting_confirmation?: boolean
        }
        Update: {
          analysis_result?: Json | null
          confirmed?: boolean | null
          created_at?: string | null
          doctor_name?: string | null
          exam_date?: string | null
          exam_type?: string | null
          expires_at?: string | null
          id?: string
          image_base64?: string | null
          image_url?: string | null
          image_urls?: Json
          images_count?: number
          is_processed?: boolean
          last_image_at?: string | null
          medical_document_id?: string | null
          phone?: string
          public_link_token?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          waiting_confirmation?: boolean
        }
        Relationships: []
      }
      whatsapp_pending_nutrition: {
        Row: {
          analysis_result: Json | null
          confirmed: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_processed: boolean | null
          meal_type: string
          nutrition_tracking_id: string | null
          phone: string | null
          question_sent_at: string
          response_content: string | null
          response_received_at: string | null
          response_type: string | null
          user_id: string
          waiting_confirmation: boolean | null
          waiting_edit: boolean | null
        }
        Insert: {
          analysis_result?: Json | null
          confirmed?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_processed?: boolean | null
          meal_type: string
          nutrition_tracking_id?: string | null
          phone?: string | null
          question_sent_at?: string
          response_content?: string | null
          response_received_at?: string | null
          response_type?: string | null
          user_id: string
          waiting_confirmation?: boolean | null
          waiting_edit?: boolean | null
        }
        Update: {
          analysis_result?: Json | null
          confirmed?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_processed?: boolean | null
          meal_type?: string
          nutrition_tracking_id?: string | null
          phone?: string | null
          question_sent_at?: string
          response_content?: string | null
          response_received_at?: string | null
          response_type?: string | null
          user_id?: string
          waiting_confirmation?: boolean | null
          waiting_edit?: boolean | null
        }
        Relationships: []
      }
      whatsapp_provider_config: {
        Row: {
          active_provider: string
          evolution_api_url: string | null
          evolution_enabled: boolean | null
          evolution_failure_count_24h: number | null
          evolution_health_status: string | null
          evolution_instance: string | null
          evolution_last_health_check: string | null
          evolution_last_message_at: string | null
          evolution_success_count_24h: number | null
          id: string
          updated_at: string | null
          updated_by: string | null
          whapi_api_url: string | null
          whapi_enabled: boolean | null
          whapi_failure_count_24h: number | null
          whapi_health_status: string | null
          whapi_last_health_check: string | null
          whapi_last_message_at: string | null
          whapi_success_count_24h: number | null
        }
        Insert: {
          active_provider: string
          evolution_api_url?: string | null
          evolution_enabled?: boolean | null
          evolution_failure_count_24h?: number | null
          evolution_health_status?: string | null
          evolution_instance?: string | null
          evolution_last_health_check?: string | null
          evolution_last_message_at?: string | null
          evolution_success_count_24h?: number | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
          whapi_api_url?: string | null
          whapi_enabled?: boolean | null
          whapi_failure_count_24h?: number | null
          whapi_health_status?: string | null
          whapi_last_health_check?: string | null
          whapi_last_message_at?: string | null
          whapi_success_count_24h?: number | null
        }
        Update: {
          active_provider?: string
          evolution_api_url?: string | null
          evolution_enabled?: boolean | null
          evolution_failure_count_24h?: number | null
          evolution_health_status?: string | null
          evolution_instance?: string | null
          evolution_last_health_check?: string | null
          evolution_last_message_at?: string | null
          evolution_success_count_24h?: number | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
          whapi_api_url?: string | null
          whapi_enabled?: boolean | null
          whapi_failure_count_24h?: number | null
          whapi_health_status?: string | null
          whapi_last_health_check?: string | null
          whapi_last_message_at?: string | null
          whapi_success_count_24h?: number | null
        }
        Relationships: []
      }
      whatsapp_rate_limit_tracking: {
        Row: {
          id: string
          last_message_at: string | null
          messages_last_hour: number | null
          messages_last_minute: number | null
          messages_today: number | null
          phone: string
          tracking_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_message_at?: string | null
          messages_last_hour?: number | null
          messages_last_minute?: number | null
          messages_today?: number | null
          phone: string
          tracking_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_message_at?: string | null
          messages_last_hour?: number | null
          messages_last_minute?: number | null
          messages_today?: number | null
          phone?: string
          tracking_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_webhook_responses: {
        Row: {
          action_error: string | null
          action_result: Json | null
          action_triggered: string | null
          button_id: string | null
          button_title: string | null
          id: string
          is_processed: boolean | null
          list_row_id: string | null
          list_row_title: string | null
          original_message_id: string | null
          phone: string
          processed_at: string | null
          provider: string
          raw_payload: Json | null
          received_at: string | null
          response_type: string
          user_id: string | null
        }
        Insert: {
          action_error?: string | null
          action_result?: Json | null
          action_triggered?: string | null
          button_id?: string | null
          button_title?: string | null
          id?: string
          is_processed?: boolean | null
          list_row_id?: string | null
          list_row_title?: string | null
          original_message_id?: string | null
          phone: string
          processed_at?: string | null
          provider: string
          raw_payload?: Json | null
          received_at?: string | null
          response_type: string
          user_id?: string | null
        }
        Update: {
          action_error?: string | null
          action_result?: Json | null
          action_triggered?: string | null
          button_id?: string | null
          button_title?: string | null
          id?: string
          is_processed?: boolean | null
          list_row_id?: string | null
          list_row_title?: string | null
          original_message_id?: string | null
          phone?: string
          processed_at?: string | null
          provider?: string
          raw_payload?: Json | null
          received_at?: string | null
          response_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ai_usage_daily_stats: {
        Row: {
          avg_response_time: number | null
          date: string | null
          method: string | null
          provider: string | null
          success_rate: number | null
          total_calls: number | null
          total_cost: number | null
          total_tokens: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_exercise_challenge: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      assign_session_to_all_users: {
        Args: { session_id_param: string }
        Returns: boolean
      }
      assign_session_to_users: {
        Args: { session_id_param: string; user_ids_param: string[] }
        Returns: boolean
      }
      auto_save_session_progress: {
        Args: { p_progress_data: Json; p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      calculate_combo_multiplier: {
        Args: { consecutive_days: number }
        Returns: number
      }
      calculate_level: { Args: { xp: number }; Returns: number }
      calculate_xp_to_next_level: {
        Args: { current_level: number }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests?: number
          p_user_id: string
          p_window_hours?: number
        }
        Returns: Json
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_old_analysis_cache: { Args: never; Returns: number }
      cleanup_old_chat_history: { Args: never; Returns: undefined }
      complete_exercise_challenge: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      complete_job: {
        Args: { p_job_id: string; p_result: Json }
        Returns: boolean
      }
      complete_session_cycle: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: Json
      }
      consolidate_daily_health_snapshot: {
        Args: { p_date?: string; p_user_id: string }
        Returns: string
      }
      enqueue_job: {
        Args: { p_job_id: string; p_priority?: number; p_scheduled_at?: string }
        Returns: string
      }
      fail_job: {
        Args: {
          p_error_message: string
          p_job_id: string
          p_should_retry?: boolean
        }
        Returns: boolean
      }
      finalize_duel: { Args: { p_duel_id: string }; Returns: Json }
      finalize_team_battle: { Args: { p_battle_id: string }; Returns: Json }
      find_and_sync_orphan_user_by_phone: {
        Args: { p_phone: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
      get_active_whatsapp_provider: { Args: never; Returns: string }
      get_ai_usage_summary: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_response_time: number
          provider: string
          success_rate: number
          total_calls: number
          total_cost: number
          yolo_savings: number
        }[]
      }
      get_next_job: {
        Args: { p_lock_duration?: unknown; p_worker_id: string }
        Returns: {
          attempts: number
          input_data: Json
          job_id: string
          job_type: string
          priority: number
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_role_text: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      increment_report_download: {
        Args: { p_report_id: string }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      process_league_promotions: { Args: never; Returns: undefined }
      process_level_up: {
        Args: { p_user_id: string; p_xp_gained: number }
        Returns: {
          leveled_up: boolean
          new_level: number
          new_title: string
          new_xp: number
        }[]
      }
      recalculate_user_streak: { Args: { p_user_id: string }; Returns: number }
      record_whatsapp_message_sent: {
        Args: {
          p_phone: string
          p_provider: string
          p_success: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      reset_whatsapp_daily_counters: { Args: never; Returns: undefined }
      start_exercise_challenge: {
        Args: { p_challenge_id: string }
        Returns: Json
      }
      sync_all_user_streaks: { Args: never; Returns: undefined }
      toggle_whatsapp_provider: {
        Args: { new_provider: string }
        Returns: Json
      }
      unlock_available_sessions: { Args: never; Returns: number }
      update_challenge_progress: {
        Args: { p_challenge_id: string; p_progress: number }
        Returns: Json
      }
      update_league_weekly_xp: {
        Args: { p_user_id: string; p_xp_amount: number }
        Returns: undefined
      }
      update_team_battle_progress: {
        Args: {
          p_battle_id: string
          p_progress_increment: number
          p_team_id: string
        }
        Returns: undefined
      }
      update_whatsapp_provider_health: {
        Args: {
          p_failure_count?: number
          p_provider: string
          p_status: string
          p_success_count?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      challenge_mode:
        | "individual"
        | "flash"
        | "journey"
        | "team"
        | "duel"
        | "event"
      duel_status: "pending" | "active" | "completed" | "cancelled" | "expired"
      league_tier: "bronze" | "silver" | "gold" | "diamond" | "master"
      powerup_type:
        | "shield"
        | "time_extend"
        | "xp_boost"
        | "skip_day"
        | "combo_freeze"
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
      challenge_mode: [
        "individual",
        "flash",
        "journey",
        "team",
        "duel",
        "event",
      ],
      duel_status: ["pending", "active", "completed", "cancelled", "expired"],
      league_tier: ["bronze", "silver", "gold", "diamond", "master"],
      powerup_type: [
        "shield",
        "time_extend",
        "xp_boost",
        "skip_day",
        "combo_freeze",
      ],
    },
  },
} as const

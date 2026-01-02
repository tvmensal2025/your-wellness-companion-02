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
      challenges: {
        Row: {
          badge_reward: string | null
          challenge_type: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          requirements: Json | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_reward?: string | null
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          requirements?: Json | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_reward?: string | null
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          requirements?: Json | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
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
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
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
      goal_updates: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          notes: string | null
          update_type: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          update_type?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
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
          created_at: string | null
          data_type: string | null
          end_time: string | null
          id: string
          raw_data: Json | null
          source: string | null
          start_time: string | null
          unit: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          data_type?: string | null
          end_time?: string | null
          id?: string
          raw_data?: Json | null
          source?: string | null
          start_time?: string | null
          unit?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          data_type?: string | null
          end_time?: string | null
          id?: string
          raw_data?: Json | null
          source?: string | null
          start_time?: string | null
          unit?: string | null
          user_id?: string | null
          value?: number | null
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
          images_processed: number | null
          images_total: number | null
          processing_stage: string | null
          progress_pct: number | null
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
          images_processed?: number | null
          images_total?: number | null
          processing_stage?: string | null
          progress_pct?: number | null
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
          images_processed?: number | null
          images_total?: number | null
          processing_stage?: string | null
          progress_pct?: number | null
          results?: Json | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          full_name: string | null
          gender: string | null
          google_fit_enabled: boolean | null
          height: number | null
          id: string
          phone: string | null
          provider: string | null
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
          full_name?: string | null
          gender?: string | null
          google_fit_enabled?: boolean | null
          height?: number | null
          id?: string
          phone?: string | null
          provider?: string | null
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
          full_name?: string | null
          gender?: string | null
          google_fit_enabled?: boolean | null
          height?: number | null
          id?: string
          phone?: string | null
          provider?: string | null
          state?: string | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
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
          chronic_diseases: string | null
          created_at: string | null
          current_medications: string | null
          daily_stress_level: string | null
          digestive_issues: string | null
          eating_habits: string | null
          family_history: string | null
          food_allergies: string | null
          food_intolerances: string | null
          forbidden_foods: string | null
          health_goals: string | null
          herbal_medicines: string | null
          id: string
          main_treatment_goals: string | null
          physical_activity: string | null
          physical_activity_frequency: string | null
          previous_weight_treatments: string | null
          problematic_foods: string | null
          sleep_quality: string | null
          sleep_quality_score: number | null
          smoking: string | null
          stress_level: string | null
          supplements: string | null
          updated_at: string | null
          user_id: string | null
          water_intake: string | null
        }
        Insert: {
          additional_notes?: string | null
          alcohol_consumption?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          daily_stress_level?: string | null
          digestive_issues?: string | null
          eating_habits?: string | null
          family_history?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          forbidden_foods?: string | null
          health_goals?: string | null
          herbal_medicines?: string | null
          id?: string
          main_treatment_goals?: string | null
          physical_activity?: string | null
          physical_activity_frequency?: string | null
          previous_weight_treatments?: string | null
          problematic_foods?: string | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          smoking?: string | null
          stress_level?: string | null
          supplements?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: string | null
        }
        Update: {
          additional_notes?: string | null
          alcohol_consumption?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          daily_stress_level?: string | null
          digestive_issues?: string | null
          eating_habits?: string | null
          family_history?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          forbidden_foods?: string | null
          health_goals?: string | null
          herbal_medicines?: string | null
          id?: string
          main_treatment_goals?: string | null
          physical_activity?: string | null
          physical_activity_frequency?: string | null
          previous_weight_treatments?: string | null
          problematic_foods?: string | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          smoking?: string | null
          stress_level?: string | null
          supplements?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: string | null
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
      user_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          data_fim: string | null
          data_inicio: string | null
          description: string | null
          estimated_points: number | null
          goal_type: string | null
          gordura_corporal_meta_percent: number | null
          id: string
          imc_meta: number | null
          peso_meta_kg: number | null
          status: string | null
          target_value: number | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          estimated_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          peso_meta_kg?: number | null
          status?: string | null
          target_value?: number | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          estimated_points?: number | null
          goal_type?: string | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          peso_meta_kg?: number | null
          status?: string | null
          target_value?: number | null
          title?: string | null
          user_id?: string | null
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
          measurement_date: string | null
          metabolismo_basal_kcal: number | null
          notes: string | null
          osso_kg: number | null
          peso_kg: number
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
          measurement_date?: string | null
          metabolismo_basal_kcal?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg: number
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
          measurement_date?: string | null
          metabolismo_basal_kcal?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg?: number
          risco_metabolico?: string | null
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

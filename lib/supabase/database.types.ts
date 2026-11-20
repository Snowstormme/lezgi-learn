export type ContentStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived';

export type UserRole = 'learner' | 'reviewer' | 'admin';

export type ExerciseType = 'multiple_choice' | 'matching' | 'word_input';

export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export type InterfaceLocale = 'ru' | 'lez' | 'az';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: UserRole;
          interface_locale: InterfaceLocale;
          xp: number;
          streak_days: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: UserRole;
          interface_locale?: InterfaceLocale;
          xp?: number;
          streak_days?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          role?: UserRole;
          interface_locale?: InterfaceLocale;
          xp?: number;
          streak_days?: number;
          last_active_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      words: {
        Row: {
          id: string;
          slug: string;
          lemma_lez: string;
          translation_ru: string;
          translation_az: string | null;
          transcription_ru: string | null;
          part_of_speech: string | null;
          grammar_notes_ru: string | null;
          audio_path: string | null;
          audio_status: ContentStatus;
          status: ContentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          lemma_lez: string;
          translation_ru: string;
          translation_az?: string | null;
          transcription_ru?: string | null;
          part_of_speech?: string | null;
          grammar_notes_ru?: string | null;
          audio_path?: string | null;
          audio_status?: ContentStatus;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          lemma_lez?: string;
          translation_ru?: string;
          translation_az?: string | null;
          transcription_ru?: string | null;
          part_of_speech?: string | null;
          grammar_notes_ru?: string | null;
          audio_path?: string | null;
          audio_status?: ContentStatus;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      word_examples: {
        Row: {
          id: string;
          slug: string;
          word_id: string;
          sentence_lez: string;
          translation_ru: string;
          audio_path: string | null;
          status: ContentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          word_id: string;
          sentence_lez: string;
          translation_ru: string;
          audio_path?: string | null;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          word_id?: string;
          sentence_lez?: string;
          translation_ru?: string;
          audio_path?: string | null;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          slug: string;
          order_index: number;
          title_ru: string;
          description_ru: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          order_index: number;
          title_ru: string;
          description_ru?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          order_index?: number;
          title_ru?: string;
          description_ru?: string | null;
          status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          slug: string;
          unit_id: string;
          order_index: number;
          title_ru: string;
          grammar_tip_ru: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          unit_id: string;
          order_index: number;
          title_ru: string;
          grammar_tip_ru?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          unit_id?: string;
          order_index?: number;
          title_ru?: string;
          grammar_tip_ru?: string | null;
          status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          slug: string;
          lesson_id: string;
          order_index: number;
          type: ExerciseType;
          word_id: string | null;
          prompt_ru: string;
          payload: Json;
          status: ContentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          lesson_id: string;
          order_index: number;
          type: ExerciseType;
          word_id?: string | null;
          prompt_ru: string;
          payload: Json;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          lesson_id?: string;
          order_index?: number;
          type?: ExerciseType;
          word_id?: string | null;
          prompt_ru?: string;
          payload?: Json;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: 'in_progress' | 'completed';
          score: number | null;
          attempts_count: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status: 'in_progress' | 'completed';
          score?: number | null;
          attempts_count?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'in_progress' | 'completed';
          score?: number | null;
          attempts_count?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          entity_type: 'word' | 'word_example' | 'exercise' | 'lesson';
          entity_id: string;
          comment: string;
          report_status: ReportStatus;
          resolved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          entity_type: 'word' | 'word_example' | 'exercise' | 'lesson';
          entity_id: string;
          comment: string;
          report_status?: ReportStatus;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          comment?: string;
          report_status?: ReportStatus;
          resolved_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_word_cards: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          state: number;
          due: string;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          reps: number;
          lapses: number;
          last_review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: string;
          state?: number;
          due?: string;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          reps?: number;
          lapses?: number;
          last_review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          state?: number;
          due?: string;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          reps?: number;
          lapses?: number;
          last_review?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      verified_phrases: {
        Row: {
          id: string;
          slug: string;
          category: string;
          source_ru: string;
          target_lez: string;
          normalized_ru: string;
          transcription_ru: string | null;
          context_note_ru: string | null;
          audio_path: string | null;
          audio_status: ContentStatus;
          status: ContentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category?: string;
          source_ru: string;
          target_lez: string;
          normalized_ru: string;
          transcription_ru?: string | null;
          context_note_ru?: string | null;
          audio_path?: string | null;
          audio_status?: ContentStatus;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          category?: string;
          source_ru?: string;
          target_lez?: string;
          normalized_ru?: string;
          transcription_ru?: string | null;
          context_note_ru?: string | null;
          audio_path?: string | null;
          audio_status?: ContentStatus;
          status?: ContentStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      translation_requests: {
        Row: {
          id: string;
          user_id: string | null;
          direction: 'ru_to_lez' | 'lez_to_ru';
          query_text: string;
          matched_phrase_id: string | null;
          llm_draft_output: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          direction: 'ru_to_lez' | 'lez_to_ru';
          query_text: string;
          matched_phrase_id?: string | null;
          llm_draft_output?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          matched_phrase_id?: string | null;
          llm_draft_output?: string | null;
          is_verified?: boolean;
        };
        Relationships: [];
      };
      content_suggestions: {
        Row: {
          id: string;
          request_id: string | null;
          suggested_by: string;
          source_ru: string;
          suggested_lez: string;
          comment: string | null;
          status: ContentStatus;
          reviewer_id: string | null;
          review_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          suggested_by: string;
          source_ru: string;
          suggested_lez: string;
          comment?: string | null;
          status?: ContentStatus;
          reviewer_id?: string | null;
          review_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          source_ru?: string;
          suggested_lez?: string;
          comment?: string | null;
          status?: ContentStatus;
          reviewer_id?: string | null;
          review_comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_reviewer_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      content_status: ContentStatus;
      user_role: UserRole;
      exercise_type: ExerciseType;
      report_status: ReportStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

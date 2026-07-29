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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          canonical_url: string
          category: string
          content: string
          created_at: string
          created_by: string | null
          excerpt: string
          featured_image: string
          gallery: Json
          id: string
          og_image: string
          publish_date: string | null
          seo_description: string
          seo_title: string
          slug: string
          status: string
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          canonical_url?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured_image?: string
          gallery?: Json
          id?: string
          og_image?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          slug: string
          status?: string
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          canonical_url?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured_image?: string
          gallery?: Json
          id?: string
          og_image?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          slug?: string
          status?: string
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          alt_text: string
          category: string
          created_at: string
          created_by: string | null
          description: string
          featured: boolean
          id: string
          media_type: string
          media_url: string
          publish_date: string | null
          seo_description: string
          seo_title: string
          sort_order: number
          status: string
          thumbnail: string
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          featured?: boolean
          id?: string
          media_type?: string
          media_url?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          sort_order?: number
          status?: string
          thumbnail?: string
          title?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          featured?: boolean
          id?: string
          media_type?: string
          media_url?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          sort_order?: number
          status?: string
          thumbnail?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          notes: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"]
          source_page: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string | null
          updated_at: string
          user_agent: string | null
          website_template: string | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
          website_template?: string | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
          website_template?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          canonical_url: string
          category: string
          client: string
          completion_date: string | null
          cover_image: string
          created_at: string
          created_by: string | null
          featured: boolean
          full_description: string
          gallery: Json
          id: string
          og_image: string
          publish_date: string | null
          seo_description: string
          seo_title: string
          short_description: string
          slug: string
          status: string
          technologies: Json
          title: string
          updated_at: string
          website_url: string
        }
        Insert: {
          canonical_url?: string
          category?: string
          client?: string
          completion_date?: string | null
          cover_image?: string
          created_at?: string
          created_by?: string | null
          featured?: boolean
          full_description?: string
          gallery?: Json
          id?: string
          og_image?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          short_description?: string
          slug: string
          status?: string
          technologies?: Json
          title: string
          updated_at?: string
          website_url?: string
        }
        Update: {
          canonical_url?: string
          category?: string
          client?: string
          completion_date?: string | null
          cover_image?: string
          created_at?: string
          created_by?: string | null
          featured?: boolean
          full_description?: string
          gallery?: Json
          id?: string
          og_image?: string
          publish_date?: string | null
          seo_description?: string
          seo_title?: string
          short_description?: string
          slug?: string
          status?: string
          technologies?: Json
          title?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          draft: Json
          id: number
          published: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          draft?: Json
          id?: number
          published?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          draft?: Json
          id?: number
          published?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          client_photo: string
          company: string
          company_logo: string
          created_at: string
          created_by: string | null
          designation: string
          featured: boolean
          id: string
          location: string
          publish_date: string | null
          rating: number
          seo_description: string
          seo_title: string
          sort_order: number
          status: string
          testimonial: string
          updated_at: string
        }
        Insert: {
          client_name?: string
          client_photo?: string
          company?: string
          company_logo?: string
          created_at?: string
          created_by?: string | null
          designation?: string
          featured?: boolean
          id?: string
          location?: string
          publish_date?: string | null
          rating?: number
          seo_description?: string
          seo_title?: string
          sort_order?: number
          status?: string
          testimonial?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_photo?: string
          company?: string
          company_logo?: string
          created_at?: string
          created_by?: string | null
          designation?: string
          featured?: boolean
          id?: string
          location?: string
          publish_date?: string | null
          rating?: number
          seo_description?: string
          seo_title?: string
          sort_order?: number
          status?: string
          testimonial?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      lead_priority: "low" | "medium" | "high"
      lead_status: "new" | "contacted" | "in_progress" | "closed" | "spam"
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
      app_role: ["admin", "editor"],
      lead_priority: ["low", "medium", "high"],
      lead_status: ["new", "contacted", "in_progress", "closed", "spam"],
    },
  },
} as const

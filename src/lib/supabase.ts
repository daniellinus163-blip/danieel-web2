import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'member' | 'admin' | 'super_admin'
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'member' | 'admin' | 'super_admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'member' | 'admin' | 'super_admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      image_policies: {
        Row: {
          id: string
          allow_upload: boolean
          allow_retrieval: boolean
          allow_deletion: boolean
          updated_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          allow_upload?: boolean
          allow_retrieval?: boolean
          allow_deletion?: boolean
          updated_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          allow_upload?: boolean
          allow_retrieval?: boolean
          allow_deletion?: boolean
          updated_by?: string
          updated_at?: string
        }
      }
      role_audit_logs: {
        Row: {
          id: string
          actor_id: string
          target_user_id: string
          old_role: string | null
          new_role: string | null
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          actor_id: string
          target_user_id: string
          old_role?: string | null
          new_role?: string | null
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string
          target_user_id?: string
          old_role?: string | null
          new_role?: string | null
          action?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          sale_price: number | null
          category_id: string | null
          collection_id: string | null
          is_active: boolean
          is_featured: boolean
          sku: string | null
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          sale_price?: number | null
          category_id?: string | null
          collection_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          sku?: string | null
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          sale_price?: number | null
          category_id?: string | null
          collection_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          sku?: string | null
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          size: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          size?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          total_amount: number
          status: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          delivery_address: string
          city: string
          state: string | null
          country: string
          postal_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          total_amount: number
          status?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          delivery_address: string
          city: string
          state?: string | null
          country: string
          postal_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          total_amount?: number
          status?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          delivery_address?: string
          city?: string
          state?: string | null
          country?: string
          postal_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

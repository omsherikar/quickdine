export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          price: number
          category: string
          image_url: string | null
          available: boolean
          restaurant_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          price: number
          category: string
          image_url?: string | null
          available?: boolean
          restaurant_id: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string | null
          available?: boolean
          restaurant_id?: string
        }
      }
      orders: {
        Row: {
          id: number
          created_at: string
          status: 'pending' | 'preparing' | 'ready' | 'delivered'
          total: number
          restaurant_id: string
          customer_id: string | null
          table_number: number
        }
        Insert: {
          id?: number
          created_at?: string
          status?: 'pending' | 'preparing' | 'ready' | 'delivered'
          total: number
          restaurant_id: string
          customer_id?: string | null
          table_number: number
        }
        Update: {
          id?: number
          created_at?: string
          status?: 'pending' | 'preparing' | 'ready' | 'delivered'
          total?: number
          restaurant_id?: string
          customer_id?: string | null
          table_number?: number
        }
      }
      order_items: {
        Row: {
          id: number
          created_at: string
          order_id: number
          menu_item_id: number
          quantity: number
          notes: string | null
          price: number
        }
        Insert: {
          id?: number
          created_at?: string
          order_id: number
          menu_item_id: number
          quantity: number
          notes?: string | null
          price: number
        }
        Update: {
          id?: number
          created_at?: string
          order_id?: number
          menu_item_id?: number
          quantity?: number
          notes?: string | null
          price?: number
        }
      }
      restaurants: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          logo_url: string | null
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          logo_url?: string | null
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          owner_id?: string
        }
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
  }
} 
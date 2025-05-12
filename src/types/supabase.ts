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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          status: 'active' | 'suspended' | 'deleted'
          subscription_status: 'free' | 'premium' | 'expired'
          subscription_start: string | null
          subscription_end: string | null
          card_last4: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          status?: 'active' | 'suspended' | 'deleted'
          subscription_status?: 'free' | 'premium' | 'expired'
          subscription_start?: string | null
          subscription_end?: string | null
          card_last4?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          status?: 'active' | 'suspended' | 'deleted'
          subscription_status?: 'free' | 'premium' | 'expired'
          subscription_start?: string | null
          subscription_end?: string | null
          card_last4?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      letters: {
        Row: {
          id: string
          user_id: string
          title: string | null
          message: string
          media_url: string | null
          scheduled_date: string
          sent_date: string | null
          status: 'pending' | 'sent' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          message: string
          media_url?: string | null
          scheduled_date: string
          sent_date?: string | null
          status?: 'pending' | 'sent' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          message?: string
          media_url?: string | null
          scheduled_date?: string
          sent_date?: string | null
          status?: 'pending' | 'sent' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
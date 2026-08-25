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
      orders: {
        Row: {
          id: string;
          order_code: string;
          customer_name: string;
          customer_phone: string;
          source: Database["public"]["Enums"]["order_source"];
          status: Database["public"]["Enums"]["order_status"];
          tracking_number: string | null;
          shipping_provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_code: string;
          customer_name: string;
          customer_phone: string;
          source?: Database["public"]["Enums"]["order_source"];
          status?: Database["public"]["Enums"]["order_status"];
          tracking_number?: string | null;
          shipping_provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          customer_name?: string;
          customer_phone?: string;
          source?: Database["public"]["Enums"]["order_source"];
          status?: Database["public"]["Enums"]["order_status"];
          tracking_number?: string | null;
          shipping_provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          variant: string | null;
          size: string | null;
          quantity: number;
          unit_price: number | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name: string;
          variant?: string | null;
          size?: string | null;
          quantity: number;
          unit_price?: number | null;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_name?: string;
          variant?: string | null;
          size?: string | null;
          quantity?: number;
          unit_price?: number | null;
          currency?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_source: "google_form" | "line" | "manual";
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatusHistoryRow =
  Database["public"]["Tables"]["order_status_history"]["Row"];

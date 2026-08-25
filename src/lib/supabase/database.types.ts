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
          customer_name_normalized: string;
          customer_phone: string;
          customer_phone_digits: string;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
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
          customer_name_normalized?: never;
          customer_phone: string;
          customer_phone_digits?: never;
          delivery_method?: Database["public"]["Enums"]["delivery_method"];
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
          customer_name_normalized?: never;
          customer_phone?: string;
          customer_phone_digits?: never;
          delivery_method?: Database["public"]["Enums"]["delivery_method"];
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
          jersey_color: Database["public"]["Enums"]["jersey_color"] | null;
          jersey_size: Database["public"]["Enums"]["jersey_size"] | null;
          order_id: string;
          print_name: string | null;
          product_name: string;
          variant: string | null;
          size: string | null;
          shirt_number: string | null;
          quantity: number;
          unit_price: number | null;
          university_abbreviation: string | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          jersey_color?: Database["public"]["Enums"]["jersey_color"] | null;
          jersey_size?: Database["public"]["Enums"]["jersey_size"] | null;
          order_id: string;
          print_name?: string | null;
          product_name: string;
          variant?: string | null;
          size?: string | null;
          shirt_number?: string | null;
          quantity: number;
          unit_price?: number | null;
          university_abbreviation?: string | null;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          jersey_color?: Database["public"]["Enums"]["jersey_color"] | null;
          jersey_size?: Database["public"]["Enums"]["jersey_size"] | null;
          order_id?: string;
          print_name?: string | null;
          product_name?: string;
          variant?: string | null;
          size?: string | null;
          shirt_number?: string | null;
          quantity?: number;
          unit_price?: number | null;
          university_abbreviation?: string | null;
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
      delivery_method: "pickup" | "shipping";
      jersey_color:
        | "CANDY PINK"
        | "IGNITE RED"
        | "COPPER ROSE"
        | "SHADOW BLACK"
        | "SONIC BLUE"
        | "AURA GREEN";
      jersey_size:
        | "XS"
        | "S"
        | "M"
        | "L"
        | "XL"
        | "2XL"
        | "3XL"
        | "4XL"
        | "5XL";
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

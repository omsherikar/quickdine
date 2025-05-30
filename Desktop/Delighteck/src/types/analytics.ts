export interface Restaurant {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

export interface AnalyticsStats {
  restaurant: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface Order {
  id: string;
  total: number;
  customer_id: string | null;
  restaurant_id: string;
  status: string;
  created_at: string;
} 
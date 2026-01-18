export interface Asset {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  contributed: number;
  target_date: string | null;
  description: string | null;
}

export interface AssetCreate {
  name: string;
  amount: number;
  contributed?: number;
  target_date?: string;
  description?: string;
}

export interface AssetUpdate {
  name?: string;
  amount?: number;
  contributed?: number;
  target_date?: string;
  description?: string;
}

export interface WishListItem {
  id: number;
  name: string;
  amount: number;
  contributed: number;
}

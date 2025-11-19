// src/admin/types.ts

export type Store = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  status?: string;
};

export type User = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
};

export type Voucher = {
  _id?: string;
  code: string;
  description?: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  total_quantity: number;
  per_user_limit: number;
  status: string;
  start_date?: string;
  end_date?: string;
  store_id?: string;
};

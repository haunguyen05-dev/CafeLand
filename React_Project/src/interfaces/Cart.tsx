export interface CartItem {
  product_id: string;  
  quantity: number;
  total_price: number;
}

export interface Cart {
  cart_id?: string;     
  user_id: string;      
  items: CartItem[];    
  created_at: Date;    
}
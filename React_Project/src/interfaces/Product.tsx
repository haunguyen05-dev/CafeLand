export interface Product {
  _id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  status: string;
  created_at: string;
  images: Image[];
}

export interface Image {
  image_url: string;     
  is_primary: boolean;   
  created_at: string;    
}
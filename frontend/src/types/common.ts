export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  phone: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface CartItem {
  product_id: number;
  variant_id: number | null;
  quantity: number;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
}

export interface Cart {
  items: CartItem[];
  item_count: number;
  subtotal: number;
}

export interface ImageRef {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface CategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  is_featured: boolean;
  stock_quantity: number;
  category: CategoryRef | null;
  primary_image: ImageRef | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
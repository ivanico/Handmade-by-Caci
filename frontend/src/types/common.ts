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
  name_mk?: string | null;
  slug: string;
  description: string | null;
  description_mk?: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface CartItem {
  product_id: number;
  variant_id: number | null;
  quantity: number;
  name: string;
  price: number;
  available_quantity: number;
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
  thumbnail_url?: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface CategoryRef {
  id: number;
  name: string;
  name_mk?: string | null;
  slug: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  name_mk?: string | null;
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

export interface ProductVariant {
  id: number;
  name: string | null;
  value: string | null;
  price_modifier: string;
  stock_quantity: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  name_mk?: string | null;
  slug: string;
  description: string | null;
  description_mk?: string | null;
  price: string;
  compare_at_price: string | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category: CategoryRef | null;
  primary_image: ImageRef | null;
  images: ImageRef[];
  variants: ProductVariant[];
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  status: string;
  payment_status: string;
  notes: string | null;
  total_amount: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
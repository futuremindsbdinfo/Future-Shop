/**
 * Shared API/domain types for Future Shop.
 *
 * Note: Laravel's `decimal:2` cast serializes money as STRINGS (e.g. "10000.00"),
 * so monetary fields are typed as `string`. The cart computes with numbers.
 */

export type UserRole = 'customer' | 'vendor' | 'admin' | 'delivery';
export type VendorStatus = 'pending' | 'approved' | 'suspended';
export type ProductStatus = 'draft' | 'published' | 'out_of_stock';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CategoryPhase = 'mvp' | 'phase2' | 'phase3' | 'phase4' | 'phase5';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  division: string | null;
  district: string | null;
  delivery_charge: string;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Vendor {
  id: number;
  user_id: number;
  shop_name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  phone: string | null;
  address: string | null;
  division: string | null;
  district: string | null;
  delivery_zone_id: number | null;
  commission_rate: string;
  status: VendorStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  deliveryZone?: DeliveryZone;
  products?: Product[];
  // Earnings summary (admin list)
  products_count?: number;
  gross_sales?: number;
  total_commission?: number;
  net_earnings?: number;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  phase: CategoryPhase;
  image: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

export interface ProductImage {
  path: string;
  url: string;
  disk: string;
}

export interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  sale_price: string | null;
  sku: string | null;
  stock_quantity: number;
  images: ProductImage[] | null;
  weight: string | null;
  is_featured: boolean;
  status: ProductStatus;
  views: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  vendor?: Pick<Vendor, 'id' | 'shop_name' | 'slug'>;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  vendor_id: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  commission: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddressSnapshot {
  name: string;
  phone: string;
  address: string;
  division: string | null;
  district: string | null;
  zone?: string;
  snapshot_at?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  delivery_zone_id: number | null;
  promo_code_id: number | null;
  subtotal: string;
  delivery_charge: string;
  discount: string;
  total: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_division: string | null;
  shipping_district: string | null;
  delivery_address: DeliveryAddressSnapshot | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  deliveryZone?: DeliveryZone;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export type TransactionType = 'payment' | 'refund' | 'payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: number;
  order_id: number;
  vendor_id: number | null;
  reference: string;
  payment_method: PaymentMethod;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  gateway_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Client-side cart line (mirrors the server cart; prices are numbers here). */
export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
}

/** Admin dashboard summary. */
export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  active_vendors: number;
  pending_orders: number;
  recent_orders: Order[];
}

/** Wrapper used by single-resource endpoints: { data: T, message?: string }. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Laravel length-aware paginator shape. */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

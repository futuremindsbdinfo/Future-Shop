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
  areas: string | null;
  delivery_charge: string;
  free_delivery_threshold: string | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  image_path: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  division: string | null;
  district: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  site_name: string | null;
  site_tagline: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
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
  cost_price: string | null;
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
  delivery_user_id: number | null;
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
  deliveryUser?: Pick<User, 'id' | 'name'> | null;
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

/** A row in `dashboard.product_profits`. */
export interface ProductProfitRow {
  id: number;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

/** Low-stock product summary returned by the dashboard. */
export interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  stock_quantity: number;
  category_id: number;
  category?: { id: number; name: string; slug: string } | null;
}

/** Today's orders block returned by the dashboard. */
export interface TodayOrders {
  count: number;
  total: number;
  list: Order[];
}

/** Row in the admin users list (User + orders_count). */
export interface AdminUserRow extends User {
  orders_count?: number;
}

/** Row in the admin customers list (User + aggregates). */
export interface AdminCustomerRow extends User {
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string | null;
}

/** Customer detail (from GET /admin/customers/{id}). */
export interface CustomerDetail {
  user: User;
  stats: {
    total_orders: number;
    total_spent: number;
    last_order_date: string | null;
  };
  orders: Order[];
}

/** Sales report payload. */
export interface SalesReport {
  from: string;
  to: string;
  summary: {
    total_revenue: number;
    total_orders: number;
    total_cost: number;
    gross_profit: number;
    profit_margin: number;
    avg_order_value: number;
  };
  daily_breakdown: { date: string; revenue: number; orders: number; cost: number; profit: number }[];
  payment_breakdown: { cod: number; sslcommerz: number };
  status_breakdown: Record<string, number>;
}

export interface ProductsReportRow {
  product_name: string;
  units_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface VendorsReportRow {
  vendor_name: string;
  orders_count: number;
  revenue: number;
  commission_earned: number;
  products_count: number;
}

/** Invoice list row. */
export interface InvoiceRow {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  date: string;
  items_count: number;
  subtotal: string;
  delivery_charge: string;
  discount: string;
  total: string;
  payment_status: string;
  payment_method: string;
}

/** Full invoice detail. */
export interface InvoiceDetail {
  invoice_number: string;
  date: string;
  payment_status: string;
  payment_method: string;
  order_status: string;
  customer: { name: string; phone: string | null; email: string | null };
  delivery_address: {
    name: string;
    phone: string;
    address: string;
    division: string | null;
    district: string | null;
    zone: string | null;
  };
  items: { product_name: string; quantity: number; price: string; subtotal: string }[];
  totals: {
    subtotal: string;
    delivery_charge: string;
    discount: string;
    total: string;
  };
  company: { name: string; phone: string | null; email: string | null; address: string | null };
}

/** Analytics payload. */
export interface AnalyticsData {
  days: number;
  sales_by_day: { date: string; revenue: number; orders: number }[];
  orders_by_status: Record<string, number>;
  top_categories: { name: string; sales: number; count: number }[];
  revenue_total: number;
  orders_total: number;
  avg_order_value: number;
  conversion_rate: number;
  new_customers_count: number;
  revenue_growth: number;
}

/** Admin dashboard summary. */
export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  total_customers: number;
  total_products: number;
  active_vendors: number;
  pending_orders: number;
  recent_orders: Order[];
  product_profits: ProductProfitRow[];
  low_stock_products: LowStockProduct[];
  today_orders: TodayOrders;
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

export type Role = 'owner' | 'cashier' | 'superadmin';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThermalPaperSize = '58mm' | '68mm' | '80mm';
export type DiscountType = 'percent' | 'amount';
export type WorkStatus = 'baru' | 'terlambat' | 'harus_selesai' | 'ready_for_pickup' | 'completed';
export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface ProspectLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  created_at: string;
  status: 'new' | 'contacted' | 'converted';
}

export interface Tenant {
  id: string;
  business_name: string;
  logo_url?: string;
  address: string;
  phone_number: string;
  terms_and_conditions: string;
  thermal_paper_size: ThermalPaperSize;
  theme_preference: ThemeMode;
  created_at: string;
  trial_ends_at: string;
  subscription_status: SubscriptionStatus;
  reminder_rules: {
    dormant_days: number;
    lost_days: number;
    stagnant_service_days: number;
  };
}

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  role: Role;
  pin_code: string;
  is_active: boolean;
  clock_in?: string;
  clock_out?: string;
  clock_in_date?: string;
  clock_in_location?: string;
}

export interface ProductService {
  id: string;
  tenant_id: string;
  name: string;
  type: 'product' | 'service';
  cost_price: number; // HPP / Modal
  sell_price: number; // Harga Jual
  duration_minutes?: number;
  raw_material_cost?: number;
  stock: number;
  is_dead_stock: boolean;
  last_sold_at?: string;
}

export interface OperationalExpense {
  id: string;
  tenant_id: string;
  title: string;
  category: 'fixed' | 'variable';
  amount: number;
  expense_date: string;
  notes?: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  last_order_at: string;
  churn_status: 'active' | 'at_risk_45' | 'lost_90';
}

export interface TransactionItem {
  id: string;
  item_id: string;
  name: string;
  type: 'product' | 'service';
  cost_price: number;
  unit_price: number;
  quantity: number;
  gross_margin: number;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  cashier_id: string;
  cashier_name: string;
  photo_url?: string; // Foto produk/pengerjaan kamera & galeri
  work_status: WorkStatus; // 'baru' | 'terlambat' | 'harus_selesai' | 'ready_for_pickup' | 'completed'
  item_notes?: string;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
  payment_method: 'cash' | 'transfer' | 'qris';
  payment_stage: 'dp' | 'full';
  items: TransactionItem[];
  crm_attributed_log_id?: string;
  created_at: string;
}

export interface CrmLog {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  cashier_name: string;
  type: 'retention_45' | 'retention_90';
  message_content: string;
  sent_at: string;
  is_converted: boolean;
  converted_transaction_id?: string;
  converted_amount?: number;
  converted_at?: string;
}

export interface PromoInstruction {
  id: string;
  tenant_id: string;
  product_id: string;
  product_name: string;
  stock: number;
  promo_message: string;
  created_at: string;
  status: 'active' | 'completed';
}


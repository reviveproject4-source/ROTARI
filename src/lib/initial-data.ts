import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

const nowIso = new Date().toISOString();
const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();

// 1. TENANT DEMO UTAMA (tenant-001) - Persistent untuk Testing, Uji Coba & Presentasi
export const initialTenant: Tenant = {
  id: "tenant-001",
  business_name: "ROTARI Shoe & Leather Care",
  logo_url: "/logo.png",
  address: "Jl. Pemuda No. 88, Sepatan, Tangerang, Banten 15520",
  phone_number: "0812-3456-7890",
  terms_and_conditions: "1. Garansi pengerjaan ulang 3 hari setelah pengambilan.\n2. Barang yang tidak diambil dalam 30 hari di luar tanggung jawab toko.\n3. Pengambilan wajib menyertakan nota resmi.",
  thermal_paper_size: "68mm",
  theme_preference: "light",
  created_at: nowIso,
  trial_ends_at: trialExpiryIso,
  subscription_status: "trial",
  reminder_rules: {
    dormant_days: 45,
    lost_days: 90,
    stagnant_service_days: 14,
  },
};

// 2. KREDENSIAL SUPER ADMIN TERISOLASI
export const SUPER_ADMIN_USER: User = {
  id: "user-super-admin",
  tenant_id: "platform-rotari",
  name: "Super Admin ROTARI",
  email: "superadmin@rotari.id",
  role: "superadmin",
  pin_code: "999999",
  is_active: true,
};

// 3. DAFTAR USER DEMO UTAMA
export const initialUsers: User[] = [
  {
    id: "user-owner",
    tenant_id: "tenant-001",
    name: "Budi Owner",
    email: "owner@rotari.id",
    role: "owner",
    pin_code: "123456",
    is_active: true,
  },
  {
    id: "user-cashier-1",
    tenant_id: "tenant-001",
    name: "Siti Kasir",
    email: "siti@rotari.id",
    role: "cashier",
    pin_code: "1122",
    is_active: true,
  },
  {
    id: "user-cashier-2",
    tenant_id: "tenant-001",
    name: "Agus Kasir",
    email: "agus@rotari.id",
    role: "cashier",
    pin_code: "3344",
    is_active: true,
  }
];

// 4. DATA KATALOG KATALOG DEMO (tenant-001)
export const initialProductsServices: ProductService[] = [
  {
    id: "ps-1",
    tenant_id: "tenant-001",
    name: "Deep Cleaning Canvas/Sneaker",
    type: "service",
    cost_price: 10000,
    sell_price: 45000,
    duration_minutes: 180,
    raw_material_cost: 3000,
    stock: 0,
    is_dead_stock: false,
  },
  {
    id: "ps-2",
    tenant_id: "tenant-001",
    name: "Leather Treatment & Recolor",
    type: "service",
    cost_price: 25000,
    sell_price: 120000,
    duration_minutes: 1440,
    raw_material_cost: 15000,
    stock: 0,
    is_dead_stock: false,
  },
  {
    id: "ps-3",
    tenant_id: "tenant-001",
    name: "Pembersih Sepatu Waterless Spray 250ml",
    type: "product",
    cost_price: 20000,
    sell_price: 40000,
    stock: 20,
    is_dead_stock: false,
  }
];

// 5. DATA PELANGGAN DEMO (tenant-001)
export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    tenant_id: "tenant-001",
    name: "Andi Pratama",
    phone: "081298765432",
    last_order_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    churn_status: "active",
  },
  {
    id: "cust-2",
    tenant_id: "tenant-001",
    name: "Budi Santoso",
    phone: "085612345678",
    last_order_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    churn_status: "active",
  }
];

// 6. DATA TRANSAKSI DEMO (tenant-001)
export const initialTransactions: Transaction[] = [
  {
    id: "tx-1001",
    tenant_id: "tenant-001",
    invoice_number: "INV/2026/001",
    customer_id: "cust-1",
    customer_name: "Andi Pratama",
    customer_phone: "081298765432",
    cashier_id: "user-cashier-1",
    cashier_name: "Siti Kasir",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "paid",
    work_status: "completed",
    subtotal: 90000,
    discount_type: "amount",
    discount_value: 0,
    discount_amount: 0,
    total_amount: 90000,
    paid_amount: 90000,
    payment_method: "cash",
    payment_stage: "full",
    items: [
      {
        id: "item-1",
        item_id: "ps-1",
        name: "Deep Cleaning Canvas/Sneaker",
        type: "service",
        quantity: 2,
        cost_price: 10000,
        unit_price: 45000,
        gross_margin: 70000,
      }
    ]
  },
  {
    id: "tx-1002",
    tenant_id: "tenant-001",
    invoice_number: "INV/2026/002",
    customer_id: "cust-2",
    customer_name: "Budi Santoso",
    customer_phone: "085612345678",
    cashier_id: "user-cashier-2",
    cashier_name: "Agus Kasir",
    created_at: new Date().toISOString(),
    status: "partially_paid",
    work_status: "baru",
    subtotal: 120000,
    discount_type: "amount",
    discount_value: 0,
    discount_amount: 0,
    total_amount: 120000,
    paid_amount: 50000,
    payment_method: "transfer",
    payment_stage: "dp",
    items: [
      {
        id: "item-2",
        item_id: "ps-2",
        name: "Leather Treatment & Recolor",
        type: "service",
        quantity: 1,
        cost_price: 25000,
        unit_price: 120000,
        gross_margin: 95000,
      }
    ]
  }
];

// 7. DATA BIAYA OPERASIONAL DEMO (tenant-001)
export const initialExpenses: OperationalExpense[] = [
  {
    id: "exp-1",
    tenant_id: "tenant-001",
    title: "Pembelian Cairan Sabun Cleaner Sepatu",
    amount: 150000,
    category: "variable",
    expense_date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    notes: "Pembersih 5 Liter Premium"
  }
];

// 8. DATA CRM LOGS DEMO (tenant-001)
export const initialCrmLogs: CrmLog[] = [
  {
    id: "crm-1",
    tenant_id: "tenant-001",
    customer_id: "cust-1",
    customer_name: "Andi Pratama",
    customer_phone: "081298765432",
    cashier_name: "Siti Kasir",
    type: "retention_45",
    message_content: "Halo Kak Andi, sepatu Anda sudah selesai dikerjakan!",
    sent_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    is_converted: true,
    converted_amount: 90000
  }
];

// 9. DATA PROMO INSTRUCTIONS DEMO (tenant-001)
export const initialPromoInstructions: PromoInstruction[] = [
  {
    id: "promo-1",
    tenant_id: "tenant-001",
    product_id: "ps-3",
    product_name: "Pembersih Sepatu Waterless Spray 250ml",
    stock: 20,
    promo_message: "Halo Kak, dapatkan diskon 15% untuk treatment leather sepatu Anda pekan ini di ROTARI!",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "active"
  }
];

// 10. DATA PROSPEK DEMO REGISTRATION LEADS
export const initialProspectLeads: ProspectLead[] = [
  {
    id: "lead-1",
    name: "Hendrik Wijaya",
    email: "hendrik@sneakercare.com",
    phone: "628123456789",
    business_name: "Sneaker Care Pro",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "new",
  }
];

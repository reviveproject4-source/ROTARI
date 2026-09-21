import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

const nowIso = new Date().toISOString();
const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();

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

export const initialProspectLeads: ProspectLead[] = [
  {
    id: "lead-1",
    name: "Hendrik Wijaya",
    email: "hendrik@sneakercare.com",
    phone: "628123456789",
    business_name: "Sneaker Care Pro",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "new",
  },
  {
    id: "lead-2",
    name: "Sinta Permata",
    email: "sinta@leatherlab.id",
    phone: "628569876543",
    business_name: "Leather Lab Jakarta",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "contacted",
  }
];

const todayDateFormatted = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const initialUsers: User[] = [
  {
    id: "user-owner",
    tenant_id: "tenant-001",
    name: "Budi Owner",
    email: "budi@rotari.id",
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

export const initialExpenses: OperationalExpense[] = [];

export const initialCustomers: Customer[] = [];

export const initialTransactions: Transaction[] = [];

export const initialCrmLogs: CrmLog[] = [];

export const initialPromoInstructions: PromoInstruction[] = [];



import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

const nowIso = new Date().toISOString();
const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();

export const initialTenant: Tenant = {
  id: "tenant-001",
  business_name: "Outlet Utama ROTARI",
  logo_url: "/logo.png",
  address: "Jl. Pemuda No. 88, Sepatan, Tangerang, Banten 15520",
  phone_number: "081234567890",
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

export const initialProspectLeads: ProspectLead[] = [];

export const initialUsers: User[] = [
  {
    id: "user-owner",
    tenant_id: "tenant-001",
    name: "Owner ROTARI",
    email: "owner@rotari.id",
    role: "owner",
    pin_code: "123456",
    is_active: true,
  },
  {
    id: "user-super-admin",
    tenant_id: "platform-rotari",
    name: "Super Admin ROTARI",
    email: "superadmin@rotari.id",
    role: "owner",
    pin_code: "999999",
    is_active: true,
  }
];

export const initialProductsServices: ProductService[] = [];

export const initialExpenses: OperationalExpense[] = [];

export const initialCustomers: Customer[] = [];

export const initialTransactions: Transaction[] = [];

export const initialCrmLogs: CrmLog[] = [];

export const initialPromoInstructions: PromoInstruction[] = [];

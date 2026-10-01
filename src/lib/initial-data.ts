import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

const nowIso = new Date().toISOString();
const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();

const daysAgo = (days: number, hour = 10) => {
  const d = new Date(Date.now() - days * 86400000);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

const dateAgo = (days: number) => daysAgo(days).split("T")[0];

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
  reminder_rules: { dormant_days: 45, lost_days: 90, stagnant_service_days: 14 },
};

export const SUPER_ADMIN_USER: User = {
  id: "user-super-admin",
  tenant_id: "platform-rotari",
  name: "Super Admin ROTARI",
  email: "superadmin@rotari.id",
  role: "superadmin",
  pin_code: "999999",
  is_active: true,
};

export const initialUsers: User[] = [
  { id: "user-owner", tenant_id: "tenant-001", name: "Budi Owner", email: "owner@rotari.id", role: "owner", pin_code: "123456", is_active: true },
  { id: "user-cashier-1", tenant_id: "tenant-001", name: "Siti Kasir", email: "siti@rotari.id", role: "cashier", pin_code: "1122", is_active: true },
  { id: "user-cashier-2", tenant_id: "tenant-001", name: "Agus Kasir", email: "agus@rotari.id", role: "cashier", pin_code: "3344", is_active: true },
];

export const initialProductsServices: ProductService[] = [
  { id: "ps-1", tenant_id: "tenant-001", name: "Deep Cleaning Premium", type: "service", cost_price: 65000, sell_price: 275000, duration_minutes: 180, raw_material_cost: 42000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(0) },
  { id: "ps-2", tenant_id: "tenant-001", name: "Leather Treatment & Recolor", type: "service", cost_price: 260000, sell_price: 1250000, duration_minutes: 1440, raw_material_cost: 175000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(1) },
  { id: "ps-3", tenant_id: "tenant-001", name: "Suede Restoration", type: "service", cost_price: 235000, sell_price: 1100000, duration_minutes: 1440, raw_material_cost: 155000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(2) },
  { id: "ps-4", tenant_id: "tenant-001", name: "Midsole Repaint", type: "service", cost_price: 185000, sell_price: 875000, duration_minutes: 720, raw_material_cost: 120000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(3) },
  { id: "ps-5", tenant_id: "tenant-001", name: "Waterproof Protection", type: "service", cost_price: 55000, sell_price: 225000, duration_minutes: 90, raw_material_cost: 35000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(4) },
  { id: "ps-6", tenant_id: "tenant-001", name: "Premium Sneaker Cleaner 250ml", type: "product", cost_price: 42000, sell_price: 85000, stock: 126, is_dead_stock: false, last_sold_at: daysAgo(1) },
  { id: "ps-7", tenant_id: "tenant-001", name: "Suede & Nubuck Brush", type: "product", cost_price: 35000, sell_price: 75000, stock: 74, is_dead_stock: false, last_sold_at: daysAgo(4) },
  { id: "ps-8", tenant_id: "tenant-001", name: "Leather Conditioner 100ml", type: "product", cost_price: 52000, sell_price: 110000, stock: 46, is_dead_stock: false, last_sold_at: daysAgo(9) },
  { id: "ps-9", tenant_id: "tenant-001", name: "Premium Sneaker Box", type: "product", cost_price: 28000, sell_price: 65000, stock: 38, is_dead_stock: false, last_sold_at: daysAgo(15) },
  { id: "ps-10", tenant_id: "tenant-001", name: "Old Cleaning Kit", type: "product", cost_price: 20000, sell_price: 40000, stock: 9, is_dead_stock: true, last_sold_at: daysAgo(72) },
  { id: "ps-11", tenant_id: "tenant-001", name: "Full Sneaker Restoration", type: "service", cost_price: 420000, sell_price: 1950000, duration_minutes: 2880, raw_material_cost: 285000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(1) },
  { id: "ps-12", tenant_id: "tenant-001", name: "Premium Aftercare Package", type: "service", cost_price: 95000, sell_price: 375000, duration_minutes: 150, raw_material_cost: 62000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(0) },
  { id: "ps-13", tenant_id: "tenant-001", name: "Shoe Whitening Express", type: "service", cost_price: 60000, sell_price: 275000, duration_minutes: 150, raw_material_cost: 38000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(31) },
  { id: "ps-14", tenant_id: "tenant-001", name: "Premium Bag Restoration", type: "service", cost_price: 520000, sell_price: 2450000, duration_minutes: 4320, raw_material_cost: 350000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(2) },
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", tenant_id: "tenant-001", name: "Andi Pratama", phone: "081298765432", email: "andi.pratama@example.com", address: "BSD City, Tangerang Selatan", total_orders: 13, total_spent: 13325000, last_order_at: daysAgo(0), churn_status: "active" },
  { id: "cust-2", tenant_id: "tenant-001", name: "Budi Santoso", phone: "085612345678", email: "budi.santoso@example.com", address: "Cikokol, Tangerang", total_orders: 13, total_spent: 23525000, last_order_at: daysAgo(1), churn_status: "active" },
  { id: "cust-3", tenant_id: "tenant-001", name: "Rina Maharani", phone: "081390112233", email: "rina.maharani@example.com", address: "Alam Sutera, Tangerang Selatan", total_orders: 13, total_spent: 12600000, last_order_at: daysAgo(2), churn_status: "active" },
  { id: "cust-4", tenant_id: "tenant-001", name: "Dimas Saputra", phone: "082112223333", email: "dimas.saputra@example.com", address: "Karawaci, Tangerang", total_orders: 13, total_spent: 23650000, last_order_at: daysAgo(3), churn_status: "active" },
  { id: "cust-5", tenant_id: "tenant-001", name: "Nadia Putri", phone: "081277889900", email: "nadia.putri@example.com", address: "Gading Serpong, Tangerang", total_orders: 12, total_spent: 12300000, last_order_at: daysAgo(4), churn_status: "active" },
  { id: "cust-6", tenant_id: "tenant-001", name: "Fajar Ramadhan", phone: "085700112233", email: "fajar.ramadhan@example.com", address: "Cipondoh, Tangerang", total_orders: 12, total_spent: 21850000, last_order_at: daysAgo(5), churn_status: "active" },
  { id: "cust-7", tenant_id: "tenant-001", name: "Kevin Wijaya", phone: "081188776655", email: "kevin.wijaya@example.com", address: "Modernland, Tangerang", total_orders: 12, total_spent: 11650000, last_order_at: daysAgo(6), churn_status: "active" },
  { id: "cust-8", tenant_id: "tenant-001", name: "Salsa Amelia", phone: "082233445566", email: "salsa.amelia@example.com", address: "Lippo Village, Tangerang", total_orders: 12, total_spent: 21850000, last_order_at: daysAgo(7), churn_status: "active" },
  { id: "cust-9", tenant_id: "tenant-001", name: "Yoga Kurniawan", phone: "081355667788", email: "yoga.kurniawan@example.com", address: "Pamulang, Tangerang Selatan", total_orders: 8, total_spent: 5200000, last_order_at: daysAgo(47), churn_status: "at_risk_45" },
  { id: "cust-10", tenant_id: "tenant-001", name: "Maya Lestari", phone: "089612345678", email: "maya.lestari@example.com", address: "Bintaro, Tangerang Selatan", total_orders: 5, total_spent: 3100000, last_order_at: daysAgo(96), churn_status: "lost_90" },
];

const tx = (
  id: string,
  invoice: string,
  customer_id: string,
  customer_name: string,
  customer_phone: string,
  cashier_id: string,
  cashier_name: string,
  days: number,
  status: Transaction["status"],
  work_status: Transaction["work_status"],
  subtotal: number,
  discount_amount: number,
  total_amount: number,
  paid_amount: number,
  payment_method: Transaction["payment_method"],
  payment_stage: Transaction["payment_stage"],
  items: Transaction["items"]
): Transaction => ({
  id, tenant_id: "tenant-001", invoice_number: invoice, customer_id, customer_name, customer_phone,
  cashier_id, cashier_name, created_at: daysAgo(days), status, work_status, subtotal,
  discount_type: discount_amount > 0 ? "amount" : "amount", discount_value: discount_amount,
  discount_amount, total_amount, paid_amount, payment_method, payment_stage, items,
});

const premiumTransactionSpecs = Array.from({ length: 100 }, (_, index) => {
  const amountBases = [1450000, 1050000, 950000, 750000, 250000, 180000, 325000, 1800000, 2200000, 1150000];
  const addOns = [0, 75000, 125000, 180000, 250000, 325000];
  const amount = amountBases[(index * 5 + 2) % amountBases.length] + addOns[index % addOns.length];
  const days = Math.floor(index * 30 / 100);
  const customerIndex = index % 8;
  const customers = [
    ["cust-1","Andi Pratama","081298765432"],["cust-2","Budi Santoso","085612345678"],
    ["cust-3","Rina Maharani","081390112233"],["cust-4","Dimas Saputra","082112223333"],
    ["cust-5","Nadia Putri","081277889900"],["cust-6","Fajar Ramadhan","085700112233"],
    ["cust-7","Kevin Wijaya","081188776655"],["cust-8","Salsa Amelia","082233445566"]
  ] as const;
  const services = [
    ["ps-11","Restoration Service Package"],["ps-2","Leather Treatment & Recolor"],
    ["ps-3","Suede Restoration"],["ps-4","Midsole Repaint"],["ps-1","Deep Cleaning Premium"],
    ["ps-5","Waterproof Protection"],["ps-12","Premium Aftercare Add-on"],
    ["ps-14","Premium Bag Restoration"],["ps-13","Shoe Whitening Express"],["ps-11","Restoration Service Package"]
  ] as const;
  return [amount, days, customers[customerIndex][0], customers[customerIndex][1], customers[customerIndex][2], index % 2 === 0 ? "user-cashier-1" : "user-cashier-2", index % 2 === 0 ? "Siti Kasir" : "Agus Kasir", services[index % services.length][0], services[index % services.length][1]] as const;
});

const demoPaymentMethods = ["qris", "transfer", "cash"] as const;
const demoWorkStatuses = ["completed", "completed", "ready_for_pickup"] as const;

export const initialTransactions: Transaction[] = premiumTransactionSpecs.map(([amount, days, customer_id, customer_name, customer_phone, cashier_id, cashier_name, service_id, service_name], index) => {
  const serviceAmount = amount;
  const materialCostRate = service_id === "ps-14" ? 0.22 : service_id === "ps-13" ? 0.20 : 0.21;
  const serviceCost = Math.round(amount * materialCostRate / 5000) * 5000;
  const addOn = index % 4 === 0 ? 75000 : index % 7 === 0 ? 125000 : 0;
  const totalAmount = amount + addOn;
  const addOnCost = addOn > 0 ? 25000 : 0;
  return tx(
    `tx-${3001 + index}`, `INV/2026/${String(100 - index).padStart(3, "0")}`, customer_id, customer_name, customer_phone,
    cashier_id, cashier_name, days, "paid", demoWorkStatuses[index % demoWorkStatuses.length],
    totalAmount, 0, totalAmount, totalAmount, demoPaymentMethods[index % demoPaymentMethods.length], "full",
    [
      { id:`item-${3001 + index}a`, item_id:service_id, name:service_name, type:"service", quantity:1, cost_price:serviceCost, unit_price:serviceAmount, gross_margin:serviceAmount - serviceCost },
      ...(addOn > 0 ? [{ id:`item-${3001 + index}b`, item_id:"ps-12", name:"Premium Aftercare Add-on", type:"service" as const, quantity:1, cost_price:addOnCost, unit_price:addOn, gross_margin:addOn - addOnCost }] : [])
    ]
  );
});

export const initialExpenses: OperationalExpense[] = [
  { id:"exp-1", tenant_id:"tenant-001", title:"Sewa outlet & area kerja", amount:12850000, category:"fixed", expense_date:dateAgo(3), notes:"Sewa outlet utama dan area kerja produksi" },
  { id:"exp-2", tenant_id:"tenant-001", title:"Listrik, air & internet", amount:4857500, category:"fixed", expense_date:dateAgo(7), notes:"Utilitas operasional bulan berjalan" },
  { id:"exp-3", tenant_id:"tenant-001", title:"Bahan cleaning & chemical", amount:7245000, category:"variable", expense_date:dateAgo(6), notes:"Restock bahan cleaning, treatment dan finishing" },
  { id:"exp-4", tenant_id:"tenant-001", title:"Packaging & pickup support", amount:3125000, category:"variable", expense_date:dateAgo(10), notes:"Packaging, label dan kebutuhan pickup" },
  { id:"exp-5", tenant_id:"tenant-001", title:"Marketing, CRM & customer retention", amount:4275000, category:"variable", expense_date:dateAgo(14), notes:"Campaign, follow-up CRM dan materi promosi" },
  { id:"exp-6", tenant_id:"tenant-001", title:"Maintenance alat & area produksi", amount:2850000, category:"variable", expense_date:dateAgo(18), notes:"Perawatan mesin, tools dan area produksi" },
  { id:"exp-7", tenant_id:"tenant-001", title:"Gaji & insentif 16 staf operasional", amount:49800000, category:"fixed", expense_date:dateAgo(2), notes:"Payroll tim produksi, kasir/CS, admin, supervisor dan insentif kinerja" },
];

const crmCustomerPool = [
  ["cust-1","Andi Pratama","081298765432"],["cust-2","Budi Santoso","085612345678"],["cust-3","Rina Maharani","081390112233"],
  ["cust-4","Dimas Saputra","082112223333"],["cust-5","Nadia Putri","081277889900"],["cust-6","Fajar Ramadhan","085700112233"],
  ["cust-7","Kevin Wijaya","081188776655"],["cust-8","Salsa Amelia","082233445566"],["cust-9","Yoga Kurniawan","081355667788"],["cust-10","Maya Lestari","089612345678"]
] as const;

const crmConversions = [0, 1, 3, 5, 7, 12, 18, 24];
export const initialCrmLogs: CrmLog[] = Array.from({ length: 60 }, (_, index) => {
  const [customer_id, customer_name, customer_phone] = crmCustomerPool[index % crmCustomerPool.length];
  const convertedIndex = crmConversions[index % crmConversions.length];
  const is_converted = index < crmConversions.length;
  const transaction = is_converted ? initialTransactions[convertedIndex] : undefined;
  return {
    id:`crm-${index + 1}`, tenant_id:"tenant-001", customer_id, customer_name, customer_phone,
    cashier_name:index % 2 === 0 ? "Siti Kasir" : "Agus Kasir",
    type:index % 6 === 0 ? "retention_90" : "retention_45",
    message_content:is_converted
      ? "Halo Kak, kami melihat sudah waktunya melakukan treatment berikutnya. Kalau berkenan, kami bisa bantu pilihkan layanan yang sesuai."
      : "Halo Kak, kami ingin follow up kondisi sepatu Kakak. Kalau membutuhkan treatment atau maintenance, kami siap membantu.",
    sent_at:daysAgo((index * 2) % 28, 9 + (index % 5)),
    is_converted,
    ...(transaction ? { converted_transaction_id:transaction.id, converted_amount:transaction.total_amount, converted_at:daysAgo((index * 2) % 28, 12) } : {})
  };
});

export const initialPromoInstructions: PromoInstruction[] = [
  { id:"promo-1", tenant_id:"tenant-001", product_id:"ps-6", product_name:"Premium Sneaker Cleaner 250ml", stock:28, promo_message:"Promo 15% untuk paket cleaner + deep cleaning. Cocok untuk pelanggan yang ingin maintenance rutin.", created_at:daysAgo(2,9), status:"active" },
  { id:"promo-2", tenant_id:"tenant-001", product_id:"ps-7", product_name:"Suede & Nubuck Brush", stock:17, promo_message:"Bundle brush dengan suede restoration untuk meningkatkan after-care pelanggan.", created_at:daysAgo(6,9), status:"active" },
  { id:"promo-3", tenant_id:"tenant-001", product_id:"ps-9", product_name:"Premium Sneaker Box", stock:6, promo_message:"Gunakan sneaker box sebagai add-on saat customer mengambil layanan repaint atau restoration.", created_at:daysAgo(24,9), status:"active" },
  { id:"promo-4", tenant_id:"tenant-001", product_id:"ps-10", product_name:"Old Cleaning Kit", stock:3, promo_message:"Clearance 25% untuk stok lama sebelum menjadi dead stock.", created_at:daysAgo(40,9), status:"active" },
];

export const initialProspectLeads: ProspectLead[] = [
  { id:"lead-1", name:"Hendrik Wijaya", email:"hendrik@sneakercare.example", phone:"628123456789", business_name:"Sneaker Care Pro", created_at:daysAgo(1,9), status:"new" },
  { id:"lead-2", name:"Maya Kusuma", email:"maya@cleansteps.example", phone:"628138889900", business_name:"Clean Steps Studio", created_at:daysAgo(4,11), status:"contacted" },
  { id:"lead-3", name:"Rizky Adi", email:"rizky@leatherworks.example", phone:"628129991122", business_name:"Leather Works Tangerang", created_at:daysAgo(9,14), status:"converted" },
];

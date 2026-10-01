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
  { id: "ps-1", tenant_id: "tenant-001", name: "Deep Cleaning Premium", type: "service", cost_price: 18000, sell_price: 65000, duration_minutes: 180, raw_material_cost: 7000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(1) },
  { id: "ps-2", tenant_id: "tenant-001", name: "Leather Treatment & Recolor", type: "service", cost_price: 35000, sell_price: 175000, duration_minutes: 1440, raw_material_cost: 22000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(3) },
  { id: "ps-3", tenant_id: "tenant-001", name: "Suede Restoration", type: "service", cost_price: 30000, sell_price: 150000, duration_minutes: 1440, raw_material_cost: 18000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(5) },
  { id: "ps-4", tenant_id: "tenant-001", name: "Midsole Repaint", type: "service", cost_price: 25000, sell_price: 135000, duration_minutes: 720, raw_material_cost: 16000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(7) },
  { id: "ps-5", tenant_id: "tenant-001", name: "Waterproof Protection", type: "service", cost_price: 12000, sell_price: 55000, duration_minutes: 90, raw_material_cost: 6000, stock: 0, is_dead_stock: false, last_sold_at: daysAgo(9) },
  { id: "ps-6", tenant_id: "tenant-001", name: "Premium Sneaker Cleaner 250ml", type: "product", cost_price: 22000, sell_price: 45000, stock: 28, is_dead_stock: false, last_sold_at: daysAgo(2) },
  { id: "ps-7", tenant_id: "tenant-001", name: "Suede & Nubuck Brush", type: "product", cost_price: 18000, sell_price: 35000, stock: 17, is_dead_stock: false, last_sold_at: daysAgo(6) },
  { id: "ps-8", tenant_id: "tenant-001", name: "Leather Conditioner 100ml", type: "product", cost_price: 32000, sell_price: 65000, stock: 11, is_dead_stock: false, last_sold_at: daysAgo(12) },
  { id: "ps-9", tenant_id: "tenant-001", name: "Premium Sneaker Box", type: "product", cost_price: 15000, sell_price: 30000, stock: 6, is_dead_stock: false, last_sold_at: daysAgo(24) },
  { id: "ps-10", tenant_id: "tenant-001", name: "Old Cleaning Kit", type: "product", cost_price: 20000, sell_price: 40000, stock: 3, is_dead_stock: true, last_sold_at: daysAgo(72) },
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", tenant_id: "tenant-001", name: "Andi Pratama", phone: "081298765432", email: "andi.pratama@example.com", address: "BSD City, Tangerang Selatan", total_orders: 6, total_spent: 745000, last_order_at: daysAgo(2), churn_status: "active" },
  { id: "cust-2", tenant_id: "tenant-001", name: "Budi Santoso", phone: "085612345678", email: "budi.santoso@example.com", address: "Cikokol, Tangerang", total_orders: 4, total_spent: 520000, last_order_at: daysAgo(7), churn_status: "active" },
  { id: "cust-3", tenant_id: "tenant-001", name: "Rina Maharani", phone: "081390112233", email: "rina.maharani@example.com", address: "Alam Sutera, Tangerang Selatan", total_orders: 5, total_spent: 685000, last_order_at: daysAgo(13), churn_status: "active" },
  { id: "cust-4", tenant_id: "tenant-001", name: "Dimas Saputra", phone: "082112223333", email: "dimas.saputra@example.com", address: "Karawaci, Tangerang", total_orders: 3, total_spent: 390000, last_order_at: daysAgo(22), churn_status: "active" },
  { id: "cust-5", tenant_id: "tenant-001", name: "Nadia Putri", phone: "081277889900", email: "nadia.putri@example.com", address: "Gading Serpong, Tangerang", total_orders: 4, total_spent: 610000, last_order_at: daysAgo(38), churn_status: "active" },
  { id: "cust-6", tenant_id: "tenant-001", name: "Fajar Ramadhan", phone: "085700112233", email: "fajar.ramadhan@example.com", address: "Cipondoh, Tangerang", total_orders: 2, total_spent: 285000, last_order_at: daysAgo(52), churn_status: "at_risk_45" },
  { id: "cust-7", tenant_id: "tenant-001", name: "Kevin Wijaya", phone: "081188776655", email: "kevin.wijaya@example.com", address: "Modernland, Tangerang", total_orders: 2, total_spent: 230000, last_order_at: daysAgo(68), churn_status: "at_risk_45" },
  { id: "cust-8", tenant_id: "tenant-001", name: "Salsa Amelia", phone: "082233445566", email: "salsa.amelia@example.com", address: "Lippo Village, Tangerang", total_orders: 1, total_spent: 150000, last_order_at: daysAgo(101), churn_status: "lost_90" },
  { id: "cust-9", tenant_id: "tenant-001", name: "Yoga Kurniawan", phone: "081355667788", email: "yoga.kurniawan@example.com", address: "Pamulang, Tangerang Selatan", total_orders: 3, total_spent: 420000, last_order_at: daysAgo(4), churn_status: "active" },
  { id: "cust-10", tenant_id: "tenant-001", name: "Maya Lestari", phone: "089612345678", email: "maya.lestari@example.com", address: "Bintaro, Tangerang Selatan", total_orders: 3, total_spent: 455000, last_order_at: daysAgo(17), churn_status: "active" },
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

export const initialTransactions: Transaction[] = [
  tx("tx-2001","INV/2026/041","cust-1","Andi Pratama","081298765432","user-cashier-1","Siti Kasir",1,"paid","completed",110000,5000,105000,105000,"qris","full",[
    { id:"item-2001a", item_id:"ps-1", name:"Deep Cleaning Premium", type:"service", quantity:1, cost_price:18000, unit_price:65000, gross_margin:47000 },
    { id:"item-2001b", item_id:"ps-6", name:"Premium Sneaker Cleaner 250ml", type:"product", quantity:1, cost_price:22000, unit_price:45000, gross_margin:23000 },
  ]),
  tx("tx-2002","INV/2026/040","cust-3","Rina Maharani","081390112233","user-cashier-2","Agus Kasir",2,"paid","ready_for_pickup",175000,0,175000,175000,"transfer","full",[
    { id:"item-2002a", item_id:"ps-2", name:"Leather Treatment & Recolor", type:"service", quantity:1, cost_price:35000, unit_price:175000, gross_margin:140000 },
  ]),
  tx("tx-2003","INV/2026/039","cust-2","Budi Santoso","085612345678","user-cashier-1","Siti Kasir",4,"paid","completed",260000,26000,234000,234000,"qris","full",[
    { id:"item-2003a", item_id:"ps-3", name:"Suede Restoration", type:"service", quantity:1, cost_price:30000, unit_price:150000, gross_margin:120000 },
    { id:"item-2003b", item_id:"ps-7", name:"Suede & Nubuck Brush", type:"product", quantity:1, cost_price:18000, unit_price:35000, gross_margin:17000 },
    { id:"item-2003c", item_id:"ps-5", name:"Waterproof Protection", type:"service", quantity:1, cost_price:12000, unit_price:55000, gross_margin:43000 },
  ]),
  tx("tx-2004","INV/2026/038","cust-9","Yoga Kurniawan","081355667788","user-cashier-2","Agus Kasir",6,"partially_paid","baru",175000,0,175000,75000,"cash","dp",[
    { id:"item-2004a", item_id:"ps-2", name:"Leather Treatment & Recolor", type:"service", quantity:1, cost_price:35000, unit_price:175000, gross_margin:140000 },
  ]),
  tx("tx-2005","INV/2026/037","cust-4","Dimas Saputra","082112223333","user-cashier-1","Siti Kasir",9,"paid","completed",180000,0,180000,180000,"transfer","full",[
    { id:"item-2005a", item_id:"ps-4", name:"Midsole Repaint", type:"service", quantity:1, cost_price:25000, unit_price:135000, gross_margin:110000 },
    { id:"item-2005b", item_id:"ps-6", name:"Premium Sneaker Cleaner 250ml", type:"product", quantity:1, cost_price:22000, unit_price:45000, gross_margin:23000 },
  ]),
  tx("tx-2006","INV/2026/036","cust-5","Nadia Putri","081277889900","user-cashier-2","Agus Kasir",13,"paid","completed",120000,0,120000,120000,"cash","full",[
    { id:"item-2006a", item_id:"ps-1", name:"Deep Cleaning Premium", type:"service", quantity:1, cost_price:18000, unit_price:65000, gross_margin:47000 },
    { id:"item-2006b", item_id:"ps-5", name:"Waterproof Protection", type:"service", quantity:1, cost_price:12000, unit_price:55000, gross_margin:43000 },
  ]),
  tx("tx-2007","INV/2026/035","cust-1","Andi Pratama","081298765432","user-cashier-1","Siti Kasir",18,"paid","completed",175000,0,175000,175000,"transfer","full",[
    { id:"item-2007a", item_id:"ps-2", name:"Leather Treatment & Recolor", type:"service", quantity:1, cost_price:35000, unit_price:175000, gross_margin:140000 },
  ]),
  tx("tx-2008","INV/2026/034","cust-10","Maya Lestari","089612345678","user-cashier-2","Agus Kasir",22,"paid","completed",135000,0,135000,135000,"qris","full",[
    { id:"item-2008a", item_id:"ps-4", name:"Midsole Repaint", type:"service", quantity:1, cost_price:25000, unit_price:135000, gross_margin:110000 },
  ]),
  tx("tx-2009","INV/2026/033","cust-3","Rina Maharani","081390112233","user-cashier-1","Siti Kasir",28,"paid","completed",100000,5000,95000,95000,"cash","full",[
    { id:"item-2009a", item_id:"ps-1", name:"Deep Cleaning Premium", type:"service", quantity:1, cost_price:18000, unit_price:65000, gross_margin:47000 },
    { id:"item-2009b", item_id:"ps-7", name:"Suede & Nubuck Brush", type:"product", quantity:1, cost_price:18000, unit_price:35000, gross_margin:17000 },
  ]),
  tx("tx-2010","INV/2026/032","cust-5","Nadia Putri","081277889900","user-cashier-2","Agus Kasir",36,"paid","completed",150000,0,150000,150000,"transfer","full",[
    { id:"item-2010a", item_id:"ps-3", name:"Suede Restoration", type:"service", quantity:1, cost_price:30000, unit_price:150000, gross_margin:120000 },
  ]),
  tx("tx-2011","INV/2026/031","cust-6","Fajar Ramadhan","085700112233","user-cashier-1","Siti Kasir",52,"paid","completed",135000,0,135000,135000,"cash","full",[
    { id:"item-2011a", item_id:"ps-4", name:"Midsole Repaint", type:"service", quantity:1, cost_price:25000, unit_price:135000, gross_margin:110000 },
  ]),
  tx("tx-2012","INV/2026/030","cust-8","Salsa Amelia","082233445566","user-cashier-2","Agus Kasir",101,"paid","completed",150000,0,150000,150000,"transfer","full",[
    { id:"item-2012a", item_id:"ps-3", name:"Suede Restoration", type:"service", quantity:1, cost_price:30000, unit_price:150000, gross_margin:120000 },
  ]),
];

export const initialExpenses: OperationalExpense[] = [
  { id:"exp-1", tenant_id:"tenant-001", title:"Sewa outlet", amount:2500000, category:"fixed", expense_date:dateAgo(5), notes:"Biaya sewa bulanan outlet utama" },
  { id:"exp-2", tenant_id:"tenant-001", title:"Listrik & air", amount:780000, category:"fixed", expense_date:dateAgo(8), notes:"Tagihan operasional outlet" },
  { id:"exp-3", tenant_id:"tenant-001", title:"Cairan cleaner premium", amount:425000, category:"variable", expense_date:dateAgo(6), notes:"Restock bahan cleaning" },
  { id:"exp-4", tenant_id:"tenant-001", title:"Cat & pigment leather", amount:680000, category:"variable", expense_date:dateAgo(12), notes:"Bahan recolor dan repaint" },
  { id:"exp-5", tenant_id:"tenant-001", title:"Packaging & shoe box", amount:310000, category:"variable", expense_date:dateAgo(18), notes:"Packaging untuk order pelanggan" },
];

export const initialCrmLogs: CrmLog[] = [
  { id:"crm-1", tenant_id:"tenant-001", customer_id:"cust-1", customer_name:"Andi Pratama", customer_phone:"081298765432", cashier_name:"Siti Kasir", type:"retention_45", message_content:"Halo Kak Andi, sudah waktunya refresh sepatu favorit Kakak. Minggu ini ada slot treatment premium.", sent_at:daysAgo(1,9), is_converted:true, converted_transaction_id:"tx-2001", converted_amount:105000, converted_at:daysAgo(1,11) },
  { id:"crm-2", tenant_id:"tenant-001", customer_id:"cust-3", customer_name:"Rina Maharani", customer_phone:"081390112233", cashier_name:"Agus Kasir", type:"retention_45", message_content:"Halo Kak Rina, koleksi sepatu Kakak siap dirawat lagi? Kami punya promo waterproof protection minggu ini.", sent_at:daysAgo(2,9), is_converted:true, converted_transaction_id:"tx-2002", converted_amount:175000, converted_at:daysAgo(2,14) },
  { id:"crm-3", tenant_id:"tenant-001", customer_id:"cust-6", customer_name:"Fajar Ramadhan", customer_phone:"085700112233", cashier_name:"Siti Kasir", type:"retention_45", message_content:"Halo Kak Fajar, kami masih menyimpan riwayat treatment sepatu Kakak. Ada jadwal kosong minggu ini kalau mau repeat treatment.", sent_at:daysAgo(50,10), is_converted:false },
  { id:"crm-4", tenant_id:"tenant-001", customer_id:"cust-7", customer_name:"Kevin Wijaya", customer_phone:"081188776655", cashier_name:"Agus Kasir", type:"retention_45", message_content:"Halo Kak Kevin, sudah lama tidak treatment di ROTARI. Mau kami bantu pilih treatment yang sesuai kondisi sepatu?", sent_at:daysAgo(46,10), is_converted:false },
  { id:"crm-5", tenant_id:"tenant-001", customer_id:"cust-8", customer_name:"Salsa Amelia", customer_phone:"082233445566", cashier_name:"Siti Kasir", type:"retention_90", message_content:"Halo Kak Salsa, kami ingin menyapa kembali. Kalau sepatu favorit Kakak butuh perawatan, ROTARI siap membantu.", sent_at:daysAgo(4,10), is_converted:false },
  { id:"crm-6", tenant_id:"tenant-001", customer_id:"cust-2", customer_name:"Budi Santoso", customer_phone:"085612345678", cashier_name:"Siti Kasir", type:"retention_45", message_content:"Halo Kak Budi, terima kasih sudah kembali ke ROTARI. Kami punya rekomendasi treatment untuk koleksi leather Kakak.", sent_at:daysAgo(5,10), is_converted:true, converted_transaction_id:"tx-2003", converted_amount:234000, converted_at:daysAgo(4,10) },
  { id:"crm-7", tenant_id:"tenant-001", customer_id:"cust-5", customer_name:"Nadia Putri", customer_phone:"081277889900", cashier_name:"Agus Kasir", type:"retention_45", message_content:"Kak Nadia, sepatu suede biasanya butuh treatment berkala. Kami siap bantu cek kondisinya.", sent_at:daysAgo(36,9), is_converted:true, converted_transaction_id:"tx-2010", converted_amount:150000, converted_at:daysAgo(36,10) },
  { id:"crm-8", tenant_id:"tenant-001", customer_id:"cust-10", customer_name:"Maya Lestari", customer_phone:"089612345678", cashier_name:"Agus Kasir", type:"retention_45", message_content:"Halo Kak Maya, koleksi sneaker Kakak masih aman? Kami ada slot repaint minggu ini.", sent_at:daysAgo(22,9), is_converted:true, converted_transaction_id:"tx-2008", converted_amount:135000, converted_at:daysAgo(22,11) },
];

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

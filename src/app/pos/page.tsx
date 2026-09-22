"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { WhatsAppSendModal } from "@/components/whatsapp-send-modal";
import { ProductService, TransactionItem } from "@/types";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Printer, 
  Send, 
  CheckCircle2, 
  Receipt,
  Clock,
  Camera,
  Building2,
  User,
  ListOrdered,
  X,
  Eye,
  Calendar,
  MapPin,
  CheckSquare,
  DollarSign,
  Tag,
  Sparkles,
  ChevronRight,
  Layers
} from "lucide-react";

export default function CashierMainDashboardPage() {
  const { 
    tenant, 
    productsServices, 
    customers, 
    addCustomer, 
    addTransaction, 
    transactions,
    updateWorkStatus,
    settleTransaction,
    currentUser,
    toggleAttendance,
    promoInstructions
  } = useTenant();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'service' | 'product'>('all');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [itemNotes, setItemNotes] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Photo Upload State (Kamera / Galeri HP)
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // Plain Manual Diskon & DP State (Polos, Tanpa Dropdown)
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [discountAmountManual, setDiscountAmountManual] = useState<number | "">("");
  const [dpAmountManual, setDpAmountManual] = useState<number | "">("");
  const [lastTxReceipt, setLastTxReceipt] = useState<any | null>(null);
  const [waOpenedStatus, setWaOpenedStatus] = useState<boolean>(false);
  const [waModalData, setWaModalData] = useState<{ isOpen: boolean; phone: string; message: string; recipientName: string }>({
    isOpen: false,
    phone: "",
    message: "",
    recipientName: "",
  });

  // Modals for Clickable Header Metrics & Sections
  const [showOmsetModal, setShowOmsetModal] = useState(false);
  const [showRekapModal, setShowRekapModal] = useState(false);
  const [showStatusTxModal, setShowStatusTxModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Filter Status Transaksi
  const [txFilterStatus, setTxFilterStatus] = useState<'all' | 'baru' | 'terlambat' | 'harus_selesai'>('all');
  const [mobilePosTab, setMobilePosTab] = useState<'catalog' | 'checkout'>('catalog');

  const filteredItems = productsServices.filter((ps) => {
    const matchesSearch = ps.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ps.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Subtotal & Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  
  // Calculate discount from percentage or manual rupiah input
  let calculatedDiscount = 0;
  if (discountPercent && Number(discountPercent) > 0) {
    calculatedDiscount = (subtotal * Number(discountPercent)) / 100;
  } else if (discountAmountManual && Number(discountAmountManual) > 0) {
    calculatedDiscount = Number(discountAmountManual);
  }

  const totalAmount = Math.max(0, subtotal - calculatedDiscount);
  const dpValue = dpAmountManual ? Number(dpAmountManual) : 0;
  const isDpActive = dpValue > 0 && dpValue < totalAmount;
  const paidAmount = isDpActive ? dpValue : totalAmount;
  const sisaPembayaran = Math.max(0, totalAmount - paidAmount);

  // Today's cashier metrics
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const cashierTodayTxs = transactions.filter(
    (tx) => tx.cashier_id === currentUser.id && tx.created_at.startsWith(todayDateStr)
  );

  const todayNotaCount = cashierTodayTxs.length;
  const todayCashierRevenue = cashierTodayTxs.reduce((sum, tx) => sum + tx.total_amount, 0);
  const todayCashierMoneyReceived = cashierTodayTxs.reduce((sum, tx) => sum + tx.paid_amount, 0);

  // Status Filtered Transactions
  const statusFilteredTxs = transactions.filter((tx) => {
    if (txFilterStatus === 'all') return tx.work_status !== 'completed';
    return tx.work_status === txFilterStatus;
  });

  // Pelunasan / Pengambilan Transactions
  const settlementTxs = transactions.filter((tx) => tx.status === 'partially_paid' || tx.work_status === 'ready_for_pickup');

  const addToCart = (item: ProductService) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item_id === item.id
            ? { ...i, quantity: i.quantity + 1, gross_margin: (i.unit_price - i.cost_price) * (i.quantity + 1) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: `txi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          item_id: item.id,
          name: item.name,
          type: item.type,
          cost_price: item.cost_price,
          unit_price: item.sell_price,
          quantity: 1,
          gross_margin: item.sell_price - item.cost_price,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item_id === itemId) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...i,
              quantity: newQty,
              gross_margin: (i.unit_price - i.cost_price) * newQty,
            };
          }
          return i;
        })
        .filter(Boolean) as TransactionItem[]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;
    const created = addCustomer({ name: newCustomerName, phone: newCustomerPhone });
    setSelectedCustomerId(created.id);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setShowAddCustomerModal(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newTx = addTransaction({
      customer_id: selectedCustomerId || undefined,
      customer_name: selectedCustomer?.name || "Pelanggan Umum",
      customer_phone: selectedCustomer?.phone || "",
      cashier_id: currentUser.id,
      cashier_name: currentUser.name,
      photo_url: photoUrl || undefined,
      work_status: "baru",
      item_notes: itemNotes,
      subtotal,
      discount_type: discountPercent ? "percent" : "amount",
      discount_value: Number(discountPercent || discountAmountManual || 0),
      discount_amount: calculatedDiscount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      status: paidAmount >= totalAmount ? "paid" : "partially_paid",
      payment_method: "cash",
      payment_stage: isDpActive ? "dp" : "full",
      items: cart,
    });

    setLastTxReceipt(newTx);
    setCart([]);
    setItemNotes("");
    setPhotoUrl("");
    setDiscountPercent("");
    setDiscountAmountManual("");
    setDpAmountManual("");
  };

  const handleSendWaNota = (tx: any) => {
    const sisa = tx.total_amount - tx.paid_amount;
    const text = `*NOTA DIGITAL OFFICIAL - ${tenant.business_name}*
Invoice: ${tx.invoice_number}
Tanggal: ${new Date(tx.created_at).toLocaleString("id-ID")}
Pelanggan: ${tx.customer_name}

*Rincian Item / Layanan:*
${tx.items.map((i: any) => `• ${i.name} x${i.quantity} = Rp ${(i.unit_price * i.quantity).toLocaleString("id-ID")}`).join("\n")}

${tx.item_notes ? `*Catatan Pengerjaan:* ${tx.item_notes}\n` : ""}
Subtotal: Rp ${tx.subtotal.toLocaleString("id-ID")}
Diskon: Rp ${tx.discount_amount.toLocaleString("id-ID")}
Total Tagihan: Rp ${tx.total_amount.toLocaleString("id-ID")}
Dibayar (${tx.payment_stage.toUpperCase()}): Rp ${tx.paid_amount.toLocaleString("id-ID")}
${sisa > 0 ? `*Sisa Pelunasan:* Rp ${sisa.toLocaleString("id-ID")}\n` : "*Status:* LUNAS\n"}
----------------------------
*Alamat Outlet:*
${tenant.address}

*Syarat & Ketentuan:*
${tenant.terms_and_conditions}

Terima kasih atas kunjungan Anda!`;

    const phone = tx.customer_phone || selectedCustomer?.phone || "6281234567890";
    setWaModalData({
      isOpen: true,
      phone,
      message: text,
      recipientName: tx.customer_name || "Pelanggan Toko",
    });
  };

  const handleSendPickUpWa = (tx: any) => {
    const sisa = tx.total_amount - tx.paid_amount;
    const text = `Halo Kak ${tx.customer_name}, pengerjaan barang kesayangan Anda (${tx.item_notes || 'Layanan Toko'}) sudah *SIAP DIAMBIL* di ${tenant.business_name}.\n\n*Alamat Toko:* ${tenant.address}\n${sisa > 0 ? `*Sisa Pelunasan:* Rp ${sisa.toLocaleString("id-ID")}\n` : "*Status:* LUNAS\n"}\nKami tunggu kedatangannya ya kak!`;
    const phone = tx.customer_phone || selectedCustomer?.phone || "6281234567890";
    setWaModalData({
      isOpen: true,
      phone,
      message: text,
      recipientName: tx.customer_name || "Pelanggan Toko",
    });
  };

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {waOpenedStatus && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>WhatsApp dibuka / pesan siap dikirim</span>
        </div>
      )}
      
      {/* 1. Header & Absensi Kasir Bar (Tampilan SaaS Clean Bar) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          
          {/* Identity Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Kasir Log-In</span>
                <span className="font-black text-slate-900 dark:text-slate-100 text-lg">{currentUser.name}</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-sky-600" /> Outlet: <strong className="text-slate-800 dark:text-slate-200">{tenant.business_name}</strong>
              </p>
            </div>
          </div>

          {/* Bar Absensi (Waktu, Tempat & Tanggal) */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Tanggal: <strong className="text-slate-900 dark:text-slate-100">{todayFormatted}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Tempat: <strong className="text-slate-900 dark:text-slate-100 truncate max-w-xs">{tenant.address}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Jam Absen: <strong className="text-emerald-600 dark:text-emerald-400">{currentUser.clock_in || "Belum Absen"}</strong> {currentUser.clock_out ? `(Keluar: ${currentUser.clock_out})` : ""}</span>
              </div>
            </div>

            <button
              onClick={() => toggleAttendance(currentUser.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition text-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>{!currentUser.clock_in ? 'Kasir Absen (Clock In)' : !currentUser.clock_out ? 'Absen Keluar (Clock Out)' : 'Shift Baru'}</span>
            </button>
          </div>

        </div>

        {/* 2. Kartu Ringkasan Clickable Metric Cards (4 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Status Transaksi (Clickable Trigger Modal) */}
          <div
            onClick={() => setShowStatusTxModal(true)}
            className="bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/80 hover:border-purple-500 cursor-pointer transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-extrabold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                Status Transaksi (Klik Detail)
              </span>
              <p className="text-xs font-black text-purple-900 dark:text-purple-100 mt-1 flex items-center gap-1">
                <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">{transactions.filter(t => t.work_status === 'baru').length} Baru</span>
                <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">{transactions.filter(t => t.work_status === 'terlambat').length} Terlambat</span>
              </p>
            </div>
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900 rounded-xl group-hover:scale-110 transition">
              <Clock className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
          </div>

          {/* Card 2: Pelunasan & Pengambilan (Clickable Trigger Modal) */}
          <div
            onClick={() => setShowSettlementModal(true)}
            className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/80 hover:border-amber-500 cursor-pointer transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Pelunasan &amp; Pengambilan
              </span>
              <p className="text-xl font-black text-amber-900 dark:text-amber-100 mt-1">
                {settlementTxs.length} <span className="text-xs font-bold text-amber-700">Nota Menunggu</span>
              </p>
            </div>
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900 rounded-xl group-hover:scale-110 transition">
              <CheckSquare className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            </div>
          </div>

          {/* Card 3: Jumlah Transaksi Kasir (Clickable Trigger Modal) */}
          <div
            onClick={() => setShowOmsetModal(true)}
            className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/80 hover:border-emerald-500 cursor-pointer transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Total Omset Kasir
              </span>
              <p className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                {todayNotaCount} <span className="text-xs font-bold text-emerald-700">Nota Resmi</span>
              </p>
            </div>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900 rounded-xl group-hover:scale-110 transition">
              <Eye className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>

          {/* Card 4: Rekap Transaksi Kasir (Clickable Trigger Modal) */}
          <div
            onClick={() => setShowRekapModal(true)}
            className="bg-sky-50/70 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-200/80 dark:border-sky-900/80 hover:border-sky-500 cursor-pointer transition shadow-sm flex items-center justify-between group"
          >
            <div>
              <span className="text-[11px] font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                Rekap Nota Kasir
              </span>
              <p className="text-xl font-black text-sky-900 dark:text-sky-100 mt-1">
                Rp {todayCashierRevenue.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-2.5 bg-sky-100 dark:bg-sky-900 rounded-xl group-hover:scale-110 transition">
              <ListOrdered className="w-5 h-5 text-sky-700 dark:text-sky-300" />
            </div>
          </div>

        </div>

        {/* Owner Active Promo Instruction Notification Banner */}
        {promoInstructions.filter(pi => pi.status === 'active').length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-amber-200 flex-shrink-0 animate-pulse" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  📢 Pesan Promo dari Owner
                </span>
                <p className="text-xs font-bold mt-0.5">
                  {promoInstructions.filter(pi => pi.status === 'active')[0].promo_message}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Tab Switcher for Smartphone Screens */}
      <div className="flex lg:hidden items-center p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700 font-extrabold text-xs">
        <button
          onClick={() => setMobilePosTab('catalog')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition ${
            mobilePosTab === 'catalog'
              ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Pilih Katalog</span>
        </button>

        <button
          onClick={() => setMobilePosTab('checkout')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition relative ${
            mobilePosTab === 'checkout'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>2. Form Nota ({cart.length})</span>
          {cart.length > 0 && (
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute top-2 right-4" />
          )}
        </button>
      </div>

      {/* 4. Form Buat Transaksi POS Kasir (POLOS TULIS MANUAL DISKON & DP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Catalog Selection */}
        <div className={`${mobilePosTab === 'catalog' ? 'block' : 'hidden lg:block'} lg:col-span-7 space-y-6`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Pilih Produk Ritel &amp; Layanan Jasa</h2>
              
              {/* Category Filter Pills */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'all' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedCategory('service')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'service' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Jasa
                </button>
                <button
                  onClick={() => setSelectedCategory('product')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'product' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Ritel
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk ritel atau layanan jasa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-500 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    item.type === 'service' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type === 'service' ? 'Layanan Jasa' : 'Barang Ritel'}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2 group-hover:text-sky-600 transition">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Harga Jual</span>
                  <span className="font-black text-sky-600 dark:text-sky-400 text-sm">
                    Rp {item.sell_price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Form Buat Nota Transaksi (POLOS MANUAL DISKON & DP) */}
        <div className={`${mobilePosTab === 'checkout' ? 'block' : 'hidden lg:block'} lg:col-span-5 space-y-6`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" /> Form Buat Nota Transaksi
              </h2>
              <span className="text-xs text-slate-500 font-bold">{cart.length} Item</span>
            </div>

            {/* Select Customer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pelanggan + No Kontak *
                </label>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Pelanggan Baru
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold"
              >
                <option value="">Pelanggan Umum (Tanpa Nama)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-6">Pilih produk ritel atau layanan jasa di samping.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <div className="flex-1 pr-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                      <p className="text-[11px] text-sky-600 font-semibold">Rp {item.unit_price.toLocaleString("id-ID")}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQuantity(item.item_id, -1)} className="p-1 rounded bg-slate-200 dark:bg-slate-700">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-5 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart({ id: item.item_id, name: item.name, sell_price: item.unit_price, type: item.type } as any)} className="p-1 rounded bg-slate-200 dark:bg-slate-700">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Catatan Pengerjaan Barang */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Catatan Barang / Pengerjaan
              </label>
              <input
                type="text"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="misal: Sepatu Nike Putih - Noda oli di sol samping"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            {/* REVISI KUNCI: DISKON & DP POLOS DIKETIK MANUAL (TANPA DROPDOWN) */}
            {cart.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                
                {/* Manual Input Diskon (%) & Diskon (Rp) */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Diskon (%) Manual
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => {
                        setDiscountPercent(e.target.value ? Number(e.target.value) : "");
                        setDiscountAmountManual("");
                      }}
                      placeholder="10 (%)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Diskon (Rp) Manual
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discountAmountManual}
                      onChange={(e) => {
                        setDiscountAmountManual(e.target.value ? Number(e.target.value) : "");
                        setDiscountPercent("");
                      }}
                      placeholder="10000 (Rp)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Manual Input DP & Sisa Pembayaran */}
                <div className="grid grid-cols-2 gap-3 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/60">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                      Jumlah DP (Rp) Manual
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={dpAmountManual}
                      onChange={(e) => setDpAmountManual(e.target.value ? Number(e.target.value) : "")}
                      placeholder="50000"
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-xs font-extrabold text-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                      Sisa Pembayaran
                    </label>
                    <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-800 text-xs font-black text-rose-600 flex items-center justify-between h-[34px]">
                      <span>Rp {sisaPembayaran.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                {/* Upload Foto Kamera / Galeri HP */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Foto Produk / Hasil Pengerjaan (Kamera &amp; Galeri HP)
                  </label>
                  <label className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100 text-sky-700 text-xs font-bold cursor-pointer transition">
                    <Camera className="w-4 h-4" />
                    <span>{photoUrl ? "Foto Berhasil Dimuat!" : "Ambil Foto via Kamera / Galeri HP"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Price Calculation Summary */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Diskon Transaksi</span>
                      <span>- Rp {calculatedDiscount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 text-base pt-2 border-t">
                    <span>Total Dibayar Sekarang</span>
                    <span className="text-emerald-600">Rp {paidAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
                >
                  Proses Transaksi &amp; Cetak Nota
                </button>
              </div>
            )}
          </div>

          {/* Thermal Receipt Preview & Print Actions */}
          {lastTxReceipt && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-emerald-600 font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Transaksi Berhasil!
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-700 font-mono">
                  {lastTxReceipt.invoice_number}
                </span>
              </div>

              <div id="thermal-receipt" className="bg-amber-50/70 dark:bg-slate-950 p-4 rounded-xl border border-dashed border-amber-300 dark:border-slate-700 text-xs font-mono space-y-3">
                <div className="text-center space-y-1 border-b pb-3 border-amber-200">
                  {tenant.logo_url && (
                    <img src={tenant.logo_url} alt="Logo" className="w-10 h-10 mx-auto rounded object-cover mb-1" />
                  )}
                  <h3 className="font-bold text-sm">{tenant.business_name}</h3>
                  <p className="text-[10px] text-slate-500">{tenant.address}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span>{lastTxReceipt.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{lastTxReceipt.customer_name}</span>
                  </div>
                </div>

                <div className="border-t border-b py-2 space-y-1 border-amber-200">
                  {lastTxReceipt.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-[11px]">
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rp {(item.unit_price * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[11px] font-bold">
                  <div className="flex justify-between">
                    <span>Total Tagihan:</span>
                    <span>Rp {lastTxReceipt.total_amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Dibayar:</span>
                    <span>Rp {lastTxReceipt.paid_amount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="border-t pt-2 text-[9px] text-slate-500 space-y-1 border-amber-200">
                  <p className="font-bold">Syarat &amp; Ketentuan:</p>
                  <p className="whitespace-pre-line">{tenant.terms_and_conditions}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak ({tenant.thermal_paper_size})</span>
                </button>

                <button
                  onClick={() => handleSendWaNota(lastTxReceipt)}
                  className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim WA Digital</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal 1: Detail Total Omset & Uang Diterima */}
      {showOmsetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> Detail Omset &amp; Penerimaan Uang
              </h3>
              <button onClick={() => setShowOmsetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-xs text-slate-500 font-semibold block">Total Jumlah Nota Hari Ini</span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{todayNotaCount} Transaksi</span>
              </div>
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-2xl">
                <span className="text-xs text-sky-700 font-semibold block">Total Omset Penjualan Hari Ini</span>
                <span className="text-xl font-black text-sky-600">Rp {todayCashierRevenue.toLocaleString("id-ID")}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
                <span className="text-xs text-emerald-700 font-semibold block">Total Uang Diterima (Cash + DP + Transfer)</span>
                <span className="text-xl font-black text-emerald-600">Rp {todayCashierMoneyReceived.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Rekap Daftar Nota */}
      {showRekapModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-sky-600" /> Rekap Daftar Nota Hari Ini
              </h3>
              <button onClick={() => setShowRekapModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cashierTodayTxs.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-8">Belum ada nota transaksi yang dibuat hari ini.</p>
              ) : (
                cashierTodayTxs.map((tx) => (
                  <div key={tx.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{tx.invoice_number}</span>
                      <span className="text-slate-500">{tx.customer_name} • {new Date(tx.created_at).toLocaleTimeString("id-ID")}</span>
                    </div>
                    <div className="text-right font-black text-sky-600">
                      Rp {tx.total_amount.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Status Transaksi Pengerjaan & Antrean (Clickable Card Trigger) */}
      {showStatusTxModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" /> Status Transaksi (Baru, Terlambat, Harus Selesai)
              </h3>
              <button onClick={() => setShowStatusTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTxFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'all' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
              >
                Semua ({transactions.filter(t => t.work_status !== 'completed').length})
              </button>
              <button
                onClick={() => setTxFilterStatus('baru')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'baru' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-500'}`}
              >
                Baru ({transactions.filter(t => t.work_status === 'baru').length})
              </button>
              <button
                onClick={() => setTxFilterStatus('terlambat')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'terlambat' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                Terlambat ({transactions.filter(t => t.work_status === 'terlambat').length})
              </button>
              <button
                onClick={() => setTxFilterStatus('harus_selesai')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'harus_selesai' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-500'}`}
              >
                Selesai ({transactions.filter(t => t.work_status === 'harus_selesai').length})
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {statusFilteredTxs.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">Tidak ada transaksi dalam kategori status ini.</p>
              ) : (
                statusFilteredTxs.map((tx) => (
                  <div key={tx.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{tx.invoice_number}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          tx.work_status === 'terlambat' ? 'bg-rose-100 text-rose-800' : tx.work_status === 'harus_selesai' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {tx.work_status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{tx.customer_name}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sky-600 text-xs block">Rp {tx.total_amount.toLocaleString("id-ID")}</span>
                      <button
                        onClick={() => updateWorkStatus(tx.id, tx.work_status === 'baru' ? 'harus_selesai' : 'ready_for_pickup')}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Pelunasan & Pengambilan Barang (Clickable Card Trigger) */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" /> Daftar Pelunasan &amp; Pengambilan Barang ({settlementTxs.length})
              </h3>
              <button onClick={() => setShowSettlementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {settlementTxs.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-8">Tidak ada transaksi yang menunggu pelunasan.</p>
              ) : (
                settlementTxs.map((tx) => {
                  const sisa = tx.total_amount - tx.paid_amount;
                  return (
                    <div key={tx.id} className="p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{tx.invoice_number}</span>
                          <span className="text-xs text-slate-500">• {tx.customer_name}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
                          Sisa Pelunasan: <strong>Rp {sisa.toLocaleString("id-ID")}</strong>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSendPickUpWa(tx)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-700 transition"
                        >
                          <Send className="w-3 h-3" /> WA
                        </button>

                        <button
                          onClick={() => {
                            settleTransaction(tx.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold shadow"
                        >
                          Pelunasan
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Send Confirmation Modal */}
      <WhatsAppSendModal
        isOpen={waModalData.isOpen}
        onClose={() => setWaModalData((prev) => ({ ...prev, isOpen: false }))}
        phone={waModalData.phone}
        message={waModalData.message}
        recipientName={waModalData.recipientName}
        title="Konfirmasi Kirim Nota / Reminder WA"
        onSuccessOpened={() => {
          setWaOpenedStatus(true);
          setTimeout(() => setWaOpenedStatus(false), 3500);
        }}
      />

    </div>
  );
}

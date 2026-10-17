"use client";

import { useState, useMemo, useEffect } from "react";
import { useTenant } from "@/lib/tenant-context";
import { openWhatsAppChat } from "@/lib/whatsapp";
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
  User,
  X,
  Calendar,
  Sparkles,
  Trash2,
  Tag,
  ArrowRight
} from "lucide-react";

interface PosInvoiceSectionProps {
  showTitle?: boolean;
  className?: string;
}

export function PosInvoiceSection({ showTitle = true, className = "" }: PosInvoiceSectionProps) {
  const {
    tenant,
    productsServices,
    customers,
    addCustomer,
    addTransaction,
    currentUser,
    promoInstructions,
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

  // Helper local ISO string
  const getLocalIsoString = (d: Date = new Date()) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Tanggal & Waktu Transaksi (Default terisi saat ini)
  const [txDateTime, setTxDateTime] = useState<string>(() => getLocalIsoString());

  // Diskon: Mode Persen (%) vs Nominal Rupiah (Rp)
  const [discountMode, setDiscountMode] = useState<'percent' | 'amount'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [discountAmountManual, setDiscountAmountManual] = useState<number | "">("");

  // Pengajuan Diskon Special
  const [isSpecialDiscount, setIsSpecialDiscount] = useState<boolean>(false);
  const [specialDiscountNote, setSpecialDiscountNote] = useState<string>("");

  // Input Uang Muka / DP Manual
  const [dpAmountManual, setDpAmountManual] = useState<number | "">("");
  const [lastTxReceipt, setLastTxReceipt] = useState<any | null>(null);
  const [waOpenedStatus, setWaOpenedStatus] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    return productsServices.filter((ps) => {
      const matchesSearch = ps.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ps.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsServices, searchQuery, selectedCategory]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Subtotal Keranjang
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // Estimasi durasi pengerjaan jasa reparasi dari master data layanan input owner
  const maxServiceDurationMinutes = useMemo(() => {
    const serviceItems = cart.filter((item) => item.type === "service");
    if (serviceItems.length === 0) return 60;
    let max = 0;
    serviceItems.forEach((ci) => {
      const ps = productsServices.find((p) => p.id === ci.item_id);
      const dur = ps?.duration_minutes || 1440;
      if (dur > max) max = dur;
    });
    return max || 1440;
  }, [cart, productsServices]);

  // Tanggal Selesai & Waktu (Default terisi otomatis sesuai layanan input owner)
  const [completionDateTime, setCompletionDateTime] = useState<string>(() => {
    const d = new Date(Date.now() + 1440 * 60000);
    return getLocalIsoString(d);
  });

  // Auto-sync completion date saat tanggal nota atau item layanan berubah
  useEffect(() => {
    const base = txDateTime ? new Date(txDateTime) : new Date();
    const target = new Date(base.getTime() + maxServiceDurationMinutes * 60000);
    setCompletionDateTime(getLocalIsoString(target));
  }, [txDateTime, maxServiceDurationMinutes]);

  // Hitung diskon nominal rupiah atau persentase
  let calculatedDiscount = 0;
  if (discountMode === "percent" && discountPercent && Number(discountPercent) > 0) {
    calculatedDiscount = Math.round((subtotal * Number(discountPercent)) / 100);
  } else if (discountMode === "amount" && discountAmountManual && Number(discountAmountManual) > 0) {
    calculatedDiscount = Number(discountAmountManual);
  }

  const totalAmount = Math.max(0, subtotal - calculatedDiscount);
  const dpValue = dpAmountManual ? Number(dpAmountManual) : 0;
  const isDpActive = dpValue > 0 && dpValue < totalAmount;
  const paidAmount = isDpActive ? dpValue : totalAmount;
  const sisaPembayaran = Math.max(0, totalAmount - paidAmount);

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

  const removeItemFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.item_id !== itemId));
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
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    const cleanPhone = newCustomerPhone.trim().replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("62") ? "0" + cleanPhone.slice(2) : cleanPhone.startsWith("8") ? "0" + cleanPhone : cleanPhone;
    const created = addCustomer({ name: newCustomerName.trim(), phone: formattedPhone });
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
      discount_type: discountMode,
      discount_value: discountMode === "percent" ? Number(discountPercent || 0) : Number(discountAmountManual || 0),
      discount_amount: calculatedDiscount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining_amount: sisaPembayaran,
      dp_amount: isDpActive ? dpValue : 0,
      status: paidAmount >= totalAmount ? "paid" : "partially_paid",
      payment_method: "cash",
      payment_stage: isDpActive ? "dp" : "full",
      items: cart,
      created_at: txDateTime ? new Date(txDateTime).toISOString() : new Date().toISOString(),
      estimated_completion_date: completionDateTime ? new Date(completionDateTime).toISOString() : undefined,
      discount_special_requested: isSpecialDiscount,
      discount_special_note: isSpecialDiscount ? specialDiscountNote : undefined,
      discount_special_status: isSpecialDiscount ? (currentUser.role === 'owner' ? 'approved' : 'pending') : 'none',
    });

    setLastTxReceipt(newTx);
    setCart([]);
    setItemNotes("");
    setPhotoUrl("");
    setDiscountPercent("");
    setDiscountAmountManual("");
    setDpAmountManual("");
    setIsSpecialDiscount(false);
    setSpecialDiscountNote("");
  };

  const handleSendWaNota = (tx: any) => {
    const sisa = tx.total_amount - tx.paid_amount;
    const text = `*NOTA DIGITAL RESMI - ${tenant.business_name}*
Invoice: ${tx.invoice_number}
Tanggal Transaksi: ${new Date(tx.created_at).toLocaleString("id-ID")}
${tx.estimated_completion_date ? `*Estimasi Selesai:* ${new Date(tx.estimated_completion_date).toLocaleString("id-ID")}\n` : ""}Pelanggan: ${tx.customer_name}

*Rincian Item / Layanan:*
${tx.items.map((i: any) => `• ${i.name} x${i.quantity} = Rp ${(i.unit_price * i.quantity).toLocaleString("id-ID")}`).join("\n")}

${tx.item_notes ? `*Catatan Pengerjaan:* ${tx.item_notes}\n` : ""}
Subtotal: Rp ${tx.subtotal.toLocaleString("id-ID")}
Diskon: Rp ${tx.discount_amount.toLocaleString("id-ID")} (${tx.discount_type === 'percent' ? `${tx.discount_value}%` : 'Nominal Rp'})${tx.discount_special_requested ? ` [Diskon Special: ${tx.discount_special_note || 'ACC'}]` : ''}
Total Tagihan: Rp ${tx.total_amount.toLocaleString("id-ID")}
Dibayar (${tx.payment_stage.toUpperCase()}): Rp ${tx.paid_amount.toLocaleString("id-ID")}
${sisa > 0 ? `*NOMINAL BELUM TERBAYAR (SISA):* Rp ${sisa.toLocaleString("id-ID")}\n` : "*STATUS:* LUNAS\n"}
----------------------------
*Alamat Outlet:*
${tenant.address}

*Syarat & Ketentuan:*
${tenant.terms_and_conditions}

Terima kasih atas kunjungan Anda!
_Radar Toko POS System_`;

    const phone = tx.customer_phone || selectedCustomer?.phone || "6281234567890";
    setWaOpenedStatus(true);
    setTimeout(() => setWaOpenedStatus(false), 3500);
    openWhatsAppChat(phone, text);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {waOpenedStatus && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>WhatsApp dibuka / pesan nota siap dikirim</span>
        </div>
      )}

      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-600" />
              <span>Buat Nota &amp; Kasir Transaksi</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih produk ritel &amp; layanan jasa, input DP, diskon (Rp/%), estimasi selesai pengerjaan, dan cetak/kirim nota digital.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-xl self-start sm:self-auto">
            Mode Transaksi: {currentUser.role === 'owner' ? 'Owner / Kasir' : 'Kasir'}
          </span>
        </div>
      )}

      {/* Grid: 7 cols Catalog + 5 cols Form Nota */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri (7 Cols): PILIH PRODUK RITEL & LAYANAN JASA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-sky-600" />
                  Pilih Produk Ritel &amp; Layanan Jasa
                </h3>
                <span className="text-[11px] text-slate-400">Klik item untuk memasukkan ke dalam nota</span>
              </div>
              
              {/* Category Filter Pills */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'all' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm font-black' : 'text-slate-500'}`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('service')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'service' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm font-black' : 'text-slate-500'}`}
                >
                  Jasa Reparasi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('product')}
                  className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'product' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm font-black' : 'text-slate-500'}`}
                >
                  Produk Ritel
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk ritel atau layanan jasa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Cards Item Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">Item tidak ditemukan</p>
                <span className="text-[11px]">Coba cari dengan kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;</span>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.type === 'service'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}>
                        {item.type === 'service' ? 'Layanan Jasa' : 'Barang Ritel'}
                      </span>
                      {item.type === 'product' && (
                        <span className={`text-[10px] font-bold ${item.stock <= 5 ? 'text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded' : 'text-slate-400'}`}>
                          Stok: {item.stock} {item.unit || 'pcs'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs group-hover:text-sky-600 transition line-clamp-2">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Jual</span>
                      <span className="font-black text-sky-600 dark:text-sky-400">
                        Rp {item.sell_price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-black transition flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Tambah
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan (5 Cols): FORM BUAT NOTA TRANSAKSI */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-sky-200 dark:border-sky-900/60 shadow-md space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-600" />
                <span>Form Buat Nota Transaksi</span>
              </h3>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {cart.length} Item Terpilih
              </span>
            </div>

            {/* 1. Pilih / Tambah Nama Konsumen */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nama Konsumen *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> + Pelanggan Baru
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Pelanggan Umum (Tanpa Nama / Non-Member)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Daftar Item Keranjang Nota */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <ShoppingCart className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-bold">Keranjang Nota Masih Kosong</p>
                  <span className="text-[10px]">Klik produk atau layanan di sebelah kiri untuk menambah</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex-1 pr-2 truncate">
                      <h5 className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{item.name}</h5>
                      <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                        Rp {item.unit_price.toLocaleString("id-ID")} x {item.quantity} = Rp {(item.unit_price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.item_id, -1)}
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-black text-xs w-5 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addToCart({ id: item.item_id, name: item.name, sell_price: item.unit_price, type: item.type } as any)}
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItemFromCart(item.item_id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 ml-1"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Catatan Pengerjaan Barang / Instruksi Nota */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Catatan Barang / Layanan (Opsional)
              </label>
              <input
                type="text"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="misal: Sepatu Nike Putih - Noda oli di sol samping"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Rincian Nota Lengkap (Hanya tampil jika ada item di cart) */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                
                {/* A. Tanggal & Waktu Transaksi + Tanggal Selesai Estimasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-600" /> Tgl &amp; Waktu Nota
                    </label>
                    <input
                      type="datetime-local"
                      value={txDateTime}
                      onChange={(e) => setTxDateTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Default saat ini</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" /> Estimasi Selesai
                    </label>
                    <input
                      type="datetime-local"
                      value={completionDateTime}
                      onChange={(e) => setCompletionDateTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                    />
                    <span className="text-[9px] text-purple-600 dark:text-purple-400 block mt-0.5">
                      Estimasi durasi ({Math.round(maxServiceDurationMinutes / 60)} Jam)
                    </span>
                  </div>
                </div>

                {/* B. Diskon Nota (Rupiah atau Persen) */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">
                      Beri Diskon Nota
                    </label>
                    {/* Toggle Rupiah vs Persen */}
                    <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-700 rounded-lg text-[10px] font-extrabold">
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountMode("percent");
                          setDiscountAmountManual("");
                        }}
                        className={`px-2.5 py-0.5 rounded-md transition ${discountMode === "percent" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-500"}`}
                      >
                        % Persen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountMode("amount");
                          setDiscountPercent("");
                        }}
                        className={`px-2.5 py-0.5 rounded-md transition ${discountMode === "amount" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-500"}`}
                      >
                        Rp Rupiah
                      </button>
                    </div>
                  </div>

                  {discountMode === "percent" ? (
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value ? Number(e.target.value) : "")}
                        placeholder="Contoh: 10 (diskon 10%)"
                        className="w-full px-3 py-1.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min={0}
                        value={discountAmountManual}
                        onChange={(e) => setDiscountAmountManual(e.target.value ? Number(e.target.value) : "")}
                        placeholder="Contoh: 20000"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  )}

                  {calculatedDiscount > 0 && (
                    <div className="text-[11px] font-bold text-emerald-600 flex justify-between pt-0.5">
                      <span>Nominal Potongan Diskon:</span>
                      <span>- Rp {calculatedDiscount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {/* C. Pengajuan Diskon Special */}
                <div className="p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSpecialDiscount}
                      onChange={(e) => setIsSpecialDiscount(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      {currentUser.role === 'owner' ? 'Diskon Special Owner (Langsung Disetujui)' : 'Ajukan Diskon Special ke Owner'}
                    </span>
                  </label>
                  
                  {isSpecialDiscount && (
                    <div className="pt-1 space-y-1">
                      <input
                        type="text"
                        value={specialDiscountNote}
                        onChange={(e) => setSpecialDiscountNote(e.target.value)}
                        placeholder="Keterangan diskon special (misal: Langganan lama, bawa 5 unit)"
                        className="w-full px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-xs font-medium placeholder-purple-300"
                      />
                    </div>
                  )}
                </div>

                {/* D. Input DP & Nominal Belum Terbayar (Sisa Pelunasan) */}
                <div className="grid grid-cols-2 gap-2.5 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/60">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-amber-900 dark:text-amber-300 mb-1">
                      Input DP (Uang Muka)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={dpAmountManual}
                      onChange={(e) => setDpAmountManual(e.target.value ? Number(e.target.value) : "")}
                      placeholder="0 (kosongkan jika lunas)"
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-black text-amber-700"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Kosongkan jika bayar lunas</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-amber-900 dark:text-amber-300 mb-1">
                      Nominal Belum Terbayar
                    </label>
                    <div className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-800 text-xs font-black flex items-center justify-between h-[34px]">
                      <span className={sisaPembayaran > 0 ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}>
                        Rp {sisaPembayaran.toLocaleString("id-ID")}
                      </span>
                      {sisaPembayaran === 0 && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-black">LUNAS</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Sisa tagihan yang harus dilunasi</span>
                  </div>
                </div>

                {/* E. Insert Foto Kondisi Barang / Nota (Kamera / Galeri HP) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Foto Nota / Barang (Kamera &amp; Galeri HP)
                    </label>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("")}
                        className="text-rose-600 hover:underline text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Foto
                      </button>
                    )}
                  </div>

                  {photoUrl ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 p-2.5 flex items-center gap-3">
                      <img src={photoUrl} alt="Lampiran Foto" className="w-14 h-14 rounded-xl object-cover border border-white/20 flex-shrink-0" />
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-emerald-400 block">✓ Foto Berhasil Disematkan</span>
                        <span className="text-[10px] text-slate-300 block">Tersambung ke cetak nota &amp; WA digital</span>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100 text-sky-700 text-xs font-bold cursor-pointer transition">
                      <Camera className="w-4 h-4 text-sky-600" />
                      <span>Ambil Foto via Kamera atau Buka Galeri HP</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Rincian Kalkulasi Akhir */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Tagihan:</span>
                    <span className="font-bold">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 font-semibold">
                      <span>Potongan Diskon:</span>
                      <span className="font-bold">- Rp {calculatedDiscount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 dark:text-slate-100 text-sm pt-1">
                    <span>Total Tagihan Bersih:</span>
                    <span className="text-sky-600">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 dark:text-slate-100 text-sm">
                    <span>Dibayar Sekarang ({isDpActive ? "DP" : "Lunas"}):</span>
                    <span className="text-emerald-600">Rp {paidAmount.toLocaleString("id-ID")}</span>
                  </div>
                  {sisaPembayaran > 0 && (
                    <div className="flex justify-between font-extrabold text-rose-600 text-xs pt-0.5">
                      <span>Sisa Belum Dibayar:</span>
                      <span>Rp {sisaPembayaran.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {/* Tombol Buat & Cetak Nota */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Proses Transaksi &amp; Cetak Nota</span>
                </button>
              </div>
            )}
          </div>

          {/* Struk Hasil Transaksi & Aksi Cetak / WA */}
          {lastTxReceipt && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-400 dark:border-emerald-800 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-emerald-600 font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> Nota Berhasil Dibuat!
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-700 font-mono font-bold">
                  {lastTxReceipt.invoice_number}
                </span>
              </div>

              {/* Tampilan Struk Thermal Preview */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl font-mono text-xs border border-slate-200 dark:border-slate-800 space-y-2 text-slate-800 dark:text-slate-200">
                <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
                  <h4 className="font-black text-sm">{tenant.business_name}</h4>
                  <p className="text-[10px] text-slate-500">{tenant.address}</p>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>No. Nota:</span>
                    <span className="font-bold">{lastTxReceipt.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(lastTxReceipt.created_at).toLocaleString("id-ID")}</span>
                  </div>
                  {lastTxReceipt.estimated_completion_date && (
                    <div className="flex justify-between text-purple-600">
                      <span>Estimasi Selesai:</span>
                      <span>{new Date(lastTxReceipt.estimated_completion_date).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span className="font-bold">{lastTxReceipt.customer_name || "Pelanggan Umum"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{lastTxReceipt.cashier_name}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1">
                  {lastTxReceipt.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-[11px]">
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rp {(item.unit_price * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-0.5 font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {lastTxReceipt.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {lastTxReceipt.discount_amount > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Diskon:</span>
                      <span>- Rp {lastTxReceipt.discount_amount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-1 border-t">
                    <span>Total Tagihan:</span>
                    <span>Rp {lastTxReceipt.total_amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Dibayar ({lastTxReceipt.payment_stage.toUpperCase()}):</span>
                    <span>Rp {lastTxReceipt.paid_amount.toLocaleString("id-ID")}</span>
                  </div>
                  {lastTxReceipt.remaining_amount > 0 && (
                    <div className="flex justify-between text-rose-600 font-black">
                      <span>Sisa Belum Lunas:</span>
                      <span>Rp {lastTxReceipt.remaining_amount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Cetak & Kirim WA */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Cetak Struk
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWaNota(lastTxReceipt)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <Send className="w-4 h-4" /> Kirim WA Nota
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal: Tambah Konsumen Baru Langsung di Form Nota */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Tambah Konsumen Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Nama lengkap pelanggan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nomor WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="08123456789 (Wajib 08xx)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  Simpan &amp; Pilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

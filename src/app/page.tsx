"use client";

import { useTenant } from "@/lib/tenant-context";
import { 
  TrendingUp, 
  ShoppingBag, 
  MessageSquareText, 
  Building2,
  Wallet,
  CreditCard,
  ArrowUpRight,
  AlertTriangle,
  Package,
  Sparkles,
  Receipt,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Percent,
  Bell,
  Eye,
  X,
  Phone,
  ArrowDownRight,
  Check
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function OwnerDashboard() {
  const { 
    tenant, 
    totalRevenue, 
    totalHPP, 
    totalOperationalExpenses,
    totalCashExpenses,
    totalTransferExpenses,
    totalCashReceived,
    totalTransferReceived,
    netCash,
    netTransfer,
    totalDiscounts,
    cashTransactionsCount,
    transferTransactionsCount,
    transactions,
    customers,
    expenses,
    productsServices,
    promoInstructions,
    totalWaSent,
    crmConvertedCount,
    crmConvertedAmount
  } = useTenant();

  // Mode Tampilan Tren Omset: HARI (7 Hari Terakhir) vs BULAN (7 Bulan Terakhir)
  const [trendViewMode, setTrendViewMode] = useState<'days7' | 'months7'>('days7');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Filter Notifikasi Pelanggan Belum Kembali (>30, >45, >60, >90, atau semua)
  const [dormantFilter, setDormantFilter] = useState<'all' | '30' | '45' | '60' | '90'>('45');
  const [showDormantList, setShowDormantList] = useState<boolean>(false);

  // Dropdown Nominal Diskon
  const [showDiscountDropdown, setShowDiscountDropdown] = useState<boolean>(false);

  // Modal Daftar Nota Terbayarkan (Cash vs Transfer)
  const [invoiceModalType, setInvoiceModalType] = useState<'cash' | 'transfer' | null>(null);

  // 1. Perhitungan Berbasis Nota
  const validTransactions = transactions.filter((tx) => tx.status !== "cancelled");
  const totalInvoicesCount = validTransactions.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactions = validTransactions.filter((tx) => tx.created_at.startsWith(todayStr));
  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.total_amount, 0);
  const todayInvoicesCount = todayTransactions.length;

  // Keuntungan Kotor (Gross Profit) = Total Omset Nota - Total Harga Beli (HPP)
  const grossProfit = totalRevenue - totalHPP;
  const grossMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

  // Perhitungan Keuntungan Kotor Khusus Hasil Konversi CRM (Omset CRM - HPP Bahan)
  const defaultMarginRate = totalRevenue > 0 ? (totalRevenue - totalHPP) / totalRevenue : 0.65;
  const crmGrossProfit = Math.round(crmConvertedAmount * defaultMarginRate);
  const crmGrossProfitMargin = crmConvertedAmount > 0
    ? ((crmGrossProfit / crmConvertedAmount) * 100).toFixed(1)
    : "0";

  // Perhitungan Persentase Pembayaran Cash vs Transfer
  const totalReceivedCombined = totalCashReceived + totalTransferReceived;
  const cashPercent = totalReceivedCombined > 0 ? Math.round((totalCashReceived / totalReceivedCombined) * 100) : 0;
  const transferPercent = totalReceivedCombined > 0 ? 100 - cashPercent : 0;

  // 2. Notifikasi Stok Menipis (Mendekati Batas Habis <= 5 Unit)
  const lowStockThreshold = 5;
  const lowStockProducts = productsServices.filter(
    (ps) => ps.type === "product" && ps.stock <= lowStockThreshold
  );

  // 3. Filter Pelanggan Belum Kembali untuk Notif Owner (>30, >45, >60, >90 hari)
  const dormantCustomersFiltered = useMemo(() => {
    return customers.filter((c) => {
      const diffDays = Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / 86400000);
      if (dormantFilter === '30') return diffDays >= 30;
      if (dormantFilter === '45') return diffDays >= 45;
      if (dormantFilter === '60') return diffDays >= 60;
      if (dormantFilter === '90') return diffDays >= 90;
      return diffDays >= 30; // 'all' (semua yang belum kembali >=30 hari)
    });
  }, [customers, dormantFilter]);

  const totalDormantValue = useMemo(() => {
    return dormantCustomersFiltered.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  }, [dormantCustomersFiltered]);

  // Transaksi yang memiliki diskon
  const discountedTransactions = useMemo(() => {
    return validTransactions.filter((tx) => (tx.discount_amount || 0) > 0);
  }, [validTransactions]);

  // Transaksi Cash vs Transfer
  const cashTransactions = useMemo(() => {
    return validTransactions.filter((tx) => tx.payment_method === 'cash');
  }, [validTransactions]);

  const transferTransactions = useMemo(() => {
    return validTransactions.filter((tx) => tx.payment_method === 'transfer' || tx.payment_method === 'qris');
  }, [validTransactions]);

  // 4. Olah Data Tren Omset Berbasis Nota
  const now = new Date();
  const dailyDataMap: { [label: string]: number } = {};

  if (trendViewMode === "days7") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
      dailyDataMap[dateKey] = 0;
    }

    validTransactions.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      const diffDays = Math.floor((now.getTime() - txDate.getTime()) / 86400000);
      if (diffDays < 7) {
        const dateKey = txDate.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
        if (dailyDataMap[dateKey] !== undefined) {
          dailyDataMap[dateKey] += tx.total_amount;
        }
      }
    });
  } else {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      dailyDataMap[monthKey] = 0;
    }

    validTransactions.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      const monthKey = txDate.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      if (dailyDataMap[monthKey] !== undefined) {
        dailyDataMap[monthKey] += tx.total_amount;
      }
    });
  }

  const chartLabels = Object.keys(dailyDataMap);
  const chartValues = Object.values(dailyDataMap);
  const maxVal = Math.max(...chartValues, 100000);

  const activeIdx = selectedPointIndex !== null ? selectedPointIndex : chartValues.length - 1;
  const activeLabel = chartLabels[activeIdx] || "";
  const activeVal = chartValues[activeIdx] ?? 0;

  const paddingX = 40;
  const graphWidth = 420;
  const points = chartValues.map((val, idx) => {
    const x = paddingX + (idx / (chartValues.length - 1 || 1)) * graphWidth;
    const y = 140 - (val / maxVal) * 110;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Outlet: {tenant.business_name}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 capitalize">
              Model Usaha: {tenant.business_type === 'restaurant' ? 'Restoran & Cafe' : tenant.business_type === 'retail' ? 'Retail & Toko' : 'Jasa & Reparasi'}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Dashboard Utama Owner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan omset berbasis nota kasir harian, penerimaan vs pengeluaran cash/transfer, dan monitoring retensi pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/crm"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Buka Laporan &amp; Ekspor</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* NOTIFIKASI OWNER: KONSUMEN BELUM KEMBALI (>30, >45, >60, >90, SEMUA) */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 rounded-3xl p-5 border-2 border-amber-300/80 dark:border-amber-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md flex-shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  ⚠️ Peringatan Retensi Pelanggan
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Potensi Kehilangan Pelanggan Setia
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-1">
                Terdapat <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-400">{dormantCustomersFiltered.length} Konsumen</span> Belum Kembali Berkunjung {dormantFilter === 'all' ? '(≥30 Hari)' : `(>${dormantFilter} Hari)`}!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Total histori nilai transaksi mereka bernilai <strong className="text-slate-900 dark:text-slate-100 font-bold">Rp {totalDormantValue.toLocaleString("id-ID")}</strong>. Segera arahkan tim kasir untuk follow-up WA reminder!
              </p>
            </div>
          </div>

          {/* Filter Pills: Pilih Semua / >30 / >45 / >60 / >90 Hari */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
            <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setDormantFilter('all')}
                className={`px-2.5 py-1 rounded-xl transition ${
                  dormantFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setDormantFilter('30')}
                className={`px-2.5 py-1 rounded-xl transition ${
                  dormantFilter === '30'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                &gt;30 Hari
              </button>
              <button
                type="button"
                onClick={() => setDormantFilter('45')}
                className={`px-2.5 py-1 rounded-xl transition ${
                  dormantFilter === '45'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                &gt;45 Hari ⭐
              </button>
              <button
                type="button"
                onClick={() => setDormantFilter('60')}
                className={`px-2.5 py-1 rounded-xl transition ${
                  dormantFilter === '60'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                &gt;60 Hari
              </button>
              <button
                type="button"
                onClick={() => setDormantFilter('90')}
                className={`px-2.5 py-1 rounded-xl transition ${
                  dormantFilter === '90'
                    ? 'bg-amber-500 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                &gt;90 Hari
              </button>
            </div>

            <button
              onClick={() => setShowDormantList(!showDormantList)}
              className="px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-100/60 dark:bg-amber-950/50 hover:bg-amber-200/60 text-amber-900 dark:text-amber-200 text-xs font-black transition flex items-center gap-1"
            >
              <span>{showDormantList ? "Tutup Daftar" : "Lihat Nama"}</span>
              {showDormantList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Customer Names Preview */}
        {showDormantList && (
          <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">Daftar Konsumen Belum Kembali {dormantFilter === 'all' ? '(Semua)' : `(>${dormantFilter} Hari)`}:</span>
              <Link href="/crm" className="text-purple-600 hover:underline font-bold flex items-center gap-1">
                <span>Kirim Instruksi Promo ke Kasir</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {dormantCustomersFiltered.map((c) => {
                const diffDays = Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / 86400000);
                return (
                  <div key={c.id} className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{c.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 block">
                        {diffDays} Hari Lalu
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.total_orders || 1}x Order
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* NOTIFIKASI STOK MENDEKATI BATAS (<= 5 Unit) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900/80 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <span>Peringatan Stok Kritis ({lowStockProducts.length} Item Mendekati Batas Habis)</span>
                  <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-full font-bold">
                    &le; {lowStockThreshold} unit
                  </span>
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  Stok barang berikut hampir habis. Segera lakukan kulakan / pembelian bahan baku agar tidak menghambat penjualan.
                </p>
              </div>
            </div>

            <Link
              href="/inventory"
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Restok di Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {lowStockProducts.map((p) => (
              <div 
                key={p.id}
                className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-3 border border-rose-200 dark:border-rose-800 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</h4>
                  <p className="text-[10px] text-slate-500">Harga Beli: Rp {p.cost_price.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-1 rounded-lg">
                    Sisa {p.stock} pcs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4 KARTU METRIK EKSEKUTIF UTAMA (DENGAN DROPDOWN DISKON & NOTA) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Omset Berbasis Nota + Dropdown Diskon */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-sky-600" /> Total Omset Nota
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hari ini: <strong>Rp {todayRevenue.toLocaleString("id-ID")}</strong></span>
            <span className="font-black text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
              {todayInvoicesCount} Nota Hari Ini
            </span>
          </div>

          {/* Dropdown / Collapsible Nominal Diskon */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDiscountDropdown(!showDiscountDropdown)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Total Diskon: Rp {totalDiscounts.toLocaleString("id-ID")}</span>
              </span>
              {showDiscountDropdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDiscountDropdown && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs animate-in fade-in">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Omset Kotor (Sebelum Diskon):</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Rp {(totalRevenue + totalDiscounts).toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[11px] text-rose-600">
                  <span>Total Potongan Diskon:</span>
                  <strong>- Rp {totalDiscounts.toLocaleString("id-ID")}</strong>
                </div>
                <div className="flex justify-between items-center text-[11px] text-emerald-600 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                  <span>Omset Bersih Diterima:</span>
                  <span>Rp {totalRevenue.toLocaleString("id-ID")}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Terdapat {discountedTransactions.length} nota yang diberikan potongan harga promo kasir.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Total Uang Masuk Cash (Terlihat Nota Terbayarkan) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Uang Masuk Cash
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            Rp {totalCashReceived.toLocaleString("id-ID")}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <button
              onClick={() => setInvoiceModalType('cash')}
              className="font-black text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>{cashTransactionsCount} Nota Terbayar Cash</span>
              <Eye className="w-3 h-3" />
            </button>
            <span className="font-bold text-slate-400">{cashPercent}% Porsi</span>
          </div>

          <div className="text-[10px] text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-1.5 rounded-lg">
            Uang fisik tunai kasir siap setor/laci
          </div>
        </div>

        {/* Card 3: Total Uang Masuk Transfer & QRIS (Terlihat Nota Terbayarkan) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Uang Masuk Transfer
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            Rp {totalTransferReceived.toLocaleString("id-ID")}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <button
              onClick={() => setInvoiceModalType('transfer')}
              className="font-black text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>{transferTransactionsCount} Nota Terbayar Transfer</span>
              <Eye className="w-3 h-3" />
            </button>
            <span className="font-bold text-slate-400">{transferPercent}% Porsi</span>
          </div>

          <div className="text-[10px] text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-1.5 rounded-lg">
            Masuk rekening bank &amp; QRIS outlet
          </div>
        </div>

        {/* Card 4: Keuntungan Kotor (Gross Profit = Omset Nota - Total Harga Beli) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between opacity-90">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BadgePercent className="w-4 h-4" /> Keuntungan Kotor
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              Margin {grossMarginPercent}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            Rp {grossProfit.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] opacity-85 font-medium pt-2 border-t border-white/20">
            Omset Nota dikurangi Total HPP Bahan (Harga Beli)
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. LAPORAN PEMISAHAN KEUANGAN: CASH VS TRANSFER */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Laporan Keuangan Kas: Penerimaan vs Pengeluaran (Cash &amp; Transfer)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pemisahan tegas arus kas tunai fisik laci dengan mutasi rekening bank transfer agar pembukuan tidak tercampur.
            </p>
          </div>

          <Link
            href="/expenses"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            <span>+ Catat Biaya Operasional (Pilih Cash / Transfer)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Pembukuan Kas Tunai (Cash) */}
          <div className="p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                💵 Kas Tunai (Laci Outlet)
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Fisik Kasir
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Penerimaan Cash ({cashTransactionsCount} Nota):</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                  + Rp {totalCashReceived.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Pengeluaran Biaya Cash ({expenses.filter(e => (e.payment_method || 'cash') === 'cash').length} Item):</span>
                <strong className="text-rose-600 dark:text-rose-400 font-black">
                  - Rp {totalCashExpenses.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-sm">
                <span className="font-extrabold text-slate-900 dark:text-slate-100">Sisa Kas Tunai Bersih:</span>
                <span className={`font-black ${netCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  Rp {netCash.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Pembukuan Rekening Bank (Transfer & QRIS) */}
          <div className="p-5 rounded-2xl border-2 border-indigo-300 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                💳 Rekening Bank / QRIS (Non-Tunai)
              </span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                Rekening Toko
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Penerimaan Transfer ({transferTransactionsCount} Nota):</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                  + Rp {totalTransferReceived.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Pengeluaran Biaya Transfer ({expenses.filter(e => e.payment_method === 'transfer').length} Item):</span>
                <strong className="text-rose-600 dark:text-rose-400 font-black">
                  - Rp {totalTransferExpenses.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-center text-sm">
                <span className="font-extrabold text-slate-900 dark:text-slate-100">Sisa Kas Rekening Bersih:</span>
                <span className={`font-black ${netTransfer >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                  Rp {netTransfer.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Rincian Nota Terbayarkan (Cash / Transfer) */}
      {invoiceModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setInvoiceModalType(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                {invoiceModalType === 'cash' ? <Wallet className="w-5 h-5 text-emerald-600" /> : <CreditCard className="w-5 h-5 text-indigo-600" />}
                Daftar Nota Terbayarkan: {invoiceModalType === 'cash' ? 'Pembayaran Cash' : 'Pembayaran Transfer & QRIS'}
              </h3>
              <p className="text-xs text-slate-500">
                Total {invoiceModalType === 'cash' ? cashTransactions.length : transferTransactions.length} nota terbayarkan masuk ke kas ini.
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {(invoiceModalType === 'cash' ? cashTransactions : transferTransactions).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{tx.invoice_number}</div>
                    <div className="text-[11px] text-slate-400">
                      {tx.customer_name || "Pelanggan Umum"} • Kasir: {tx.cashier_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 dark:text-slate-100">
                      Rp {tx.paid_amount.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInvoiceModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Line Chart: Tren Omzet Berbasis Nota Kasir */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Grafik Omzet Berbasis Nota Transaksi
            </h2>
            <div className="mt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                {selectedPointIndex !== null ? `Omzet Nota (${activeLabel})` : "Omzet Nota Terakhir"}
              </span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Rp {activeVal.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Filter Option: Hari vs Bulan */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold self-start sm:self-auto">
            <button
              onClick={() => {
                setTrendViewMode('days7');
                setSelectedPointIndex(null);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                trendViewMode === 'days7'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Harian (7 Hari)
            </button>
            <button
              onClick={() => {
                setTrendViewMode('months7');
                setSelectedPointIndex(null);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                trendViewMode === 'months7'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Bulanan (7 Bulan)
            </button>
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="w-full pt-4">
          <div className="h-56 w-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="20" y1="30" x2="480" y2="30" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" />
              <line x1="20" y1="85" x2="480" y2="85" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" />
              <line x1="20" y1="140" x2="480" y2="140" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" />

              <polygon
                points={`40,140 ${points} 460,140`}
                className="fill-sky-500/10 dark:fill-sky-500/20"
              />

              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {chartValues.map((val, idx) => {
                const x = paddingX + (idx / (chartValues.length - 1 || 1)) * graphWidth;
                const y = 140 - (val / maxVal) * 110;
                const isSelected = selectedPointIndex === idx;

                return (
                  <g 
                    key={idx} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedPointIndex(idx)}
                  >
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? 8 : 5} 
                      className={`${
                        isSelected 
                          ? "fill-sky-600 stroke-white stroke-[3]" 
                          : "fill-white stroke-sky-600 stroke-[2.5] group-hover:r-7 transition-all"
                      }`} 
                    />
                    {isSelected && (
                      <g>
                        <rect
                          x={x - 45}
                          y={y - 30}
                          width="90"
                          height="22"
                          rx="6"
                          className="fill-slate-900 dark:fill-slate-100"
                        />
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          className="fill-white dark:fill-slate-900 text-[11px] font-black pointer-events-none"
                        >
                          Rp {val.toLocaleString("id-ID")}
                        </text>
                      </g>
                    )}
                    <text
                      x={x}
                      y={175}
                      textAnchor="middle"
                      className={`text-[11px] pointer-events-none ${
                        isSelected 
                          ? "fill-sky-600 dark:fill-sky-400 font-black text-xs" 
                          : "fill-slate-600 dark:fill-slate-400 font-extrabold"
                      }`}
                    >
                      {chartLabels[idx]}
                    </text>
                    <title>{`${chartLabels[idx]}: Rp ${val.toLocaleString("id-ID")}`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 4. LAPORAN STOK SETELAH PROMO DIADAKAN */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Laporan Stok Setelah Promo Diadakan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoring perputaran sisa stok dan unit terjual sejak instruksi promo CRM dijalankan oleh kasir.
            </p>
          </div>

          <Link
            href="/crm"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>+ Buat Instruksi Promo CRM Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {promoInstructions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Belum ada promo yang diadakan. Buat instruksi promo di menu CRM untuk mendorong perputaran stok barang/menu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoInstructions.map((pi) => {
              const currentProduct = productsServices.find((p) => p.id === pi.product_id);
              const initialStock = pi.stock;
              const currentStock = currentProduct ? currentProduct.stock : pi.stock;
              const unitsSold = Math.max(0, initialStock - currentStock);
              const turnoverPercent = initialStock > 0 ? Math.min(100, Math.round((unitsSold / initialStock) * 100)) : 0;

              return (
                <div
                  key={pi.id}
                  className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/10 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {pi.status === "active" ? "🟢 Promo Aktif" : "⚪ Promo Selesai"}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {pi.product_name}
                      </h3>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                      Terjual {unitsSold} Unit
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                    &ldquo;{pi.promo_message}&rdquo;
                  </p>

                  {/* Progress Bar Penyerapan Stok */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Stok Awal: <strong>{initialStock}</strong></span>
                      <span className="text-slate-900 dark:text-slate-100 font-black">
                        Sisa Stok Sekarang: <span className="text-emerald-600 dark:text-emerald-400">{currentStock} pcs</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${turnoverPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Perputaran Stok: {turnoverPercent}% terserap</span>
                      <span>{currentStock <= 5 ? "⚠️ Mendekati Habis" : "Stok Aman"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LAPORAN EFEKTIVITAS CRM & WA REMINDER (RINGKASAN EKSEKUTIF TANPA DAFTAR NAMA) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-purple-600" />
              Laporan Kinerja CRM &amp; Retensi Pelanggan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekapitulasi pesan reminder WhatsApp, total omset yang terkonversi, dan keuntungan kotor yang dihasilkan.
            </p>
          </div>
          <Link
            href="/crm"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Buka Modul CRM Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* 1. Total WA Terkirim */}
          <div className="p-5 rounded-2xl border border-purple-100 dark:border-purple-950 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/20 space-y-1">
            <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
              1. Total WA Terkirim
            </span>
            <p className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-100">
              {totalWaSent} <span className="text-sm font-semibold text-slate-500">Pesan</span>
            </p>
            <span className="text-[11px] text-slate-400 block pt-1">
              Pesan reminder dormant, lost &amp; promo terkirim
            </span>
          </div>

          {/* 2. Total Omset yang Dihasilkan */}
          <div className="p-5 rounded-2xl border border-sky-100 dark:border-sky-950 bg-gradient-to-br from-sky-50/50 to-blue-50/30 dark:from-sky-950/20 dark:to-blue-950/20 space-y-1">
            <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider block">
              2. Total Omset Dihasilkan
            </span>
            <p className="text-2xl sm:text-3xl font-black text-sky-900 dark:text-sky-100">
              Rp {crmConvertedAmount.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-400 block pt-1">
              Dari {crmConvertedCount} transaksi pelanggan yang kembali berkunjung
            </span>
          </div>

          {/* 3. Keuntungan Kotor yang Dihasilkan */}
          <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                3. Keuntungan Kotor Dihasilkan
              </span>
              <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                Margin {crmGrossProfitMargin}%
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              Rp {crmGrossProfit.toLocaleString("id-ID")}
            </p>
            <span className="text-[11px] text-slate-400 block pt-1">
              Omset CRM dikurangi modal/HPP harga beli bahan
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

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
  Clock
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OwnerDashboard() {
  const { 
    tenant, 
    totalRevenue, 
    totalHPP, 
    totalCashReceived,
    totalTransferReceived,
    transactions,
    productsServices,
    promoInstructions,
    totalWaSent,
    crmConvertedCount,
    crmConvertedAmount
  } = useTenant();

  // Mode Tampilan Tren Omset: HARI (7 Hari Terakhir) vs BULAN (7 Bulan Terakhir)
  const [trendViewMode, setTrendViewMode] = useState<'days7' | 'months7'>('days7');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

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

  // 3. Olah Data Tren Omset Berbasis Nota
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
            Ringkasan omset berbasis nota kasir harian, penerimaan uang masuk, dan perputaran stok promo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/pos"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Buka Kasir POS</span>
          </Link>
        </div>
      </div>

      {/* 2. NOTIFIKASI STOK MENDEKATI BATAS (Mendekati Batas Kritis <= 5 Pcs) */}
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

      {/* 1 & 4. RINGKASAN FINANSIAL BERBASIS NOTA & KEUNTUNGAN KOTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Omset Berbasis Nota */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-sky-600" /> Total Omset Nota
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hari ini: Rp {todayRevenue.toLocaleString("id-ID")}</span>
            <span className="font-bold text-sky-600">{todayInvoicesCount} Nota</span>
          </div>
        </div>

        {/* Card 2: Total Uang Masuk Cash (Tunai Fisik di Laci) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Uang Masuk Cash
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            Rp {totalCashReceived.toLocaleString("id-ID")}
          </p>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Uang Tunai Fisik Kasir</span>
            <span className="font-bold text-emerald-600">{cashPercent}% Porsi</span>
          </div>
        </div>

        {/* Card 3: Total Uang Masuk Transfer & QRIS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Uang Masuk Transfer
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            Rp {totalTransferReceived.toLocaleString("id-ID")}
          </p>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Rekening Bank &amp; QRIS</span>
            <span className="font-bold text-indigo-600">{transferPercent}% Porsi</span>
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
          <p className="text-[11px] opacity-85 font-medium pt-1 border-t border-white/20">
            Omset Nota - Total HPP (Harga Beli)
          </p>
        </div>

      </div>

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

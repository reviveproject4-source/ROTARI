"use client";

import { useTenant } from "@/lib/tenant-context";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  MessageSquareText, 
  Building2,
  Wallet,
  CreditCard,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OwnerDashboard() {
  const { 
    tenant, 
    totalRevenue, 
    totalHPP, 
    totalOperationalExpenses, 
    netProfit, 
    totalCashReceived,
    totalTransferReceived,
    transactions,
    totalWaSent,
    crmConvertedCount,
    crmConvertedAmount
  } = useTenant();

  // REVISI TREN OMSET: Pilihan HARI (7 Hari Sebelumnya) vs BULAN (7 Bulan Sebelumnya)
  const [trendViewMode, setTrendViewMode] = useState<'days7' | 'months7'>('days7');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const now = new Date();
  const dailyDataMap: { [label: string]: number } = {};

  if (trendViewMode === 'days7') {
    // 7 Hari Sebelumnya
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
      dailyDataMap[dateKey] = 0;
    }

    transactions.forEach((tx) => {
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
    // 7 Bulan Sebelumnya
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      dailyDataMap[monthKey] = 0;
    }

    transactions.forEach((tx) => {
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

  // SVG Line chart points with padding so dots align 100% precisely with text labels below
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
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Dashboard Utama Owner
          </h1>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Omset */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Omset</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Dari {transactions.length} transaksi kasir</span>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            Rp {totalOperationalExpenses.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Biaya Fixed &amp; Variable Costs</span>
        </div>

        {/* Margin Bersih */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between opacity-90">
            <span className="text-xs font-extrabold uppercase tracking-wider">Margin Bersih (Net Profit)</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black tracking-tight">
            Rp {netProfit.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] opacity-80 font-medium">
            Omset - HPP - Operational Costs
          </p>
        </div>

        {/* Total Cash & Transfer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Penerimaan Cash &amp; Transfer
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Cash (Tunai)
              </span>
              <span>Rp {totalCashReceived.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" /> Transfer / QRIS
              </span>
              <span>Rp {totalTransferReceived.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Line Chart: Omzet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Omzet
            </h2>
            <div className="mt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                {selectedPointIndex !== null ? `Omzet (${activeLabel})` : "Omzet Terakhir"}
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
              Hari
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
              Bulan
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

      {/* CRM Conversion Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-purple-600" />
              Laporan Konversi CRM &amp; Reminder Terkirim
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statistik omset yang terkonversi langsung dari pengiriman WA reminder kasir.
            </p>
          </div>
          <Link
            href="/crm"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            Lihat Laporan CRM <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-purple-100 dark:border-purple-950 bg-purple-50/40 dark:bg-purple-950/20">
            <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 uppercase">Pesan WA Terkirim</span>
            <p className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-1">{totalWaSent} Pesan</p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase">Pelanggan Kembali Transaksi</span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{crmConvertedCount} Konversi</p>
          </div>

          <div className="p-4 rounded-2xl border border-sky-100 dark:border-sky-950 bg-sky-50/40 dark:bg-sky-950/20">
            <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 uppercase">Total Omset Hasil CRM</span>
            <p className="text-2xl font-black text-sky-900 dark:text-sky-100 mt-1">Rp {crmConvertedAmount.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

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
  Check,
  Upload,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { PosInvoiceSection } from "@/components/pos-invoice-section";

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
    crmConvertedAmount,
    importCustomers,
    approveSpecialDiscount,
    rejectSpecialDiscount,
    users
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

  // Modal Import Konsumen POS & Modal Export Laporan
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Filter Ekspor Laporan: Periode, Status Bayar, Cabang, Kasir
  const [exportMonth, setExportMonth] = useState<string>("all");
  const [exportPaymentStatus, setExportPaymentStatus] = useState<string>("all");
  const [exportBranch, setExportBranch] = useState<string>("all");
  const [exportCashier, setExportCashier] = useState<string>("all");

  // State Universal Multi-POS Customer Importer
  const [importPreset, setImportPreset] = useState<string>("auto");
  const [importRawText, setImportRawText] = useState<string>("");
  const [importFileName, setImportFileName] = useState<string>("");
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Pengajuan Diskon Special yang Menunggu ACC Owner
  const pendingDiscountRequests = transactions.filter(
    (tx) => tx.discount_special_requested && tx.discount_special_status === "pending"
  );

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

  // 5. Opsi Filter Laporan & Ringkasan Metrik Sesuai Instruksi Owner
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      set.add(key);
    });
    return Array.from(set).sort().reverse().map((key) => {
      const [year, month] = key.split("-");
      const d = new Date(Number(year), Number(month) - 1, 1);
      return {
        key,
        label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      };
    });
  }, [transactions]);

  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.branch_name || "Outlet Utama"));
    return Array.from(set).sort();
  }, [transactions]);

  const availableCashiers = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.cashier_name) set.add(tx.cashier_name);
    });
    users.forEach((u) => {
      if (u.name) set.add(u.name);
    });
    return Array.from(set).sort();
  }, [transactions, users]);

  // Filtered transactions for report
  const reportFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (exportPaymentStatus !== "all" && tx.status !== exportPaymentStatus) return false;
      if (exportMonth !== "all") {
        const d = new Date(tx.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== exportMonth) return false;
      }
      if (exportBranch !== "all") {
        const branch = tx.branch_name || "Outlet Utama";
        if (branch !== exportBranch) return false;
      }
      if (exportCashier !== "all" && tx.cashier_name !== exportCashier) return false;
      return true;
    });
  }, [transactions, exportPaymentStatus, exportMonth, exportBranch, exportCashier]);

  // Mandatory Header Metrics for Report
  const reportTotalOmset = useMemo(() => {
    return reportFilteredTransactions.reduce(
      (sum, tx) => sum + (tx.status !== "cancelled" ? tx.total_amount : 0),
      0
    );
  }, [reportFilteredTransactions]);

  const reportTotalWaSent = useMemo(() => {
    return reportFilteredTransactions.filter(
      (tx) => tx.status !== "cancelled" && (tx.crm_attributed_log_id || (tx.customer_phone && tx.total_amount > 0))
    ).length;
  }, [reportFilteredTransactions]);

  const reportTotalHPP = useMemo(() => {
    return reportFilteredTransactions
      .filter((tx) => tx.status !== "cancelled")
      .reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + (i.cost_price || 0) * (i.quantity || 1), 0), 0);
  }, [reportFilteredTransactions]);

  const reportGrossProfit = reportTotalOmset - reportTotalHPP;
  const reportGrossMarginPercent = reportTotalOmset > 0
    ? ((reportGrossProfit / reportTotalOmset) * 100).toFixed(1)
    : "0";

  const handleExportReportCSV = () => {
    const headerLines = [
      `LAPORAN KINERJA TRANSAKSI & NOTA - ${tenant.business_name.toUpperCase()}`,
      `Filter Periode: ${exportMonth === 'all' ? 'Semua Periode' : exportMonth}`,
      `Filter Status Bayar: ${exportPaymentStatus === 'all' ? 'Semua Status' : exportPaymentStatus.toUpperCase()}`,
      `Filter Cabang: ${exportBranch === 'all' ? 'Semua Cabang' : exportBranch}`,
      `Filter Kasir: ${exportCashier === 'all' ? 'Semua Kasir' : exportCashier}`,
      `Tanggal Unduh: ${new Date().toLocaleString("id-ID")}`,
      "",
      `RINGKASAN METRIK LAPORAN (HEADER):`,
      `1. Total Omset: Rp ${reportTotalOmset.toLocaleString("id-ID")}`,
      `2. Total WA Terkirim (Nota Konsumen Kembali): ${reportTotalWaSent} Pesan`,
      `3. Jumlah Margin Kotor: Rp ${reportGrossProfit.toLocaleString("id-ID")} (${reportGrossMarginPercent}%)`,
      "",
      "No Invoice,Tanggal,Pelanggan,No WhatsApp,Cabang,Nama Kasir,Status Bayar,Subtotal,Diskon,Total Tagihan,Dibayar,Sisa Belum Terbayar,Margin Kotor",
    ];

    const dataRows = reportFilteredTransactions.map((tx) => {
      const itemsHpp = tx.items.reduce((sum, i) => sum + (i.cost_price || 0) * (i.quantity || 1), 0);
      const grossMargin = tx.total_amount - itemsHpp;
      const sisa = tx.total_amount - tx.paid_amount;
      return [
        `"${tx.invoice_number}"`,
        `"${new Date(tx.created_at).toLocaleDateString("id-ID")}"`,
        `"${tx.customer_name}"`,
        `"${tx.customer_phone || "-"}"`,
        `"${tx.branch_name || "Outlet Utama"}"`,
        `"${tx.cashier_name}"`,
        `"${tx.status.toUpperCase()}"`,
        tx.subtotal,
        tx.discount_amount,
        tx.total_amount,
        tx.paid_amount,
        sisa,
        grossMargin,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [...headerLines, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan_transaksi_${exportMonth}_${exportPaymentStatus}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDashboardFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setImportRawText(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteDashboardImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importRawText.trim()) return;

    const lines = importRawText.trim().split("\n");
    const toImport: any[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.toLowerCase().startsWith("nama") || trimmed.toLowerCase().startsWith("customer")) return;

      const delimiter = trimmed.includes("\t") ? "\t" : trimmed.includes(";") ? ";" : ",";
      const parts = trimmed.split(delimiter).map((p) => p.replace(/^["']|["']$/g, "").trim());

      if (parts.length >= 2) {
        let name = parts[0] || "Konsumen";
        let rawPhone = parts[1] || "";
        let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
        if (cleanPhone.startsWith("62")) cleanPhone = "0" + cleanPhone.slice(2);
        else if (cleanPhone.startsWith("8")) cleanPhone = "0" + cleanPhone;

        if (cleanPhone.length >= 9) {
          toImport.push({
            name,
            phone: cleanPhone,
            email: parts[2] && parts[2].includes("@") ? parts[2] : undefined,
            address: parts[3] || undefined,
            total_spent: Number(parts[4]) || 0,
            notes: `Import POS Dashboard (${importPreset.toUpperCase()})`,
          });
        }
      }
    });

    if (toImport.length > 0) {
      const count = importCustomers(toImport);
      setImportSuccessCount(count);
      setImportRawText("");
      setImportFileName("");
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccessCount(null);
      }, 2500);
    }
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="#pos-invoice-section"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Buat Nota Sekarang</span>
          </a>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Import Konsumen POS</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            <span>Filter &amp; Ekspor Laporan</span>
          </button>

          <Link
            href="/crm"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Modul CRM</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* NOTIFIKASI PERSETUJUAN DISKON SPECIAL KASIR (APPROVAL OWNER) */}
      {/* ======================================================== */}
      {pendingDiscountRequests.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/20 rounded-3xl p-5 border-2 border-rose-400 dark:border-rose-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-900 dark:text-rose-100 flex items-center gap-2">
                  <span>Permintaan Diskon Special Kasir Menunggu Persetujuan</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {pendingDiscountRequests.length} Menunggu ACC
                  </span>
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Kasir mengajukan potongan diskon khusus. Konfirmasi untuk menyetujui atau menolak.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingDiscountRequests.map((req) => {
              const cashier = users.find((u) => u.id === req.cashier_id);
              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">
                          Nota #{req.id.slice(-6).toUpperCase()}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {req.customer_name || "Pelanggan Umum"}
                        </h4>
                      </div>
                      <span className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        Total Rp {req.total_amount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Kasir: <strong>{cashier?.name || "Kasir"}</strong></span>
                        <span>DP: Rp {(req.dp_amount || 0).toLocaleString("id-ID")}</span>
                      </div>
                      <p className="italic text-rose-700 dark:text-rose-400 font-medium">
                        &ldquo;{req.discount_special_note || "Permohonan diskon khusus pelanggan"}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => rejectSpecialDiscount(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => approveSpecialDiscount(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui Diskon</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      {/* SECTION KASIR POS: PILIH PRODUK RITEL & LAYANAN JASA + FORM BUAT NOTA */}
      {/* ======================================================== */}
      <div id="pos-invoice-section" className="bg-gradient-to-br from-white via-slate-50 to-sky-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-sky-950/20 rounded-3xl p-6 border-2 border-sky-300 dark:border-sky-800 shadow-lg space-y-4">
        <PosInvoiceSection showTitle={true} />
      </div>

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

      {/* ======================================================== */}
      {/* MODAL FILTER & EKSPOR LAPORAN POS */}
      {/* ======================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Filter className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                    Filter &amp; Ekspor Laporan Transaksi POS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saring data laporan berdasarkan periode bulan, status pembayaran, cabang, dan kasir pelaksana.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Pilihan Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {/* 1. Periode Bulan */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Periode (Bulan)
                </label>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Periode</option>
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key}>
                      Bulan: {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Status Bayar */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Status Pembayaran
                </label>
                <select
                  value={exportPaymentStatus}
                  onChange={(e) => setExportPaymentStatus(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Status Bayar</option>
                  <option value="paid">Lunas Penuh</option>
                  <option value="dp">Ada DP / Belum Lunas</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* 3. Cabang */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Cabang Outlet
                </label>
                <select
                  value={exportBranch}
                  onChange={(e) => setExportBranch(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Cabang</option>
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Kasir / Pegawai */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  Kasir / Pegawai
                </label>
                <select
                  value={exportCashier}
                  onChange={(e) => setExportCashier(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Semua Kasir</option>
                  {availableCashiers.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* HEADER LAPORAN (WAJIB: Total Omset, Total WA Terkirim, Margin Kotor) */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/20 p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Ringkasan Eksekutif Header Laporan Terfilter:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Total Omset */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  <span className="text-[11px] font-bold text-slate-500 block">Jumlah Total Omset</span>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Rp {reportTotalOmset.toLocaleString("id-ID")}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {reportFilteredTransactions.length} nota transaksi
                  </span>
                </div>

                {/* 2. Total WA Terkirim */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900">
                  <span className="text-[11px] font-bold text-slate-500 block">Total WA Terkirim</span>
                  <p className="text-xl font-black text-teal-700 dark:text-teal-300">
                    {reportTotalWaSent} Pesan
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Berdasarkan nota konsumen kembali
                  </span>
                </div>

                {/* 3. Jumlah Margin Kotor */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-200 dark:border-sky-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 block">Jumlah Margin Kotor</span>
                    <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded">
                      {reportGrossMarginPercent}%
                    </span>
                  </div>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    Rp {reportGrossProfit.toLocaleString("id-ID")}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Omset dikurangi HPP beli bahan
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Tabel Transaksi Terfilter */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">No. Nota</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Kasir</th>
                      <th className="py-2.5 px-3">Konsumen</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">DP (Uang Muka)</th>
                      <th className="py-2.5 px-3 text-right">Sisa Belum Bayar</th>
                      <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {reportFilteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                          Tidak ada transaksi yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      reportFilteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {tx.invoice_number}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500">
                            {new Date(tx.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{tx.cashier_name}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                            {tx.customer_name || "Pelanggan Umum"}
                          </td>
                          <td className="py-2.5 px-3">
                            {tx.status === "cancelled" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Batal
                              </span>
                            ) : (tx.remaining_amount || 0) > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                DP (Sisa Rp {(tx.remaining_amount || 0).toLocaleString("id-ID")})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Lunas
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                            Rp {(tx.dp_amount || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                            Rp {(tx.remaining_amount || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                            Rp {tx.total_amount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan <strong>{reportFilteredTransactions.length}</strong> transaksi dari total {transactions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Laporan</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportReportCSV}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File CSV / Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL UNIVERSAL MULTI-POS CUSTOMER IMPORTER */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 relative">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportSuccessCount(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                    Import Data Konsumen dari POS Lain
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pindahkan database pelanggan Anda dari Moka, Pawoon, Majoo, Olsera, Kasir Pintar, atau file Excel/CSV.
                  </p>
                </div>
              </div>
            </div>

            {importSuccessCount !== null && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Alhamdulillah! Berhasil mengimpor <strong>{importSuccessCount}</strong> data konsumen ke database Radar Toko.
                </span>
              </div>
            )}

            <form onSubmit={handleExecuteDashboardImport} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Pilih Format Aplikasi POS Asal:
                </label>
                <select
                  value={importPreset}
                  onChange={(e) => setImportPreset(e.target.value)}
                  className="w-full font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="auto">Deteksi Otomatis (Semua Format)</option>
                  <option value="moka">Moka POS (Export Pelanggan)</option>
                  <option value="pawoon">Pawoon POS (CSV Customer)</option>
                  <option value="majoo">Majoo (Daftar Pelanggan)</option>
                  <option value="olsera">Olsera POS (Kontak Pelanggan)</option>
                  <option value="kasirpintar">Kasir Pintar (Database Kontak)</option>
                  <option value="excel">File Excel / CSV Bebas (Nama, Telepon, Email, Alamat, Total Belanja)</option>
                </select>
              </div>

              {/* Upload File Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Pilih File CSV / TXT / TSV:</span>
                  {importFileName && (
                    <span className="text-[10px] text-sky-600 font-mono">
                      File: {importFileName}
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".csv, .txt, .tsv"
                  onChange={handleDashboardFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-2"
                />
              </div>

              {/* Atau Paste Teks Langsung */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Atau Salin &amp; Tempel (Paste) Teks dari Spreadsheet Excel di sini:
                </label>
                <textarea
                  rows={6}
                  value={importRawText}
                  onChange={(e) => setImportRawText(e.target.value)}
                  placeholder="Nama Pelanggan, No Telepon / WhatsApp, Email, Alamat, Total Belanja
Budi Santoso, 08123456789, budi@email.com, Jl. Melati No. 12, 450000
Siti Aminah, 08571234567, siti@email.com, Jl. Kenanga No. 5, 250000"
                  className="w-full font-mono text-[11px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[10px] text-slate-400">
                  Format otomatis menyesuaikan pemisah koma (,), titik koma (;), atau tab dari copy-paste tabel Excel.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportSuccessCount(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!importRawText.trim()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Mulai Import Data Konsumen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useTenant } from "@/lib/tenant-context";
import Link from "next/link";
import { 
  MessageSquareText, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Send, 
  Calendar,
  AlertTriangle,
  Package,
  Sparkles,
  ArrowRight,
  Bell,
  Download,
  Printer,
  Filter,
  DollarSign,
  Receipt,
  Building2,
  UserCheck,
  Check,
  Clock,
  RotateCcw,
  Upload,
  ArrowUpRight
} from "lucide-react";

export default function OwnerCrmPage() {
  const { 
    tenant,
    crmLogs, 
    totalWaSent, 
    crmConvertedCount, 
    crmConvertedAmount,
    productsServices,
    promoInstructions,
    addPromoInstruction,
    transactions,
    users
  } = useTenant();

  // Navigation Tabs within CRM & Reports
  const [activeTab, setActiveTab] = useState<"report" | "crm_funnel" | "stock_promo">("report");

  // ==========================================
  // 1. FILTER CONTROLS FOR EXPORT & REPORT
  // ==========================================
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCashier, setSelectedCashier] = useState<string>("all");

  // Dynamically compute available months from transaction data
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

  // Dynamically compute available branches from transaction data
  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      set.add(tx.branch_name || "Outlet Utama");
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Dynamically compute available cashiers/staff
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

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedMonth("all");
    setSelectedPaymentStatus("all");
    setSelectedBranch("all");
    setSelectedCashier("all");
  };

  // ==========================================
  // 2. FILTERED TRANSACTIONS
  // ==========================================
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Status Bayar filter
      if (selectedPaymentStatus !== "all" && tx.status !== selectedPaymentStatus) {
        return false;
      }

      // 2. Bulan / Periode filter
      if (selectedMonth !== "all") {
        const d = new Date(tx.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== selectedMonth) return false;
      }

      // 3. Cabang filter
      if (selectedBranch !== "all") {
        const branch = tx.branch_name || "Outlet Utama";
        if (branch !== selectedBranch) return false;
      }

      // 4. Kasir / Pegawai filter
      if (selectedCashier !== "all") {
        if (tx.cashier_name !== selectedCashier) return false;
      }

      return true;
    });
  }, [transactions, selectedPaymentStatus, selectedMonth, selectedBranch, selectedCashier]);

  // ==========================================
  // 3. MANDATORY HEADER REPORT METRICS
  // ==========================================
  // Metric 1: Jumlah Total Omset
  const totalFilteredOmset = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, tx) => sum + (tx.status !== "cancelled" ? tx.total_amount : 0),
      0
    );
  }, [filteredTransactions]);

  // Metric 2: Total WA Terkirim (Berdasarkan Nota Konsumen Kembali)
  const convertedTxCount = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      if (tx.status === "cancelled") return false;
      if (tx.crm_attributed_log_id) return true;
      return crmLogs.some(
        (l) => l.is_converted && (l.customer_id === tx.customer_id || l.converted_transaction_id === tx.id)
      );
    }).length;
  }, [filteredTransactions, crmLogs]);

  const filteredWaSentCount = useMemo(() => {
    if (selectedMonth === "all") return crmLogs.length;
    return crmLogs.filter((l) => {
      const d = new Date(l.sent_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === selectedMonth;
    }).length;
  }, [crmLogs, selectedMonth]);

  // Metric 3: Jumlah Margin Kotor yang Dihasilkan (Omset - HPP Bahan)
  const totalFilteredHPP = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => {
      if (tx.status === "cancelled") return sum;
      return sum + tx.items.reduce((acc, it) => acc + (it.cost_price * it.quantity), 0);
    }, 0);
  }, [filteredTransactions]);

  const totalFilteredGrossMargin = totalFilteredOmset - totalFilteredHPP;
  const grossMarginPercent = totalFilteredOmset > 0 
    ? ((totalFilteredGrossMargin / totalFilteredOmset) * 100).toFixed(1) 
    : "0";

  // Cash vs Transfer received in filtered transactions
  const filteredCash = filteredTransactions
    .filter((tx) => tx.status !== "cancelled" && tx.payment_method === "cash")
    .reduce((sum, tx) => sum + tx.paid_amount, 0);

  const filteredTransfer = filteredTransactions
    .filter((tx) => tx.status !== "cancelled" && (tx.payment_method === "transfer" || tx.payment_method === "qris"))
    .reduce((sum, tx) => sum + tx.paid_amount, 0);

  // ==========================================
  // 4. EXPORT HANDLERS (EXCEL / CSV & PRINT)
  // ==========================================
  const handleExportCsv = () => {
    const selectedMonthLabel = selectedMonth === "all" 
      ? "Semua Bulan" 
      : (availableMonths.find((m) => m.key === selectedMonth)?.label || selectedMonth);

    const selectedStatusLabel = selectedPaymentStatus === "all" 
      ? "Semua Status" 
      : selectedPaymentStatus === "paid" 
      ? "Lunas" 
      : selectedPaymentStatus === "partially_paid" 
      ? "DP (Uang Muka / Sebagian)" 
      : "Belum Lunas";

    const filterHeaderLines = [
      `LAPORAN TRANSAKSI & HASIL RETENSI CRM - RADAR TOKO`,
      `Nama Usaha: ${tenant.business_name}`,
      `Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} ${new Date().toLocaleTimeString("id-ID")}`,
      `Filter Periode (Bulan): ${selectedMonthLabel}`,
      `Filter Status Bayar: ${selectedStatusLabel}`,
      `Filter Cabang: ${selectedBranch === "all" ? "Semua Cabang" : selectedBranch}`,
      `Filter Kasir / Pegawai: ${selectedCashier === "all" ? "Semua Kasir / Pegawai" : selectedCashier}`,
      ``,
      `HEADER LAPORAN UTAMA:`,
      `1. Jumlah Total Omset: Rp ${totalFilteredOmset.toLocaleString("id-ID")} (${filteredTransactions.length} Nota Transaksi)`,
      `2. Total WA Terkirim (Berdasarkan Nota Konsumen Kembali): ${convertedTxCount} Nota Pelanggan Kembali (dari ${filteredWaSentCount} Pesan WA Terkirim)`,
      `3. Jumlah Margin Kotor yang Dihasilkan: Rp ${totalFilteredGrossMargin.toLocaleString("id-ID")} (Margin Kotor: ${grossMarginPercent}%)`,
      `Rincian HPP Bahan (Harga Beli): Rp ${totalFilteredHPP.toLocaleString("id-ID")}`,
      `Total Uang Masuk Cash: Rp ${filteredCash.toLocaleString("id-ID")} | Transfer/QRIS: Rp ${filteredTransfer.toLocaleString("id-ID")}`,
      ``,
      `DAFTAR NOTA TRANSAKSI TERFILTER:`,
      [
        "No",
        "Nomor Nota",
        "Tanggal Transaksi",
        "Cabang",
        "Kasir / Pegawai",
        "Nama Konsumen",
        "Nomor WhatsApp",
        "Status Bayar",
        "Tahap Bayar",
        "Metode Pembayaran",
        "Atribusi WA CRM",
        "Total Omset (Rp)",
        "Total HPP Bahan (Rp)",
        "Margin Kotor (Rp)",
        "Margin (%)"
      ].join(",")
    ];

    const dataRows = filteredTransactions.map((tx, idx) => {
      const txHpp = tx.items.reduce((acc, it) => acc + (it.cost_price * it.quantity), 0);
      const txMargin = tx.total_amount - txHpp;
      const txMarginPct = tx.total_amount > 0 ? ((txMargin / tx.total_amount) * 100).toFixed(1) : "0";
      const isCrmReturn = tx.crm_attributed_log_id || crmLogs.some(
        (l) => l.is_converted && (l.customer_id === tx.customer_id || l.converted_transaction_id === tx.id)
      );

      const statusIndo = tx.status === "paid" 
        ? "Lunas" 
        : tx.status === "partially_paid" 
        ? "DP (Sebagian)" 
        : tx.status === "unpaid" 
        ? "Belum Lunas" 
        : "Batal";

      return [
        idx + 1,
        `"${tx.invoice_number}"`,
        `"${new Date(tx.created_at).toLocaleDateString("id-ID")} ${new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}"`,
        `"${tx.branch_name || "Outlet Utama"}"`,
        `"${tx.cashier_name}"`,
        `"${tx.customer_name || "-"}"`,
        `"${tx.customer_phone || "-"}"`,
        `"${statusIndo}"`,
        `"${tx.payment_stage === "dp" ? "DP" : "Lunas Full"}"`,
        `"${tx.payment_method.toUpperCase()}"`,
        `"${isCrmReturn ? "Ya (Nota Konsumen Kembali)" : "Organik / Bukan WA"}"`,
        tx.total_amount,
        txHpp,
        txMargin,
        `"${txMarginPct}%"`
      ].join(",");
    });

    // \uFEFF is UTF-8 BOM so Indonesian Excel directly renders accents and columns properly
    const fullCsv = "\uFEFF" + [...filterHeaderLines, ...dataRows].join("\n");
    const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_penjualan_crm_${selectedMonth !== "all" ? selectedMonth : "semua"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // 5. EXISTING CRM FUNNEL & PROMO CONTROLS
  // ==========================================
  const dormantDays = tenant.reminder_rules?.dormant_days ?? 30;
  const lostDays = tenant.reminder_rules?.lost_days ?? 60;

  const slowStockItems = productsServices.filter(
    (ps) =>
      ps.is_dead_stock ||
      (ps.type === "product" && ps.stock > 25) ||
      (ps.type === "service" && (!ps.last_sold_at || (Date.now() - new Date(ps.last_sold_at).getTime()) > 14 * 86400000))
  );

  const convertedRate = totalWaSent > 0 ? (crmConvertedCount / totalWaSent) * 100 : 0;
  const averageConvertedValue = crmConvertedCount > 0 ? crmConvertedAmount / crmConvertedCount : 0;
  const totalRevenueForCrm = crmLogs.reduce((sum, log) => sum + (log.is_converted ? (log.converted_amount || 0) : 0), 0);

  const [selectedProductId, setSelectedProductId] = useState<string>(slowStockItems[0]?.id || "");
  const [promoMessageInput, setPromoMessageInput] = useState<string>("");
  const [sentSuccessAlert, setSentSuccessAlert] = useState<boolean>(false);

  const selectedProduct = productsServices.find((p) => p.id === selectedProductId);

  const handleSendPromoToCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const messageToSend = promoMessageInput.trim() || `Beri promo diskon khusus 15%-20% untuk ${selectedProduct.name} karena perputaran stok lambat.`;

    addPromoInstruction({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      stock: selectedProduct.stock,
      promo_message: messageToSend,
    });

    setSentSuccessAlert(true);
    setPromoMessageInput("");
    setTimeout(() => setSentSuccessAlert(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 print:p-0 print:m-0">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider flex items-center gap-1">
              <Receipt className="w-3 h-3" /> Laporan Eksekutif Owner
            </span>
            <span className="text-xs text-slate-400">Radar Toko Financial &amp; CRM</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
            <MessageSquareText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Laporan Penjualan &amp; Hasil CRM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau total omset nota, nota kembali hasil reminder WhatsApp, dan margin kotor dengan filter lengkap serta ekspor ke Excel/PDF.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/cashier/customers"
            className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Konsumen POS</span>
          </Link>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            title="Download file CSV / Excel dengan Header Laporan"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Cetak atau simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Tab Bar Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3 print:hidden">
        <button
          onClick={() => setActiveTab("report")}
          className={`pb-3 px-3 text-xs font-black transition border-b-2 flex items-center gap-2 ${
            activeTab === "report"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Laporan Transaksi &amp; Ekspor Finansial</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
            {filteredTransactions.length} Nota
          </span>
        </button>

        <button
          onClick={() => setActiveTab("crm_funnel")}
          className={`pb-3 px-3 text-xs font-black transition border-b-2 flex items-center gap-2 ${
            activeTab === "crm_funnel"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Efektivitas CRM &amp; Log WA ({crmLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stock_promo")}
          className={`pb-3 px-3 text-xs font-black transition border-b-2 flex items-center gap-2 ${
            activeTab === "stock_promo"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Notifikasi Stok &amp; Promo Kasir</span>
          {slowStockItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {slowStockItems.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LAPORAN TRANSAKSI & EKSPOR FINANSIAL (PRIMARY) */}
      {/* ======================================================== */}
      {activeTab === "report" && (
        <div className="space-y-6">
          
          {/* Print Only Header Banner */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl font-black">{tenant.business_name} - Laporan Penjualan &amp; Hasil CRM</h1>
            <p className="text-xs text-slate-600">
              Periode: {selectedMonth === "all" ? "Semua Bulan" : availableMonths.find(m => m.key === selectedMonth)?.label} | 
              Status: {selectedPaymentStatus === "all" ? "Semua Status" : selectedPaymentStatus} | 
              Cabang: {selectedBranch === "all" ? "Semua Cabang" : selectedBranch} | 
              Kasir: {selectedCashier === "all" ? "Semua Kasir" : selectedCashier}
            </p>
          </div>

          {/* 1. FILTER BAR (Bulan, Status Bayar, Cabang, Kasir) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Filter Data Laporan &amp; Ekspor
                </h3>
              </div>

              {(selectedMonth !== "all" || selectedPaymentStatus !== "all" || selectedBranch !== "all" || selectedCashier !== "all") && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter 1: Periode (Bulan) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Periode (Bulan)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Periode Bulan</option>
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Status Bayar (Lunas, DP, Belum Lunas) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Status Bayar
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Status Bayar</option>
                  <option value="paid">✓ Lunas (Paid)</option>
                  <option value="partially_paid">⏳ DP / Uang Muka (Partially Paid)</option>
                  <option value="unpaid">⚠️ Belum Lunas (Unpaid)</option>
                </select>
              </div>

              {/* Filter 3: Cabang */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Cabang Outlet
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Cabang</option>
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 4: Nama Kasir / Pegawai */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Nama Kasir / Pegawai
                </label>
                <select
                  value={selectedCashier}
                  onChange={(e) => setSelectedCashier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Kasir / Pegawai</option>
                  {availableCashiers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. THE 3 MANDATORY HEADER REPORT METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Header Metric 1: Jumlah Total Omset */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-purple-500/30 dark:border-purple-600/30 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Jumlah Total Omset
                </span>
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600">
                  <Receipt className="w-5 h-5" />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-2">
                Rp {totalFilteredOmset.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span>{filteredTransactions.length} Nota Transaksi</span>
                <span className="text-[11px] text-purple-600 font-bold">
                  Cash: Rp {filteredCash.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Header Metric 2: Total WA Terkirim (Berdasarkan Nota Konsumen Kembali) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-500/30 dark:border-emerald-600/30 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Total WA Terkirim (Nota Konsumen Kembali)
                </span>
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                  <MessageSquareText className="w-5 h-5" />
                </span>
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-2">
                {convertedTxCount} <span className="text-base font-extrabold text-slate-600 dark:text-slate-400">Nota Kembali</span>
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <span>Dari {filteredWaSentCount} Pesan WA Terkirim</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  {filteredWaSentCount > 0 ? ((convertedTxCount / filteredWaSentCount) * 100).toFixed(1) : 0}% Konversi
                </span>
              </div>
            </div>

            {/* Header Metric 3: Jumlah Margin Kotor yang Dihasilkan */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-200">
                  Jumlah Margin Kotor yang Dihasilkan
                </span>
                <span className="p-2 rounded-xl bg-white/10 text-white">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <p className="text-3xl font-black tracking-tight mt-2 text-white">
                Rp {totalFilteredGrossMargin.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-purple-200 border-t border-white/15 pt-2.5">
                <span>HPP Bahan: Rp {totalFilteredHPP.toLocaleString("id-ID")}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[11px]">
                  {grossMarginPercent}% Margin
                </span>
              </div>
            </div>
          </div>

          {/* 3. FILTERED TRANSACTION DETAILS TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  Rincian Nota Transaksi ({filteredTransactions.length} Data)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar transaksi yang sesuai dengan kriteria filter aktif di atas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tabel CSV</span>
                </button>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-semibold">Tidak ada transaksi yang cocok dengan kombinasi filter.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Reset Filter Transaksi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pl-2">Nota &amp; Tanggal</th>
                      <th className="pb-3">Cabang &amp; Kasir</th>
                      <th className="pb-3">Pelanggan</th>
                      <th className="pb-3">Status Bayar</th>
                      <th className="pb-3">Atribusi WA CRM</th>
                      <th className="pb-3 text-right">Nilai Omset</th>
                      <th className="pb-3 text-right">HPP Bahan</th>
                      <th className="pb-3 text-right pr-2">Margin Kotor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.map((tx) => {
                      const txHpp = tx.items.reduce((acc, it) => acc + (it.cost_price * it.quantity), 0);
                      const txMargin = tx.total_amount - txHpp;
                      const txMarginPct = tx.total_amount > 0 ? ((txMargin / tx.total_amount) * 100).toFixed(1) : "0";
                      const isCrmReturn = tx.crm_attributed_log_id || crmLogs.some(
                        (l) => l.is_converted && (l.customer_id === tx.customer_id || l.converted_transaction_id === tx.id)
                      );

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 pl-2">
                            <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {tx.invoice_number}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })} • {new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>

                          <td className="py-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {tx.branch_name || "Outlet Utama"}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Kasir: {tx.cashier_name}
                            </div>
                          </td>

                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {tx.customer_name || "Pelanggan Umum"}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {tx.customer_phone || "-"}
                            </div>
                          </td>

                          <td className="py-3">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                                tx.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : tx.status === "partially_paid"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}>
                                {tx.status === "paid" ? "Lunas" : tx.status === "partially_paid" ? "DP (Sebagian)" : "Belum Lunas"}
                              </span>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                                {tx.payment_method}
                              </div>
                            </div>
                          </td>

                          <td className="py-3">
                            {isCrmReturn ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Konsumen Kembali (WA)</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Organik
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-right font-black text-slate-900 dark:text-slate-100">
                            Rp {tx.total_amount.toLocaleString("id-ID")}
                          </td>

                          <td className="py-3 text-right font-medium text-slate-500">
                            Rp {txHpp.toLocaleString("id-ID")}
                          </td>

                          <td className="py-3 text-right pr-2">
                            <div className="font-black text-emerald-600 dark:text-emerald-400">
                              Rp {txMargin.toLocaleString("id-ID")}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">
                              {txMarginPct}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CRM FUNNEL & LOG RIWAYAT WA TERKIRIM */}
      {/* ======================================================== */}
      {activeTab === "crm_funnel" && (
        <div className="space-y-6">
          {/* Summary Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total WA Terkirim</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                {totalWaSent} <span className="text-sm font-semibold text-slate-500">Pesan</span>
              </p>
              <span className="text-[11px] text-slate-400">Reminder Dormant &ge;{dormantDays} Hari / Lost &ge;{lostDays} Hari</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Jumlah Transaksi Terkonversi</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {crmConvertedCount} <span className="text-sm font-semibold text-slate-500">Transaksi</span>
              </p>
              <span className="text-[11px] text-slate-400">Pelanggan kembali berkunjung</span>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Total Omset Hasil CRM</span>
              <p className="text-3xl font-extrabold tracking-tight mt-2">
                Rp {crmConvertedAmount.toLocaleString("id-ID")}
              </p>
              <span className="text-[11px] opacity-80">Omset langsung hasil konversi WA</span>
            </div>
          </div>

          {/* CRM Funnel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Ringkasan Funnel Retensi CRM</h2>
              <span className="text-[11px] text-slate-400">Pesan WhatsApp → Kunjungan → Nota Transaksi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{convertedRate.toFixed(1)}%</p>
                <p className="text-[11px] text-slate-500 mt-1">{crmConvertedCount} dari {totalWaSent} pesan menjadi transaksi</p>
              </div>
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Rata-rata Nilai Konversi</span>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">Rp {Math.round(averageConvertedValue).toLocaleString("id-ID")}</p>
                <p className="text-[11px] text-slate-500 mt-1">Per transaksi yang teratribusi CRM</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Omset Teratribusi CRM</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">Rp {totalRevenueForCrm.toLocaleString("id-ID")}</p>
                <p className="text-[11px] text-slate-500 mt-1">Hanya transaksi yang punya jejak konversi</p>
              </div>
            </div>
          </div>

          {/* Table Log WA & Attribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              Riwayat Pesan Terkirim &amp; Status Konversi Pelanggan ({crmLogs.length})
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {crmLogs.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-12">Belum ada riwayat pesan WA terkirim.</p>
              ) : (
                crmLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.type === 'retention_45'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          {log.type === 'retention_45' ? 'Dormant >30 Hari' : 'Lost >60 Hari'}
                        </span>
                        <span className="text-xs text-slate-400">Pengirim: {log.cashier_name}</span>
                        <span className="text-xs text-slate-400">• {new Date(log.sent_at).toLocaleDateString("id-ID")}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {log.customer_name} ({log.customer_phone})
                      </h4>
                      <p className="text-xs text-slate-500 italic truncate max-w-md">{log.message_content}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      {log.is_converted ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terkonversi!
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Rp {(log.converted_amount || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          Menunggu Kunjungan
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: NOTIFIKASI STOK LAMBAT & PROMO KASIR */}
      {/* ======================================================== */}
      {activeTab === "stock_promo" && (
        <div className="space-y-6">
          {sentSuccessAlert && (
            <div className="flex items-center space-x-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instruksi promo berhasil dikirim ke layar kasir!</span>
            </div>
          )}

          <div className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 rounded-3xl p-6 border-2 border-amber-300/80 dark:border-amber-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-amber-900/60 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" /> Fitur Otomatis Stok
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  Notifikasi Perputaran Stok Lambat &amp; Instruksi Promo ke Kasir
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Sistem membaca otomatis perputaran barang/layanan. Berikan instruksi pesan promo ke kasir untuk mempercepat penjualan barang ini.
                </p>
              </div>
            </div>

            {/* Slow Moving Stock Selector & Form */}
            <form onSubmit={handleSendPromoToCashier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Stok Yang Perputarannya Lambat *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = productsServices.find((item) => item.id === e.target.value);
                      if (p) {
                        setPromoMessageInput(`Beri promo diskon 15%-20% untuk ${p.name} (Sisa stok: ${p.stock} Pcs) agar segera habis!`);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold"
                  >
                    {slowStockItems.map((ps) => (
                      <option key={ps.id} value={ps.id}>
                        ⚠️ {ps.name} — {ps.type === "product" ? `Sisa Stok: ${ps.stock} Pcs` : "Layanan Jasa Stagnan"} {ps.is_dead_stock ? "(Perputaran Lambat)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tulis Pesan Instruksi Promo Untuk Kasir *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoMessageInput}
                    onChange={(e) => setPromoMessageInput(e.target.value)}
                    placeholder="misal: Beri diskon 20% atau bonus free spray untuk produk ini!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Promo Ke Layar Kasir</span>
                </button>
              </div>
            </form>

            {/* Active Promo Instructions Sent by Owner */}
            <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Daftar Pesan Promo Aktif Terkirim Ke Kasir ({promoInstructions.length})
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {promoInstructions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada pesan promo yang dikirim ke kasir.</p>
                ) : (
                  promoInstructions.map((pi) => (
                    <div key={pi.id} className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <strong className="text-slate-900 dark:text-slate-100 font-bold">{pi.product_name}</strong>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-extrabold">Terkirim ke Kasir</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs">{pi.promo_message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-3">
                        {new Date(pi.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

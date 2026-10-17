"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { 
  CheckCircle2, 
  Receipt,
  Clock,
  Building2,
  User,
  ListOrdered,
  X,
  Eye,
  Calendar,
  MapPin,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { PosInvoiceSection } from "@/components/pos-invoice-section";

export default function CashierMainDashboardPage() {
  const { 
    tenant, 
    transactions,
    updateWorkStatus,
    settleTransaction,
    currentUser,
    toggleAttendance,
    promoInstructions
  } = useTenant();

  // Modals for Clickable Header Metrics & Sections
  const [showOmsetModal, setShowOmsetModal] = useState(false);
  const [showRekapModal, setShowRekapModal] = useState(false);
  const [showStatusTxModal, setShowStatusTxModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Filter Status Transaksi
  const [txFilterStatus, setTxFilterStatus] = useState<'all' | 'baru' | 'terlambat' | 'harus_selesai'>('all');

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

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
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
              type="button"
              onClick={() => toggleAttendance(currentUser.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition text-xs flex items-center gap-1.5 cursor-pointer"
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

      {/* 3. Section Pembuatan Nota Kasir: Pilih Produk Ritel & Layanan Jasa + Form Buat Nota */}
      <PosInvoiceSection showTitle={true} />

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
                type="button"
                onClick={() => setTxFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'all' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
              >
                Semua ({transactions.filter(t => t.work_status !== 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setTxFilterStatus('baru')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'baru' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-sm' : 'text-slate-500'}`}
              >
                Baru ({transactions.filter(t => t.work_status === 'baru').length})
              </button>
              <button
                type="button"
                onClick={() => setTxFilterStatus('terlambat')}
                className={`px-3 py-1.5 rounded-lg transition ${txFilterStatus === 'terlambat' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                Terlambat ({transactions.filter(t => t.work_status === 'terlambat').length})
              </button>
              <button
                type="button"
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
                        type="button"
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
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                            {tx.work_status === 'ready_for_pickup' ? 'Siap Diambil' : 'Ada DP'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{tx.customer_name} • {tx.customer_phone}</p>
                        <p className="text-[11px] font-bold text-amber-600 mt-0.5">Sisa Pelunasan: Rp {sisa.toLocaleString("id-ID")}</p>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            settleTransaction(tx.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold shadow hover:bg-sky-700 transition"
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

    </div>
  );
}

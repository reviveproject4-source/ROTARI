"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
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
  Bell
} from "lucide-react";

export default function OwnerCrmPage() {
  const { 
    crmLogs, 
    totalWaSent, 
    crmConvertedCount, 
    crmConvertedAmount,
    productsServices,
    promoInstructions,
    addPromoInstruction
  } = useTenant();

  // Detect slow-moving stock (is_dead_stock or >14 days without sale and stock > 0)
  const slowStockItems = productsServices.filter(
    (ps) => ps.is_dead_stock || (ps.type === "product" && ps.stock > 0)
  );

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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquareText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Laporan CRM &amp; Efektivitas WA Reminder
          </h1>
        </div>

        {sentSuccessAlert && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pesan promo berhasil dikirim ke Kasir!</span>
          </div>
        )}
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total WA Terkirim</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {totalWaSent} <span className="text-sm font-semibold text-slate-500">Pesan</span>
          </p>
          <span className="text-[11px] text-slate-400">Reminder Dormant &gt;45d / Lost &gt;90d</span>
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

      {/* FEATURE BARU: NOTIFIKASI STOK LAMBAT & INSTRUKSI PROMO KE KASIR */}
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
              <span>Kirim Pesan Promo Ke Dashboard Kasir</span>
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
                      {log.type === 'retention_45' ? 'Dormant >45 Hari' : 'Lost >90 Hari'}
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
  );
}

"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { 
  MessageSquareText, 
  Send, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Camera, 
  ImageIcon, 
  CheckCircle2,
  Users,
  Megaphone,
  Upload,
  UserCheck
} from "lucide-react";

export default function CashierCrmPage() {
  const { tenant, customers, currentUser, addCrmLog, promoInstructions } = useTenant();

  const dormantCustomers = customers.filter((c) => c.churn_status === "at_risk_45");
  const lostCustomers = customers.filter((c) => c.churn_status === "lost_90");
  const activeOwnerPromos = promoInstructions.filter((pi) => pi.status === "active");

  // State for Broadcast Form in Cashier CRM
  const [selectedPromoId, setSelectedPromoId] = useState<string>(activeOwnerPromos[0]?.id || "");
  const [customPromoMessage, setCustomPromoMessage] = useState<string>(
    activeOwnerPromos[0]?.promo_message || "Halo Kak! Ada promo spesial khusus hari ini di outlet kami!"
  );
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  const selectedTargetCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Handle Photo Attachment (Default Galeri / Kamera HP)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectOwnerPromo = (pi: any) => {
    setSelectedPromoId(pi.id);
    setCustomPromoMessage(`Halo Kak! Ada promo spesial dari Owner untuk ${pi.product_name}:\n\n"${pi.promo_message}"\n\nYuk kunjungi ${tenant.business_name} di ${tenant.address}!`);
  };

  // TOMBOL KIRIM VIA WA.ME (BROADCAST PROMO DENGAN FOTO & TARGET PELANGGAN)
  const handleSendWaBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetCustomer) return;

    const finalMessage = `${customPromoMessage}\n\n----------------------------\n*Outlet:* ${tenant.business_name}\n*Alamat:* ${tenant.address}\n${attachedPhotoUrl ? "\n*(Lampiran Foto Promo Berhasil Dilampirkan)*\n" : ""}`;

    // Record log to Owner CRM report
    addCrmLog({
      customer_id: selectedTargetCustomer.id,
      customer_name: selectedTargetCustomer.name,
      customer_phone: selectedTargetCustomer.phone,
      cashier_name: currentUser.name,
      type: selectedTargetCustomer.churn_status === "lost_90" ? "retention_90" : "retention_45",
      message_content: finalMessage,
    });

    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);

    // Open WhatsApp deep link
    const phoneClean = selectedTargetCustomer.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(finalMessage)}`;
    window.open(waUrl, "_blank");
  };

  const handleSendWaReminder = (cust: any, type: 'retention_45' | 'retention_90') => {
    const message = customPromoMessage || `Halo Kak ${cust.name}, kami rindu pelayanan sepatu/barang kesayangan Anda di *${tenant.business_name}*!\n\nKhusus hari ini, dapatkan *Voucher Diskon Special Retensi Pelanggan Setia*!\n\nAlamat Toko: ${tenant.address}\n\nBalas pesan ini untuk klaim voucher promo Anda!`;

    // Record log to Owner CRM report
    addCrmLog({
      customer_id: cust.id,
      customer_name: cust.name,
      customer_phone: cust.phone,
      cashier_name: currentUser.name,
      type,
      message_content: message,
    });

    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);

    // Open WhatsApp deep link
    const waUrl = `https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquareText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Menu CRM &amp; Broadcast Promo Kasir
          </h1>
        </div>

        {broadcastSuccess && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pesan WA Promo Berhasil Dikirim via WA.ME!</span>
          </div>
        )}
      </div>

      {/* SECTION NOTIFIKASI OWNER & BROADCAST PROMO (MEMILIH PELANGGAN & TOMBOL KIRIM VIA WA.ME) */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 rounded-3xl p-6 border-2 border-indigo-300/80 dark:border-indigo-800 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-indigo-200/80 dark:border-indigo-900/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block">
                Notifikasi Owner &amp; Broadcast Studio
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Studio Broadcast Promo WA (Pilih Pelanggan &amp; Kirim via wa.me)
              </h2>
            </div>
          </div>
        </div>

        {/* 1. List Notifikasi Promo dari Owner */}
        {activeOwnerPromos.length > 0 ? (
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              📢 Notifikasi Promo Aktif dari Owner (Klik Untuk Pakai Teks):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeOwnerPromos.map((pi) => (
                <div
                  key={pi.id}
                  onClick={() => handleSelectOwnerPromo(pi)}
                  className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 hover:border-indigo-500 cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-slate-900 dark:text-slate-100 font-bold">{pi.product_name}</strong>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black">Klik Pakai Teks</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">{pi.promo_message}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 italic">
            Belum ada instruksi khusus dari owner. Kasir tetap bisa memilih pelanggan dan menulis pesan promo kustom di bawah.
          </div>
        )}

        {/* 2. Form Broadcast Promo (Pilih Pelanggan, Tulis Text, Foto Galeri HP, Tombol KIRIM via wa.me) */}
        <form onSubmit={handleSendWaBroadcast} className="space-y-5 pt-2">
          
          {/* Pilih Pelanggan Tujuan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Pilih Nama Pelanggan Tujuan *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold shadow-sm"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  👤 {c.name} ({c.phone}) — {c.churn_status === 'lost_90' ? 'Lost >90 Hari' : c.churn_status === 'at_risk_45' ? 'Dormant >45 Hari' : 'Pelanggan Aktif'}
                </option>
              ))}
            </select>
          </div>

          {/* Tulis Text Promo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tulis / Edit Pesan Promo WhatsApp Kasir *
            </label>
            <textarea
              rows={3}
              value={customPromoMessage}
              onChange={(e) => setCustomPromoMessage(e.target.value)}
              placeholder="Tulis pesan promo kustom di sini..."
              className="w-full px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Lampiran Foto (Default Galeri / Kamera HP) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Lampirkan Foto Promo (Default Galeri &amp; Kamera HP)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {attachedPhotoUrl ? (
                <img
                  src={attachedPhotoUrl}
                  alt="Promo Attachment"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-400 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-dashed border-indigo-300 dark:border-indigo-800 flex items-center justify-center text-indigo-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-2 flex-1 w-full">
                <label className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border-2 border-dashed border-indigo-400 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold cursor-pointer transition">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>{attachedPhotoUrl ? "Foto Berhasil Dilampirkan!" : "Pilih Foto dari Galeri / Kamera HP"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500">
                  Foto promo dari galeri HP akan dilampirkan bersama pesan teks.
                </p>
              </div>
            </div>
          </div>

          {/* TOMBOL KIRIM */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2 transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>KIRIM</span>
            </button>
          </div>

        </form>

      </div>

      {/* Dormant Customers Section (>45 Days) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Clock className="w-5 h-5 text-indigo-500" />
          Pelanggan Dormant (&gt;45 Hari Tanpa Kunjungan) ({dormantCustomers.length})
        </h2>

        <div className="space-y-3">
          {dormantCustomers.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-6">Tidak ada pelanggan dormant saat ini.</p>
          ) : (
            dormantCustomers.map((cust) => (
              <div key={cust.id} className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Jatuh Tempo &gt;45 Hari
                    </span>
                    <span className="text-xs text-slate-500">{cust.phone}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{cust.name}</h3>
                  <p className="text-xs text-slate-500">
                    Order Terakhir: {new Date(cust.last_order_at).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <button
                  onClick={() => handleSendWaReminder(cust, 'retention_45')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> <span>KIRIM</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lost Customers Section (>90 Days) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          Pelanggan Lost (&gt;90 Hari Tanpa Kunjungan) ({lostCustomers.length})
        </h2>

        <div className="space-y-3">
          {lostCustomers.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-6">Tidak ada pelanggan lost saat ini.</p>
          ) : (
            lostCustomers.map((cust) => (
              <div key={cust.id} className="p-4 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Jatuh Tempo &gt;90 Hari
                    </span>
                    <span className="text-xs text-slate-500">{cust.phone}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{cust.name}</h3>
                  <p className="text-xs text-slate-500">
                    Order Terakhir: {new Date(cust.last_order_at).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <button
                  onClick={() => handleSendWaReminder(cust, 'retention_90')}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> <span>KIRIM</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

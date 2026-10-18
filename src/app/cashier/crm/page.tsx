"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useTenant, getCustomerChurnStatus, formatReminderMessage } from "@/lib/tenant-context";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { 
  MessageSquareText, 
  Send, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Camera, 
  ImageIcon, 
  CheckCircle2,
  Megaphone,
  UserCheck,
  CheckSquare,
  Square,
  Copy,
  Users,
  Check,
  Filter,
  ExternalLink,
  Phone
} from "lucide-react";

export default function CashierCrmPage() {
  const { tenant, customers, currentUser, addCrmLog, promoInstructions } = useTenant();

  // Konfigurasi Dinamis dari Pengaturan Manual Owner
  const dormantDays = tenant.reminder_rules?.dormant_days ?? 30;
  const lostDays = tenant.reminder_rules?.lost_days ?? 60;

  // Filter Threshold Durasi Belum Kembali (>45 Hari Default)
  const [inactivityFilter, setInactivityFilter] = useState<'45' | '30' | '60' | '90' | 'all'>('45');

  // State Centang / Checkbox Seleksi Massal
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(null);

  // Filter Pelanggan Berdasarkan Threshold Hari Belum Kembali
  const targetInactivityCustomers = useMemo(() => {
    return customers.filter((c) => {
      const diffDays = Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / 86400000);
      if (inactivityFilter === '30') return diffDays >= 30;
      if (inactivityFilter === '45') return diffDays >= 45;
      if (inactivityFilter === '60') return diffDays >= 60;
      if (inactivityFilter === '90') return diffDays >= 90;
      return diffDays >= 30; // 'all' (semua yang sudah >=30 hari)
    });
  }, [customers, inactivityFilter]);

  // Centang Semua / Hapus Centang Semua
  const isAllSelected = targetInactivityCustomers.length > 0 && selectedCustomerIds.length === targetInactivityCustomers.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(targetInactivityCustomers.map((c) => c.id));
    }
  };

  const handleToggleCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // State for Broadcast Form in Cashier CRM
  const activeOwnerPromos = promoInstructions.filter((pi) => pi.status === "active");
  const [selectedPromoId, setSelectedPromoId] = useState<string>(activeOwnerPromos[0]?.id || "");
  const [customPromoMessage, setCustomPromoMessage] = useState<string>(
    activeOwnerPromos[0]?.promo_message ||
    formatReminderMessage(
      tenant.reminder_rules?.promo_template || "Halo Kak {nama}! Ada kabar gembira dari {toko}: {promo}. Jangan sampai ketinggalan ya Kak!",
      customers[0]?.name || "Pelanggan",
      tenant.business_name,
      "Promo Spesial Pekan Ini"
    )
  );
  const [selectedTargetCustomerId, setSelectedTargetCustomerId] = useState<string>(customers[0]?.id || "");
  const [promoPhotoPreview, setPromoPhotoPreview] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  const selectedTargetCustomer = customers.find((c) => c.id === selectedTargetCustomerId) || customers[0];

  // Handle Photo Attachment (Default Galeri / Kamera HP)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromoPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectOwnerPromo = (pi: any) => {
    setSelectedPromoId(pi.id);
    const targetName = selectedTargetCustomer?.name || "Kakak";
    const template = tenant.reminder_rules?.promo_template || "Halo Kak {nama}! Ada kabar gembira dari {toko}: {promo}.";
    setCustomPromoMessage(formatReminderMessage(template, targetName, tenant.business_name, `${pi.product_name} - ${pi.promo_message}`));
  };

  // TOMBOL KIRIM VIA WA.ME (BROADCAST PROMO INDIVIDUAL)
  const handleSendWaBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetCustomer) return;

    const finalMessage = `${customPromoMessage}\n\n----------------------------\n*Outlet:* ${tenant.business_name}\n*Alamat:* ${tenant.address}`;

    const status = getCustomerChurnStatus(selectedTargetCustomer.last_order_at, tenant.reminder_rules);
    addCrmLog({
      customer_id: selectedTargetCustomer.id,
      customer_name: selectedTargetCustomer.name,
      customer_phone: selectedTargetCustomer.phone,
      cashier_name: currentUser.name,
      type: status === "lost_90" ? "retention_90" : "retention_45",
      message_content: finalMessage,
    });
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);

    openWhatsAppChat(selectedTargetCustomer.phone, finalMessage);
  };

  // TOMBOL KIRIM REMINDER 1-KLIK INDIVIDUAL
  const handleSendWaReminder = (cust: any) => {
    const diffDays = Math.floor((Date.now() - new Date(cust.last_order_at).getTime()) / 86400000);
    const isLost = diffDays >= 60;

    const template = isLost
      ? (tenant.reminder_rules?.lost_template || "Halo Kak {nama}! Sudah lama nih tidak berjumpa di {toko}. Yuk mampir lagi, ada voucher diskon spesial menanti Kakak lho!")
      : (tenant.reminder_rules?.dormant_template || "Halo Kak {nama}, kami rindu kunjungan Anda di {toko}! Khusus pekan ini, nikmati penawaran spesial kangen pelanggan setia dari kami. Balas pesan ini untuk info promonya ya Kak!");

    const message = formatReminderMessage(template, cust.name, tenant.business_name, "Voucher Diskon Spesial");

    addCrmLog({
      customer_id: cust.id,
      customer_name: cust.name,
      customer_phone: cust.phone,
      cashier_name: currentUser.name,
      type: isLost ? 'retention_90' : 'retention_45',
      message_content: message,
    });
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);

    openWhatsAppChat(cust.phone, message);
  };

  // ==========================================
  // BULK ACTIONS UNTUK KONSUMEN TERCENTANG
  // ==========================================
  // 1. Tandai massal telah dihubungi di log CRM
  const handleBulkMarkContacted = () => {
    if (selectedCustomerIds.length === 0) return;

    const selectedCusts = customers.filter((c) => selectedCustomerIds.includes(c.id));
    selectedCusts.forEach((c) => {
      const diffDays = Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / 86400000);
      const isLost = diffDays >= 60;
      const template = isLost
        ? (tenant.reminder_rules?.lost_template || "Halo Kak {nama}! Sudah lama nih tidak berjumpa di {toko}. Yuk mampir lagi, ada voucher diskon spesial menanti Kakak!")
        : (tenant.reminder_rules?.dormant_template || "Halo Kak {nama}, kami rindu kunjungan Anda di {toko}! Khusus pekan ini, nikmati penawaran spesial dari kami.");

      addCrmLog({
        customer_id: c.id,
        customer_name: c.name,
        customer_phone: c.phone,
        cashier_name: currentUser.name,
        type: isLost ? "retention_90" : "retention_45",
        message_content: formatReminderMessage(template, c.name, tenant.business_name),
      });
    });

    setBulkActionSuccess(`Berhasil mencatat ${selectedCustomerIds.length} konsumen ke log CRM!`);
    setSelectedCustomerIds([]);
    setTimeout(() => setBulkActionSuccess(null), 3500);
  };

  // 2. Salin daftar nomor & pesan broadcast ke clipboard
  const handleBulkCopyBroadcast = () => {
    if (selectedCustomerIds.length === 0) return;

    const selectedCusts = customers.filter((c) => selectedCustomerIds.includes(c.id));
    const lines = selectedCusts.map((c) => {
      const template = tenant.reminder_rules?.dormant_template || "Halo Kak {nama}, kami rindu kunjungan Anda di {toko}!";
      const msg = formatReminderMessage(template, c.name, tenant.business_name);
      return `[${c.name} - ${c.phone}]\n${msg}\n`;
    });

    navigator.clipboard.writeText(lines.join("\n--------------------\n"));
    setBulkActionSuccess(`Daftar ${selectedCustomerIds.length} kontak & pesan reminder berhasil disalin ke clipboard!`);
    setTimeout(() => setBulkActionSuccess(null), 3500);
  };

  // 3. Kirim WA satu per satu untuk yang tercentang
  const handleBulkOpenFirstWa = () => {
    if (selectedCustomerIds.length === 0) return;
    const firstCust = customers.find((c) => c.id === selectedCustomerIds[0]);
    if (firstCust) {
      handleSendWaReminder(firstCust);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
              Mode Kasir
            </span>
            <span className="text-xs text-slate-400">Retensi &amp; WhatsApp Reminder</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
            <MessageSquareText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Menu CRM Kasir &amp; Daftar Konsumen Belum Kembali
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kirimkan reminder WhatsApp ke pelanggan yang sudah lama tidak berkunjung (&ge;45 hari) secara individual maupun centang massal.
          </p>
        </div>

        {broadcastSuccess && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>WhatsApp dibuka / reminder siap dikirim!</span>
          </div>
        )}

        {bulkActionSuccess && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold shadow-sm animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>{bulkActionSuccess}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION UTAMA KASIR: DAFTAR KONSUMEN >45 HARI + CENTANG SEMUA */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-900 shadow-md space-y-4">
        
        {/* Header Bar Section dengan Filter Pilihan Hari */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                Daftar Konsumen Belum Kembali {inactivityFilter === 'all' ? '(Semua)' : `(>${inactivityFilter} Hari)`} ({targetInactivityCustomers.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Konsumen yang belum bertransaksi kembali. Kasir dapat centang semua untuk follow-up massal atau kirim 1-klik via WhatsApp.
            </p>
          </div>

          {/* Filter Pills Hari: >45 Hari (Default), >30, >60, >90, Semua */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => {
                setInactivityFilter('45');
                setSelectedCustomerIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                inactivityFilter === '45'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              &gt;45 Hari (Rekomendasi) ⭐
            </button>
            <button
              onClick={() => {
                setInactivityFilter('30');
                setSelectedCustomerIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                inactivityFilter === '30'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              &gt;30 Hari
            </button>
            <button
              onClick={() => {
                setInactivityFilter('60');
                setSelectedCustomerIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                inactivityFilter === '60'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              &gt;60 Hari
            </button>
            <button
              onClick={() => {
                setInactivityFilter('90');
                setSelectedCustomerIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                inactivityFilter === '90'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              &gt;90 Hari
            </button>
            <button
              onClick={() => {
                setInactivityFilter('all');
                setSelectedCustomerIds([]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                inactivityFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Toolbar Seleksi & Centang Semua */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              disabled={targetInactivityCustomers.length === 0}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              {isAllSelected ? "Hapus Centang Semua" : "Centang Semua Nama Konsumen"} ({targetInactivityCustomers.length} Konsumen)
            </span>
          </label>

          {selectedCustomerIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                {selectedCustomerIds.length} Tercentang
              </span>

              <button
                type="button"
                onClick={handleBulkCopyBroadcast}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-sm"
                title="Salin semua pesan dan nomor untuk broadcast"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Template &amp; Nomor</span>
              </button>

              <button
                type="button"
                onClick={handleBulkMarkContacted}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Tandai Sudah Dihubungi ({selectedCustomerIds.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Customer List dengan Checkbox per Baris */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {targetInactivityCustomers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-semibold">Tidak ada konsumen yang melebihi batas {inactivityFilter} hari.</p>
            </div>
          ) : (
            targetInactivityCustomers.map((cust) => {
              const diffDays = Math.floor((Date.now() - new Date(cust.last_order_at).getTime()) / 86400000);
              const isChecked = selectedCustomerIds.includes(cust.id);
              const isLost = diffDays >= 60;

              return (
                <div
                  key={cust.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isChecked
                      ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCustomer(cust.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          diffDays >= 90
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : diffDays >= 45
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          Belum Kembali {diffDays} Hari
                        </span>
                        <span className="text-xs font-mono text-slate-500">{cust.phone}</span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {cust.name}
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        Order Terakhir: {new Date(cust.last_order_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })} • Total {cust.total_orders || 1}x Transaksi (Rp {(cust.total_spent || 0).toLocaleString("id-ID")})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleSendWaReminder(cust)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      title="Buka WhatsApp dengan pesan template owner"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>KIRIM WA</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* STUDIO BROADCAST PROMO KASIR (DENGAN FOTO & TEMPLATE OWNER) */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 rounded-3xl p-6 border-2 border-indigo-300/80 dark:border-indigo-800 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-indigo-200/80 dark:border-indigo-900/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block">
                Studio Broadcast Promo Kasir
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pilih Promo Owner &amp; Kirimkan Foto ke Pelanggan
              </h2>
            </div>
          </div>
        </div>

        {/* PROMO DARI OWNER YANG AKTIF */}
        {activeOwnerPromos.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pesan Promo Yang Diberikan Owner Hari Ini:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeOwnerPromos.map((pi) => (
                <button
                  type="button"
                  key={pi.id}
                  onClick={() => handleSelectOwnerPromo(pi)}
                  className={`text-left p-3 rounded-2xl border text-xs transition flex flex-col justify-between ${
                    selectedPromoId === pi.id
                      ? "border-indigo-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-indigo-500/20"
                      : "border-indigo-200 dark:border-indigo-900/50 bg-white/70 dark:bg-slate-800/40 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-900 dark:text-indigo-200 font-bold">{pi.product_name}</strong>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-black">Aktif</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">{pi.promo_message}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Broadcast Promo */}
        <form onSubmit={handleSendWaBroadcast} className="space-y-4">
          
          {/* Target Konsumen */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Pelanggan Penerima Pesan Broadcast *
            </label>
            <select
              value={selectedTargetCustomerId}
              onChange={(e) => {
                setSelectedTargetCustomerId(e.target.value);
                const target = customers.find((c) => c.id === e.target.value);
                if (target) {
                  const template = tenant.reminder_rules?.promo_template || "Halo Kak {nama}! Ada kabar gembira dari {toko}: {promo}.";
                  setCustomPromoMessage(formatReminderMessage(template, target.name, tenant.business_name, "Promo Spesial"));
                }
              }}
              className="w-full px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {customers.map((c) => {
                const diffDays = Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / 86400000);
                return (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} ({c.phone}) — {diffDays >= 45 ? `Belum Kembali ${diffDays} Hari` : `Aktif (${diffDays}d)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tulis Text Promo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tulis / Sesuaikan Pesan Promo WhatsApp Kasir *
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
              {promoPhotoPreview ? (
                <Image
                  src={promoPhotoPreview}
                  alt="Promo Attachment"
                  width={96}
                  height={96}
                  unoptimized
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
                  <span>{promoPhotoPreview ? "Foto Berhasil Dilampirkan!" : "Pilih Foto dari Galeri / Kamera HP"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500">
                  Pratinjau foto promo. WhatsApp akan dibuka dengan teks pesan terisi otomatis.
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
              <span>KIRIM VIA WHATSAPP</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

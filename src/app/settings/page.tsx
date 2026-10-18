"use client";

import { useState } from "react";
import Image from "next/image";
import { useTenant } from "@/lib/tenant-context";
import { useTheme } from "next-themes";
import { BusinessType } from "@/types";
import { 
  Building2, 
  Image as ImageIcon, 
  MapPin, 
  FileText, 
  Printer, 
  Sun, 
  Moon, 
  Save, 
  CheckCircle2, 
  Clock, 
  Phone,
  Camera,
  Store,
  Wrench,
  Utensils,
  MessageSquareText,
  Sparkles,
  HelpCircle,
  Eye
} from "lucide-react";

export default function SettingsPage() {
  const { tenant, updateTenant } = useTenant();
  const { theme, setTheme } = useTheme();

  const [businessName, setBusinessName] = useState(tenant.business_name);
  const [businessType, setBusinessType] = useState<BusinessType>(tenant.business_type || 'service');
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "");
  const [address, setAddress] = useState(tenant.address || "");
  const [phoneNumber, setPhoneNumber] = useState(tenant.phone_number || "");
  const [terms, setTerms] = useState(tenant.terms_and_conditions || "");
  const [paperSize, setPaperSize] = useState(tenant.thermal_paper_size || "68mm");
  
  // Input Manual Hari Reminder oleh Owner (Bebas disesuaikan, tidak dikunci teori kaku)
  const [dormantDays, setDormantDays] = useState<number | "">(tenant.reminder_rules?.dormant_days ?? 30);
  const [lostDays, setLostDays] = useState<number | "">(tenant.reminder_rules?.lost_days ?? 60);
  const [stagnantDays, setStagnantDays] = useState<number | "">(tenant.reminder_rules?.stagnant_service_days ?? 14);

  // Template Pesan WhatsApp CRM Sesuai Gaya Bahasa Owner
  const [dormantTemplate, setDormantTemplate] = useState<string>(
    tenant.reminder_rules?.dormant_template ||
    "Halo Kak {nama}, kami rindu kunjungan Anda di {toko}! Khusus pekan ini, nikmati penawaran spesial kangen pelanggan setia dari kami. Balas pesan ini untuk info promonya ya Kak!"
  );
  const [lostTemplate, setLostTemplate] = useState<string>(
    tenant.reminder_rules?.lost_template ||
    "Halo Kak {nama}! Sudah lama nih tidak berjumpa di {toko}. Yuk mampir lagi, ada voucher diskon spesial menanti Kakak lho!"
  );
  const [promoTemplate, setPromoTemplate] = useState<string>(
    tenant.reminder_rules?.promo_template ||
    "Halo Kak {nama}! Ada kabar gembira dari {toko}: {promo}. Jangan sampai ketinggalan ya Kak!"
  );
  const [invoiceTemplate, setInvoiceTemplate] = useState<string>(
    tenant.reminder_rules?.invoice_template ||
    "*NOTA DIGITAL RESMI - {toko}*\nInvoice: {nota}\nTanggal: {tgl}\n{estimasi}Pelanggan: {nama}\n\n*Rincian Item / Layanan:*\n{rincian}\n\n{catatan}Subtotal: Rp {subtotal}\nDiskon: Rp {diskon}\nTotal Tagihan: Rp {total}\nDibayar: Rp {dibayar}\n{sisa}\n----------------------------\n*Alamat Outlet:*\n{alamat}\n\n*Syarat & Ketentuan:*\n{syarat}\n\nTerima kasih atas kunjungan Anda!\n_Radar Toko POS System_"
  );
  const [readyPickupTemplate, setReadyPickupTemplate] = useState<string>(
    tenant.reminder_rules?.ready_pickup_template ||
    "Halo Kak {nama}, pengerjaan barang kesayangan Anda ({barang}) sudah *SIAP DIAMBIL* di {toko}.\n\n*Alamat Outlet:* {alamat}\n{sisa}\nKami tunggu kedatangannya ya Kak!"
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle Logo File Upload (Galeri / Kamera HP)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant({
      business_name: businessName,
      business_type: businessType,
      logo_url: logoUrl,
      address,
      phone_number: phoneNumber,
      terms_and_conditions: terms,
      thermal_paper_size: paperSize as any,
      reminder_rules: {
        dormant_days: Number(dormantDays) || 30,
        lost_days: Number(lostDays) || 60,
        stagnant_service_days: Number(stagnantDays) || 14,
        dormant_template: dormantTemplate,
        lost_template: lostTemplate,
        promo_template: promoTemplate,
        invoice_template: invoiceTemplate,
        ready_pickup_template: readyPickupTemplate,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    updateTenant({ theme_preference: selectedTheme });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Pengaturan Tenant &amp; Konfigurasi CRM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sesuaikan model usaha, batas hari reminder manual, dan template pesan WhatsApp dengan gaya bahasa Anda sendiri.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Pemilihan Jenis Model Usaha (Retail, Jasa, Restoran) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pilihan Jenis Usaha (Archetype Outlet)
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              SaaS Multi-Industry
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih model usaha Anda. Sistem radar stok &amp; inventori akan otomatis menyesuaikan istilah serta alur HPP (murni harga beli kulakan/bahan baku).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Retail */}
            <div
              onClick={() => setBusinessType('retail')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                businessType === 'retail'
                  ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 shadow-md ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Retail / Toko</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Penjualan barang dagangan fisik (kelontong, fashion, minimarket). HPP = Murni harga kulakan barang jadi.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {businessType === 'retail' ? '✓ Aktif Digunakan' : 'Pilih Model Ini'}
              </div>
            </div>

            {/* Service */}
            <div
              onClick={() => setBusinessType('service')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                businessType === 'service'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Jasa &amp; Reparasi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Reparasi, cuci sepatu/tas, salon, bengkel. Menampilkan antrian pengerjaan, HPP = Murni bahan pembersih/sparepart.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {businessType === 'service' ? '✓ Aktif Digunakan' : 'Pilih Model Ini'}
              </div>
            </div>

            {/* Restaurant */}
            <div
              onClick={() => setBusinessType('restaurant')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                businessType === 'restaurant'
                  ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Restoran / F&amp;B / Cafe</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Kuliner, kafe, depot makan. Menu makanan/minuman, HPP = Murni harga beli bahan baku (kopi, gula, beras, ayam).
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {businessType === 'restaurant' ? '✓ Aktif Digunakan' : 'Pilih Model Ini'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Mesin CRM Radar Toko - Durasi Reminder Manual oleh Owner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-900/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Durasi Waktu Reminder Kunjungan (Input Manual oleh Owner)
              </h2>
            </div>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Manual Control
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Keleluasaan Penuh untuk Owner:</strong> Tentukan sendiri batas jumlah hari tanpa kunjungan sesuai karakteristik siklus usaha Anda, tanpa dikunci oleh teori default sistem.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. Batas Hari Pelanggan Dormant *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={dormantDays}
                  onChange={(e) => setDormantDays(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="30"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-extrabold text-slate-400">Hari</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Batas hari jika pelanggan belum kembali. Masuk kategori <em>Dormant</em> untuk di-reminder ringan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                2. Batas Hari Pelanggan Lost *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={lostDays}
                  onChange={(e) => setLostDays(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="60"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-extrabold text-slate-400">Hari</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Batas hari pelanggan dianggap hilang/beresiko pindah ke kompetitor. Masuk kategori <em>Winback Promo</em>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                3. Batas Stok/Servis Mengendap *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={stagnantDays}
                  onChange={(e) => setStagnantDays(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="14"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-extrabold text-slate-400">Hari</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Batas hari jika suatu menu/barang/layanan tidak ada penjualan agar didorong promo.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Template Pesan WhatsApp CRM Sesuai Gaya Bahasa Owner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Template Pesan WhatsApp CRM (Gaya Bahasa Owner)
              </h2>
            </div>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              1-Klik WhatsApp
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
              <HelpCircle className="w-4 h-4 text-emerald-600" /> Tag Variabel Otomatis yang Dapat Digunakan:
            </div>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">&#123;nama&#125; = Nama Pelanggan</span>
              <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-bold">&#123;toko&#125; = Nama Usaha Anda</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold">&#123;promo&#125; = Info Diskon/Menu Spesial</span>
            </div>
          </div>

          {/* Form Template 1: Dormant */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Template Pesan 1: Reminder Pelanggan Dormant ({dormantDays} Hari) *
            </label>
            <textarea
              rows={3}
              value={dormantTemplate}
              onChange={(e) => setDormantTemplate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500"
              placeholder="Tulis template pesan dormant dengan gaya bahasa khas outlet Anda..."
            />
          </div>

          {/* Form Template 2: Lost */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Template Pesan 2: Winback Pelanggan Lost ({lostDays} Hari) *
            </label>
            <textarea
              rows={3}
              value={lostTemplate}
              onChange={(e) => setLostTemplate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500"
              placeholder="Tulis template penawaran winback dengan gaya bahasa khas outlet Anda..."
            />
          </div>

          {/* Form Template 3: Broadcast Promo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Template Pesan 3: Broadcast Promo / Menu Baru Harian *
            </label>
            <textarea
              rows={3}
              value={promoTemplate}
              onChange={(e) => setPromoTemplate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500"
              placeholder="Tulis template promo harian dengan gaya bahasa khas outlet Anda..."
            />
          </div>

          {/* Form Template 4: Nota Digital Resmi Transaksi Baru */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Template Pesan 4: Nota Digital Transaksi Baru (WhatsApp) *
              </label>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                Otomatis saat Transaksi POS
              </span>
            </div>
            <textarea
              rows={6}
              value={invoiceTemplate}
              onChange={(e) => setInvoiceTemplate(e.target.value)}
              required
              className="w-full font-mono text-[11px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-emerald-500"
              placeholder="Format nota WhatsApp resmi..."
            />
            <p className="text-[10px] text-slate-400">
              Gunakan placeholder: &#123;toko&#125;, &#123;nota&#125;, &#123;tgl&#125;, &#123;estimasi&#125;, &#123;nama&#125;, &#123;rincian&#125;, &#123;catatan&#125;, &#123;subtotal&#125;, &#123;diskon&#125;, &#123;total&#125;, &#123;dibayar&#125;, &#123;sisa&#125;, &#123;alamat&#125;, &#123;syarat&#125;.
            </p>
          </div>

          {/* Form Template 5: Notifikasi Barang Siap Diambil / Pelunasan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Template Pesan 5: Notifikasi Barang Siap Diambil / Pelunasan *
              </label>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                Pengerjaan Selesai
              </span>
            </div>
            <textarea
              rows={3}
              value={readyPickupTemplate}
              onChange={(e) => setReadyPickupTemplate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500"
              placeholder="Halo Kak {nama}, pengerjaan barang kesayangan Anda ({barang}) sudah siap diambil..."
            />
            <p className="text-[10px] text-slate-400">
              Gunakan placeholder: &#123;nama&#125;, &#123;barang&#125;, &#123;toko&#125;, &#123;alamat&#125;, &#123;sisa&#125;.
            </p>
          </div>

          {/* Live Preview Box WhatsApp */}
          <div className="p-4 rounded-2xl bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Eye className="w-4 h-4" />
              <span>Simulasi Pratinjau Teks WhatsApp ke Pelanggan:</span>
            </div>
            <div className="bg-emerald-100/70 dark:bg-emerald-900/40 p-3.5 rounded-xl text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-sans shadow-inner border border-emerald-200 dark:border-emerald-800">
              {dormantTemplate
                .replace(/\{nama\}/gi, "Budi Santoso")
                .replace(/\{toko\}/gi, businessName || "Radar Toko")
                .replace(/\{promo\}/gi, "Diskon 20% Kangen Pelanggan")}
            </div>
          </div>
        </div>

        {/* Section 4: Identitas Usaha & Upload Logo dari Kamera / Galeri */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Identitas &amp; Logo Toko
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Nama Outlet / Usaha *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 text-sm"
                placeholder="misal: Toko Berkah / Care Center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Nomor Telepon / WhatsApp Resmi *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="081234567890"
                />
              </div>
            </div>

            {/* Logo Upload (Kamera / Galeri HP) - Khusus Cetak Nota */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Logo Outlet Untuk Cetak Nota Thermal
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo Nota Toko"
                    width={80}
                    height={80}
                    unoptimized
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-2 flex-1 w-full">
                  <label className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100 text-sky-700 dark:text-sky-300 text-xs font-bold cursor-pointer transition">
                    <Camera className="w-4 h-4" />
                    <span>Pilih Logo Nota dari Galeri / Kamera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Logo yang diunggah khusus digunakan untuk cetakan header pada Nota Thermal kasir.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Alamat Lengkap Usaha *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 text-sm"
                  placeholder="Jl. Pemuda No. 88, Sepatan, Tangerang, Banten"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Tema Antarmuka (Light Mode / Dark Mode) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tema Antarmuka (Mode Tampilan)
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition ${
                theme === 'light'
                  ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition ${
                theme === 'dark'
                  ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Section 6: Syarat & Ketentuan Transaksi (Manual oleh Owner) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Syarat &amp; Ketentuan Transaksi Nota (Manual)
            </h2>
          </div>

          <textarea
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 text-sm font-mono leading-relaxed"
            placeholder="1. Garansi pengerjaan ulang 3 hari setelah pengambilan.&#10;2. Barang yang tidak diambil dalam 30 hari di luar tanggung jawab toko."
          />
        </div>

        {/* Section 7: Hardware & Bluetooth Printer Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Pengaturan Printer Thermal Bluetooth
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['58mm', '68mm', '80mm'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPaperSize(size)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition ${
                  paperSize === size
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Printer className="w-6 h-6 mb-2" />
                <span className="text-sm font-bold">Kertas {size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg transition"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Pengaturan Outlet</span>
          </button>
        </div>

      </form>
    </div>
  );
}

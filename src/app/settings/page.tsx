"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { useTheme } from "next-themes";
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
  Upload
} from "lucide-react";

export default function SettingsPage() {
  const { tenant, updateTenant } = useTenant();
  const { theme, setTheme } = useTheme();

  const [businessName, setBusinessName] = useState(tenant.business_name);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "");
  const [address, setAddress] = useState(tenant.address || "");
  const [phoneNumber, setPhoneNumber] = useState(tenant.phone_number || "");
  const [terms, setTerms] = useState(tenant.terms_and_conditions || "");
  const [paperSize, setPaperSize] = useState(tenant.thermal_paper_size || "68mm");
  const [stagnantDays, setStagnantDays] = useState(tenant.reminder_rules.stagnant_service_days || 14);
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
      logo_url: logoUrl,
      address,
      phone_number: phoneNumber,
      terms_and_conditions: terms,
      thermal_paper_size: paperSize as any,
      reminder_rules: {
        ...tenant.reminder_rules,
        stagnant_service_days: Number(stagnantDays),
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
            Pengaturan Tenant &amp; Identitas Outlet
          </h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Tema Antarmuka (Light Mode / Dark Mode) */}
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

        {/* Section 2: Identitas Usaha & Upload Logo dari Kamera / Galeri */}
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
                Nama Outlet / Toko *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 text-sm"
                placeholder="misal: ROTARI Shoe & Leather Care"
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

            {/* Logo Upload (Kamera / Galeri HP) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Logo Usaha (Default Kamera / Galeri HP)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Toko"
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
                    <span>Pilih dari Galeri / Kamera HP</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Logo yang diunggah akan otomatis ditampilkan pada Nota Thermal dan Nota Digital WA.
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

        {/* Section 3: Syarat & Ketentuan Transaksi (Manual oleh Owner) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Syarat &amp; Ketentuan Transaksi (Manual)
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

        {/* Section 4: Hardware & Bluetooth Printer Settings */}
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

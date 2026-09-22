"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Settings as SettingsIcon, ShieldCheck, KeyRound } from "lucide-react";

export default function CashierSettingsPage() {
  const { currentUser, tenant, updateTenant, logout, updateUserPin } = useTenant();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    updateTenant({ theme_preference: selectedTheme });
  };

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);

    if (oldPin !== currentUser.pin_code) {
      setPinMsg({ text: "PIN Lama Anda salah!", isError: true });
      return;
    }

    if (newPin.length < 4) {
      setPinMsg({ text: "PIN Baru minimal 4 digit!", isError: true });
      return;
    }

    updateUserPin(currentUser.id, newPin);
    setOldPin("");
    setNewPin("");
    setPinMsg({ text: "PIN Keamanan berhasil diperbarui!", isError: false });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Pengaturan Kasir
        </h1>
      </div>

      {/* User Session Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kasir Aktif</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">Outlet: {tenant.business_name}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full">
            Online Sesi Kasir
          </span>
        </div>
      </div>

      {/* Ubah Kode PIN Keamanan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Ubah Kode PIN Keamanan Kasir
          </h2>
        </div>

        {pinMsg && (
          <div className={`p-3 rounded-xl text-xs font-bold ${
            pinMsg.isError 
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200" 
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
          }`}>
            {pinMsg.text}
          </div>
        )}

        <form onSubmit={handlePinUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">PIN Saat Ini</label>
              <input
                type="password"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN lama"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">PIN Baru</label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Masukkan PIN baru"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Simpan PIN Baru</span>
          </button>
        </form>
      </div>

      {/* Light Mode / Dark Mode Theme Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
          Tampilan Mode Layar (Light / Dark)
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-center space-x-3 p-4 rounded-xl border-2 transition ${
              theme === 'light'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
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
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
          Keluar Sesi
        </h2>

        <button
          onClick={() => {
            logout();
          }}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out / Keluar Sesi Kasir</span>
        </button>
      </div>
    </div>
  );
}

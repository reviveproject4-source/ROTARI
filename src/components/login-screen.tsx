"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, Store, Sparkles, Lock } from "lucide-react";

export function LoginScreen() {
  const { users, setCurrentUserWithPin } = useTenant();
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || "");
  const [pinCode, setPinCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const targetUser = users.find((u) => u.id === selectedUserId);
    const success = setCurrentUserWithPin(selectedUserId, pinCode);

    if (success && targetUser) {
      setPinCode("");
      if (targetUser.role === "owner") {
        router.push("/");
      } else {
        router.push("/pos");
      }
    } else {
      setErrorMsg("PIN yang Anda masukkan salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* ROTARI Brand Header with Logo */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img 
              src="/rotari-logo.png" 
              alt="ROTARI Official Logo" 
              className="w-20 h-20 mx-auto rounded-full object-contain bg-white p-1 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10"
            />
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
              SaaS Multi-Tenant Platform
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
              ROTARI POS &amp; CRM
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Silakan pilih profil pengguna dan masukkan PIN keamanan untuk membuka akses.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Pilih Pengguna Log In
            </label>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setErrorMsg("");
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? "border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 font-extrabold ring-2 ring-sky-500/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        u.role === 'owner' ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      }`}>
                        {u.role === 'owner' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role === 'owner' ? 'Owner Outlet' : 'Kasir Operasional'}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-sky-600 text-white">
                        Dipilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Kode PIN Keamanan</span>
              <span className="text-[10px] font-semibold text-slate-400">Verifikasi Otomatis</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Masukkan PIN (cth: 123456 atau 1122)"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-sm font-black shadow-xl shadow-sky-600/25 transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>MASUK KE APLIKASI</span>
          </button>

        </form>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">PIN Akses Resmi:</p>
          <p>• Owner Budi: <code className="bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold">123456</code></p>
          <p>• Kasir Siti: <code className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">1122</code> | Kasir Agus: <code className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">3344</code></p>
        </div>

      </div>
    </div>
  );
}

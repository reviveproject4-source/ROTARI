"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { useRouter } from "next/navigation";
import { KeyRound, AlertCircle, User, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function LoginScreen() {
  const { loginWithCredentials } = useTenant();
  const router = useRouter();

  const [identifier, setIdentifier] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const result = loginWithCredentials(identifier, pinCode);

    if (result.success && result.user) {
      setPinCode("");
      if (result.user.role === "owner") {
        router.push("/");
      } else {
        router.push("/pos");
      }
    } else {
      setErrorMsg("Email / ID Akun atau Kode PIN Keamanan tidak valid. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* ROTARI Official Logo & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img 
              src="/rotari-logo.png" 
              alt="ROTARI Logo" 
              className="w-20 h-20 mx-auto rounded-full object-contain bg-white p-1 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10"
            />
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
              SaaS Multi-Tenant Platform
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
              ROTARI POS &amp; CRM
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Masukkan ID Akun dan Kode PIN Keamanan untuk masuk ke sistem.
            </p>
          </div>
        </div>

        {/* Clean Standard Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / ID Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Email / ID Akun
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Masukkan Email atau ID Akun"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Kode PIN Keamanan *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Masukkan 6 Digit PIN Keamanan"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-black shadow-xl shadow-emerald-600/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>MASUK KE SISTEM</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

        </form>

        {/* Separated Super Admin Portal Access */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/super-admin"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Portal Super Admin ROTARI (Aktivasi Lisensi &amp; Onboarding)</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

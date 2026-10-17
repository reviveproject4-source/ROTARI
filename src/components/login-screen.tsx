"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, AlertCircle, User, Lock, ArrowRight, Sparkles, Building2, UserCheck } from "lucide-react";

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
      if (result.user.id === "user-super-admin" || result.user.email === "superadmin@radartoko.id" || result.user.email === "superadmin@rotari.id") {
        router.push("/super-admin");
      } else if (result.user.role === "owner") {
        router.push("/");
      } else {
        router.push("/pos");
      }
    } else {
      setErrorMsg("Email / ID Akun atau Kode PIN Keamanan tidak valid. Silakan coba lagi.");
    }
  };

  const handleQuickDemoOwner = () => {
    const result = loginWithCredentials("owner@rotari.id", "123456");
    if (result.success) {
      router.push("/");
    }
  };

  const handleQuickDemoCashier = () => {
    const result = loginWithCredentials("kasir@rotari.id", "123456");
    if (result.success) {
      router.push("/pos");
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative my-auto">
        
        {/* Radar Toko Official Logo & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img 
              src="/rotari-logo.png" 
              alt="Radar Toko Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full object-contain bg-white p-1 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10"
            />
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
              SaaS Multi-Tenant Platform
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
              RADAR TOKO POS &amp; CRM
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Platform POS &amp; Mesin Retensi CRM Pelanggan Multi-Industri
            </p>
          </div>
        </div>

        {/* 1-Click Fast Track Demo for Potential Owners & Reviewers */}
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Akses Cepat Jalur Demo (1-Klik)
            </span>
            <span className="text-[9px] bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-200 font-extrabold px-1.5 py-0.5 rounded">
              Instan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleQuickDemoOwner}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Demo Owner</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoCashier}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Kasir</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase text-slate-400 absolute">
            atau masuk dengan akun terdaftar
          </span>
        </div>

        {/* Clean Standard Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / ID Input */}
          <div className="space-y-1">
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
                placeholder="misal: owner@rotari.id"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1">
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
                placeholder="6 Digit PIN Keamanan (default: 123456)"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>MASUK KE SISTEM</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

        </form>

        {/* Link to Register New Tenant Trial */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Ingin mendaftarkan outlet usaha Anda sendiri?{" "}
            <Link
              href="/demo-request"
              className="text-purple-600 dark:text-purple-400 font-extrabold hover:underline"
            >
              Daftar Trial 14 Hari Gratis →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useTenant } from "@/lib/tenant-context";
import { useRouter } from "next/navigation";
import { KeyRound, X, AlertCircle, User, Lock, Sparkles, Building2, UserCheck, ShieldCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'owner' | 'cashier';
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithCredentials } = useTenant();
  const router = useRouter();

  const [identifier, setIdentifier] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const result = loginWithCredentials(identifier, pinCode);
    if (result.success && result.user) {
      setPinCode("");
      setIdentifier("");
      onClose();
      if (result.user.role === 'owner') {
        router.push("/");
      } else if (result.user.role === 'cashier') {
        router.push("/pos");
      } else if (result.user.role === 'superadmin') {
        router.push("/super-admin");
      }
    } else {
      setErrorMsg("Login PIN lokal dinonaktifkan sampai autentikasi server-side tersedia.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <Image 
            src="/rotari-logo.png" 
            alt="Radar Toko Logo" 
            width={48}
            height={48}
            className="w-12 h-12 mx-auto rounded-full object-contain bg-white p-1 shadow-md border border-slate-200 dark:border-slate-800" 
          />
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Ganti Pengguna &amp; Sesi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            PIN lokal tidak lagi digunakan untuk mengubah identitas pengguna.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase text-slate-400 absolute">
            autentikasi server-side
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / ID Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Email / ID Pengguna
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Akun terdaftar"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Kode PIN Keamanan *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="PIN lokal dinonaktifkan"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verifikasi PIN</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

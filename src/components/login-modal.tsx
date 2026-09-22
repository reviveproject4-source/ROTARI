"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { ShieldCheck, UserCheck, KeyRound, X, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'owner' | 'cashier';
}

export function LoginModal({ isOpen, onClose, targetRole }: LoginModalProps) {
  const { users, setCurrentUserWithPin } = useTenant();
  
  const filteredUsers = targetRole 
    ? users.filter((u) => u.role === targetRole)
    : users;

  const [selectedUserId, setSelectedUserId] = useState<string>(filteredUsers[0]?.id || users[0]?.id || "");
  const [pinCode, setPinCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const success = setCurrentUserWithPin(selectedUserId, pinCode);
    if (success) {
      setPinCode("");
      onClose();
    } else {
      setErrorMsg("PIN yang Anda masukkan salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <img 
            src="/rotari-logo.png" 
            alt="ROTARI Logo" 
            className="w-14 h-14 mx-auto rounded-full object-contain bg-white p-1 shadow-md border border-slate-200 dark:border-slate-800" 
          />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Autentikasi Pengguna &amp; Role
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih nama akun dan masukkan kode PIN keamanan resmi Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Pilih Pengguna
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setErrorMsg("");
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? "border-sky-600 bg-sky-50/50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-100 font-extrabold"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        u.role === 'owner' ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      }`}>
                        {u.role === 'owner' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role === 'owner' ? 'Owner Outlet' : 'Kasir Toko'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Kode PIN Keamanan
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Masukkan PIN (cth: 123456 atau 1122)"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-extrabold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-lg shadow-sky-600/20 transition"
            >
              Verifikasi &amp; Masuk
            </button>
          </div>

        </form>

        <p className="text-[10px] text-slate-400 text-center">
          PIN Default: Owner (123456) | Kasir Siti (1122) | Kasir Agus (3344)
        </p>

      </div>
    </div>
  );
}

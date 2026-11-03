"use client";

import Image from "next/image";

export function LoginScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <Image src="/rotari-logo.png" alt="Radar Toko Logo" width={80} height={80} className="mx-auto h-20 w-20 rounded-full bg-white object-contain p-1" />
        <h1 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-100">RADAR TOKO POS &amp; CRM</h1>
        <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">Login sementara dinonaktifkan</p>
        <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
          Akses aplikasi akan dibuka kembali setelah autentikasi server-side, pemetaan akun, dan pemeriksaan hak akses tenant selesai diterapkan. Login PIN lokal dan akun demo tidak lagi diterima.
        </p>
      </div>
    </div>
  );
}

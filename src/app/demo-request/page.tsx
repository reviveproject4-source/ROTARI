"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { CheckCircle2, Sparkles, Building2, User, Mail, PhoneCall, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function DemoRequestPage() {
  const { addProspectLead, tenant } = useTenant();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !businessName) return;

    addProspectLead({
      name,
      email,
      phone,
      business_name: businessName,
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      
      {/* Header Back Button */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Aplikasi
        </Link>

        {tenant.logo_url && (
          <img src={tenant.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
        )}
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        {submittedSuccess ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Pendaftaran Demo Berhasil!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Terima kasih Kak <strong>{name}</strong>! Data prospek usaha <strong>{businessName}</strong> telah berhasil terdaftar. Tim SaaS ROTARI akan segera menghubungi Anda melalui WhatsApp untuk jadwal demo online &amp; aktivasi 14 hari uji coba.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPhone("");
                  setBusinessName("");
                  setSubmittedSuccess(false);
                }}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Daftar Form Baru
              </button>
              <Link
                href="/super-admin"
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lihat di Data Prospek Super Admin</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Uji Coba Gratis 14 Hari
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Formulir Pendaftaran Demo SaaS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isi data diri dan informasi bisnis Anda untuk langsung mencoba platform SaaS ROTARI.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* No Kontak / WA */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> No Kontak / WhatsApp Active
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* Nama Usaha */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" /> Nama Usaha / Outlet
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Clean Shoes Sepatan"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pendaftaran Demo</span>
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

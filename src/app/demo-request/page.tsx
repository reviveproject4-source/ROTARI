"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { BusinessType } from "@/types";
import { 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  PhoneCall, 
  ArrowLeft, 
  KeyRound, 
  Rocket, 
  Store, 
  Wrench, 
  Utensils 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DemoRequestPage() {
  const { registerDemoTenant, tenant } = useTenant();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("retail");
  const [pinCode, setPinCode] = useState("");
  const [createdUserPin, setCreatedUserPin] = useState("123456");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !businessName) return;

    const usedPin = pinCode.trim() ? pinCode.trim() : "123456";
    setCreatedUserPin(usedPin);

    registerDemoTenant({
      name,
      email,
      phone,
      businessName,
      businessType,
      pinCode: usedPin,
    });

    setSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 py-8">
      
      {/* Header Back Button */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Layar Log In
        </Link>

        {tenant.logo_url && (
          <Image
            src={tenant.logo_url}
            alt="Logo"
            width={32}
            height={32}
            unoptimized
            className="w-8 h-8 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        {submittedSuccess ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Aktivasi Berhasil
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 pt-1">
                Uji Coba 14 Hari Siap Digunakan!
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Nama Usaha:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{businessName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Model Usaha:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                  {businessType === 'retail' ? 'Retail / Toko' : businessType === 'service' ? 'Jasa & Reparasi' : 'Restoran & Cafe'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Pemilik / Owner:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">PIN Log In:</span>
                <span className="font-black text-purple-600 dark:text-purple-400 tracking-wider">{createdUserPin}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Selamat datang di <strong>Radar Toko</strong>! Akun Owner usaha Anda telah aktif untuk 14 hari kedepan. Anda sudah otomatis ter-login.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/"
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Mulai Gunakan Radar Toko Sekarang</span>
              </Link>

              <button
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPhone("");
                  setBusinessName("");
                  setPinCode("");
                  setSubmittedSuccess(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Daftar Form Baru
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Uji Coba Gratis 14 Hari
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Pendaftaran Outlet Radar Toko
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih jenis usaha Anda dan nikmati fitur POS &amp; CRM Radar Toko gratis 14 hari.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Pilihan Jenis Usaha */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  Pilih Jenis Usaha Anda *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessType('retail')}
                    className={`py-2 px-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition ${
                      businessType === 'retail'
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-black shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Store className="w-4 h-4 mb-1" />
                    <span className="text-[11px]">Retail / Toko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessType('service')}
                    className={`py-2 px-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition ${
                      businessType === 'service'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-black shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Wrench className="w-4 h-4 mb-1" />
                    <span className="text-[11px]">Jasa Servis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessType('restaurant')}
                    className={`py-2 px-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition ${
                      businessType === 'restaurant'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Utensils className="w-4 h-4 mb-1" />
                    <span className="text-[11px]">Resto &amp; F&amp;B</span>
                  </button>
                </div>
              </div>

              {/* Nama Usaha */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" /> Nama Usaha / Outlet *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Toko Berkah / Kopi Kenangan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* Nama Lengkap Owner */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> Nama Lengkap Owner *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* No Kontak / WA */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> No WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              {/* PIN Code Optional */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> PIN Log In (6 Angka) <span className="text-[10px] font-normal text-slate-400">(Opsional, Default: 123456)</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 mt-4"
              >
                <Rocket className="w-4 h-4" />
                <span>Daftar &amp; Mulai Uji Coba 14 Hari</span>
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

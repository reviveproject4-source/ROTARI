"use client";

import { useTenant } from "@/lib/tenant-context";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  KeyRound, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  PhoneCall, 
  Mail, 
  Plus, 
  AlertTriangle,
  Lock,
  AlertCircle,
  ArrowRight,
  LogOut,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SuperAdminDashboardPage() {
  const { 
    currentUser,
    tenant, 
    prospectLeads, 
    updateLeadStatus, 
    daysRemainingInTrial, 
    isTrialExpired,
    extendTrial,
    activateSubscription,
    loginWithCredentials,
    logout
  } = useTenant();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState("superadmin@radartoko.id");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'converted'>('all');
  const [waOpenedStatus, setWaOpenedStatus] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function verifySuperAdminSession() {
      // 1. Check in-memory context role
      if (currentUser && currentUser.role === "superadmin") {
        if (isMounted) setIsAuthorized(true);
        return;
      }

      // 2. Server verification via Supabase Auth & Database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (dbUser?.role === "superadmin" || user.app_metadata?.role === "superadmin") {
            setIsAuthorized(true);
          }
        }
      } catch (err) {
        console.warn("Supabase Auth session verification error:", err);
      }
    }

    verifySuperAdminSession();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const cleanEmail = emailInput.trim();
      const cleanSecret = passwordInput.trim();

      // 1. Attempt Server-side Supabase Auth
      let serverAuthSuccess = false;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanSecret,
        });

        if (data?.user && !error) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

          if (dbUser?.role === "superadmin" || data.user.app_metadata?.role === "superadmin") {
            serverAuthSuccess = true;
          }
        }
      } catch (authErr) {
        console.warn("Supabase Auth signIn attempt failed, falling back to local credentials:", authErr);
      }

      // 2. Local cryptographic verification
      const localResult = loginWithCredentials(cleanEmail, cleanSecret);

      if (serverAuthSuccess || (localResult.success && localResult.user?.role === "superadmin")) {
        setIsAuthorized(true);
        setPasswordInput("");
        setAuthError("");
      } else {
        setAuthError("Kredensial Super Admin tidak valid atau tidak memiliki hak akses platform.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockPortal = () => {
    logout();
    setIsAuthorized(false);
    setPasswordInput("");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center border border-purple-200">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Akses Terproteksi Server
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Portal Super Admin Radar Toko
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Otentikasi kredensial Super Admin terverifikasi server untuk mengakses portal manajemen platform.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            {authError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Email Super Admin *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="superadmin@radartoko.id"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Password / Kunci Akses *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Masukkan password atau PIN keamanan"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Server...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verifikasi &amp; Buka Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Kembali ke Aplikasi Radar Toko
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredLeads = prospectLeads.filter((lead) => {
    const matchesQuery = 
      lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.business_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.phone.includes(leadSearch);

    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {waOpenedStatus && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>WhatsApp dibuka / pesan siap dikirim</span>
        </div>
      )}
      
      {/* Super Admin Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Super Admin Terverifikasi
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Portal Super Admin Radar Toko (Prospek Demo &amp; Aktivasi Tenant)
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLockPortal}
            className="px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold text-xs hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Kunci Portal</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition"
          >
            Kembali ke App
          </Link>
        </div>
      </div>

      {/* SECTION 1: DATA PROSPEK FORM DEMO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Data Prospek Pengisi Form Demo ({prospectLeads.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar prospek calon tenant yang mengisi formulir demo uji coba SaaS.
            </p>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder="Cari nama / WA / email..."
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
            />
            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value as any)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
            >
              <option value="all">Semua Status</option>
              <option value="new">Baru</option>
              <option value="contacted">Sudah Dihubungi</option>
              <option value="converted">Terkonversi</option>
            </select>
          </div>
        </div>

        {/* Prospect Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="pb-3">Nama &amp; Usaha</th>
                <th className="pb-3">Email &amp; No Kontak WA</th>
                <th className="pb-3">Tanggal Daftar</th>
                <th className="pb-3">Status Prospek</th>
                <th className="pb-3 text-right">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data prospek yang mendaftar form demo.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lead.name}</p>
                        <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {lead.business_name}
                        </span>
                      </td>

                      <td className="py-4 space-y-1">
                        <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> {lead.phone}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3.5 h-3.5" /> {lead.email}
                        </p>
                      </td>

                      <td className="py-4 text-slate-500">
                        {new Date(lead.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      <td className="py-4">
                        {lead.status === 'new' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            PROSPEK BARU
                          </span>
                        )}
                        {lead.status === 'contacted' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            SUDAH DIHUBUNGI
                          </span>
                        )}
                        {lead.status === 'converted' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            TERKONVERSI TENANT
                          </span>
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              const msg = `Halo Kak ${lead.name} dari ${lead.business_name}, terima kasih telah mendaftar Uji Coba Demo Radar Toko! Kapan waktu yang tepat untuk kita jadwalkan demo online?`;
                              openWhatsAppChat(lead.phone, msg);
                              setWaOpenedStatus(true);
                              setTimeout(() => setWaOpenedStatus(false), 3500);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Hubungi WA</span>
                          </button>

                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold"
                          >
                            <option value="new">Ubah: Baru</option>
                            <option value="contacted">Ubah: Dihubungi</option>
                            <option value="converted">Ubah: Terkonversi</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: AKTIVASI TENANT BERBAYAR & TRIAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              Aktivasi Tenant Berbayar &amp; Status Lisensi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin khusus untuk aktivasi lisensi berlangganan tenant yang sudah melakukan pembayaran.
            </p>
          </div>
        </div>

        {/* Active Tenant Activation Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-lg border border-sky-200">
                {tenant.business_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{tenant.business_name}</h3>
                <p className="text-xs text-slate-500">ID Tenant: {tenant.id} | No HP: {tenant.phone_number}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {tenant.subscription_status === 'active' ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> BERLANGGANAN AKTIF (BERBAYAR)
                </span>
              ) : isTrialExpired ? (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> MASA TRIAL EXPIRATION TERKUNCI
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> MASA UJI COBA (SISA {daysRemainingInTrial} HARI)
                </span>
              )}
            </div>
          </div>

          {/* Trial Bar Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Status Lisensi Masa Trial / Berbayar</span>
              <span>Tgl Kadaluarsa: {new Date(tenant.trial_ends_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  tenant.subscription_status === 'active' 
                    ? "bg-emerald-500 w-full" 
                    : isTrialExpired 
                      ? "bg-rose-500 w-full" 
                      : "bg-amber-500"
                }`}
                style={{ width: tenant.subscription_status === 'active' ? '100%' : `${Math.min(100, Math.max(5, (daysRemainingInTrial / 14) * 100))}%` }}
              />
            </div>
          </div>

          {/* Activation Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                activateSubscription();
                alert("Berhasil! Tenant telah diaktifkan ke Status Berlangganan Penuh (Berbayar).");
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Aktivasi Tenant Berbayar (Lisensi Penuh)</span>
            </button>

            <button
              onClick={() => {
                extendTrial(14);
                alert("Berhasil memperpanjang Masa Trial tenant selama +14 Hari!");
              }}
              className="px-4 py-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Perpanjang Masa Trial +14 Hari</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
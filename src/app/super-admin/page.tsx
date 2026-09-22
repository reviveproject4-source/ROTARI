"use client";

import { useTenant } from "@/lib/tenant-context";
import { openWhatsAppChat } from "@/lib/whatsapp";
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
  Calendar,
  AlertTriangle,
  TrendingUp,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SuperAdminDashboardPage() {
  const { 
    tenant, 
    prospectLeads, 
    updateLeadStatus, 
    deleteProspectLead, 
    daysRemainingInTrial, 
    isTrialExpired,
    extendTrial,
    activateSubscription
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'leads' | 'tenants'>('leads');
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'converted'>('all');
  const [waOpenedStatus, setWaOpenedStatus] = useState<boolean>(false);

  const filteredLeads = prospectLeads.filter((lead) => {
    const matchesQuery = 
      lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.business_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.phone.includes(leadSearch);

    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalLeads = prospectLeads.length;
  const newLeadsCount = prospectLeads.filter((l) => l.status === 'new').length;
  const convertedLeadsCount = prospectLeads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeadsCount / totalLeads) * 100).toFixed(0) : "0";

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
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Platform Super Admin (Terpisah)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Portal Super Admin SaaS ROTARI (Aktivasi Lisensi &amp; Onboarding Tenant)
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/demo-request"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Form Demo Publik</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition"
          >
            Kembali ke App
          </Link>
        </div>
      </div>

      {/* 4 Super Admin Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Data Prospek */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Data Prospek</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalLeads}</p>
          <span className="text-[11px] text-purple-600 font-bold">{newLeadsCount} Prospek Baru Perlu Dihubungi</span>
        </div>

        {/* Tenant Trial 14 Hari */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Status Masa Trial 14 Hari</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {tenant.subscription_status === 'active' ? "Berbayar" : `${daysRemainingInTrial} Hari`}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {tenant.subscription_status === 'active' ? "Lisensi Lisensi Aktif Penuh" : `Kunci Trial Outlet: ${tenant.business_name}`}
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Tingkat Konversi Prospek</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{conversionRate}%</p>
          <span className="text-[11px] text-slate-400 font-medium">{convertedLeadsCount} Prospek Menjadi Tenant</span>
        </div>

        {/* Total Active SaaS Tenant Outlets */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Outlet SaaS</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-sky-600 dark:text-sky-400">1 Outlet</p>
          <span className="text-[11px] text-slate-400 font-medium">Tenant Aktif ID: {tenant.id}</span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'leads'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📋 Data Prospek Form Demo ({prospectLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'tenants'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🔑 Manajemen Tenant &amp; Masa Uji Coba 14 Hari
        </button>
      </div>

      {/* TAB 1: DATA PROSPEK (DEMO REQUESTS) */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Data Prospek Pendaftar Uji Coba Demo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar pengunjung yang mengisi form demo SaaS (Nama, Email, No WhatsApp).
              </p>
            </div>

            {/* Filter Status */}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="pb-3">Nama &amp; Usaha</th>
                  <th className="pb-3">Email &amp; No Kontak</th>
                  <th className="pb-3">Tanggal Daftar</th>
                  <th className="pb-3">Status Prospek</th>
                  <th className="pb-3 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada data prospek yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const waLink = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Halo Kak ${lead.name} dari ${lead.business_name}, terima kasih telah mendaftar Uji Coba Demo SaaS ROTARI! Kapan waktu yang tepat untuk kita jadwalkan demo online?`
                    )}`;

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
                                const msg = `Halo Kak ${lead.name} dari ${lead.business_name}, terima kasih telah mendaftar Uji Coba Demo SaaS ROTARI! Kapan waktu yang tepat untuk kita jadwalkan demo online?`;
                                setWaOpenedStatus(true);
                                setTimeout(() => setWaOpenedStatus(false), 3500);
                                openWhatsAppChat(lead.phone, msg);
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
      )}

      {/* TAB 2: MANAJEMEN TENANT & MASA UJI COBA 14 HARI */}
      {activeTab === 'tenants' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                Manajemen Outlet Tenant &amp; Masa Uji Coba 14 Hari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kontrol kunci masa berlaku trial 14 hari dan status berlangganan outlet SaaS.
              </p>
            </div>
          </div>

          {/* Active Tenant Control Card */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-lg border border-sky-200">
                  {tenant.business_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{tenant.business_name}</h3>
                  <p className="text-xs text-slate-500">ID Outlet: {tenant.id} | Alamat: {tenant.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {tenant.subscription_status === 'active' ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> BERLANGGANAN AKTIF
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
                <span>Durasi Masa Trial (14 Hari Standard)</span>
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

            {/* Super Admin Controller Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  extendTrial(14);
                  alert("Berhasil memperpanjang Masa Trial selama +14 Hari!");
                }}
                className="px-4 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Perpanjang +14 Hari Trial</span>
              </button>

              <button
                onClick={() => {
                  activateSubscription();
                  alert("Outlet berhasil diaktifkan ke Status Berlangganan Penuh!");
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Aktivasi Langganan Penuh (Berbayar)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

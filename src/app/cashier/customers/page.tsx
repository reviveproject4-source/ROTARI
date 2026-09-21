"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { Users, Lock, ShieldAlert, Upload, FileSpreadsheet, CheckCircle2, X } from "lucide-react";

export default function CashierCustomersPage() {
  const { customers, currentUser, importCustomers } = useTenant();
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawText, setRawText] = useState("");
  const [importCount, setImportCount] = useState<number | null>(null);

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const lines = rawText.trim().split("\n");
    const parsedCusts: Array<{ name: string; phone: string }> = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const phone = parts[1];
        if (name && phone) {
          parsedCusts.push({ name, phone });
        }
      }
    });

    if (parsedCusts.length > 0) {
      const count = importCustomers(parsedCusts);
      setImportCount(count);
      setRawText("");
      setTimeout(() => {
        setShowImportModal(false);
        setImportCount(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Data Pelanggan Toko ({currentUser.role === 'owner' ? 'Owner Access' : 'Mode Kasir'})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'owner' && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data Pelanggan</span>
            </button>
          )}

          <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Mode Read-Only Kasir</span>
          </div>
        </div>
      </div>

      {/* Modal Import Bulk Data Pelanggan */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileSpreadsheet className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Import Data Pelanggan Owner
                </h3>
                <p className="text-xs text-slate-500">Paste CSV/Text format: Nama Pelanggan, No WhatsApp</p>
              </div>
            </div>

            {importCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Berhasil meng-import {importCount} data pelanggan!</span>
              </div>
            )}

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Data CSV / Excel (Baris demi Baris):
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Contoh:\nAndi Saputra, 081299887766\nDewi Lestari, 085677889900\nRian Hidayat, 087811223344`}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md"
                >
                  Proses Import Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
          Daftar Pelanggan Terdaftar ({customers.length})
        </h2>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.churn_status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.churn_status === 'at_risk_45'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {c.churn_status === 'active' ? 'Aktif' : c.churn_status === 'at_risk_45' ? 'Dormant (>45d)' : 'Lost (>90d)'}
                  </span>
                  <span className="text-xs text-slate-400">• Telp: {c.phone}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{c.name}</h3>
                <p className="text-xs text-slate-500">
                  Kunjungan Terakhir: {new Date(c.last_order_at).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Read-Only
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

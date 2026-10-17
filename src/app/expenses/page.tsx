"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  TrendingDown, 
  PieChart,
  Tag
} from "lucide-react";

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, totalOperationalExpenses, totalCashExpenses, totalTransferExpenses } = useTenant();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<'fixed' | 'variable'>('fixed');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    addExpense({
      title,
      category,
      payment_method: paymentMethod,
      amount: Number(amount),
      expense_date: expenseDate,
      notes,
    });

    setTitle("");
    setAmount("");
    setNotes("");
  };

  const fixedTotal = expenses
    .filter((e) => e.category === "fixed")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const variableTotal = expenses
    .filter((e) => e.category === "variable")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Manajemen Biaya Operasional Toko
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modul add-on opsional untuk pencatatan pengeluaran operasional toko.
          </p>
        </div>
      </div>

      {/* Fitur Add-On Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-black text-xs">
            🔒 Add-On
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Modul Tambahan (Fitur Add-On)
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Menu biaya operasional telah disembunyikan dari navigasi utama dan disiapkan sebagai modul add-on.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Biaya Operasional</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            Rp {totalOperationalExpenses.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400">Total seluruh beban pengeluaran</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pengeluaran Cash</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            Rp {totalCashExpenses.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400">Dibayar tunai dari laci kas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Pengeluaran Transfer</span>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            Rp {totalTransferExpenses.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400">Dibayar dari rekening bank</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Tetap vs Variabel</span>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
            Tetap: Rp {fixedTotal.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-slate-400">Variabel: Rp {variableTotal.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Input Biaya */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-emerald-600" />
            Tambah Catatan Biaya Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Kategori Biaya *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('fixed')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    category === 'fixed'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Biaya Tetap (Fixed)
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('variable')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    category === 'variable'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Biaya Variabel
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Metode Pembayaran Biaya *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  💵 Cash (Tunai Laci)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    paymentMethod === 'transfer'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  💳 Transfer / Bank
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi / Nama Biaya *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="misal: Pembayaran Listrik Toko"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Pengeluaran (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                placeholder="misal: 450000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan kwitansi atau bukti bayar..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
            >
              Simpan Biaya Operasional
            </button>
          </form>
        </div>

        {/* Tabel Daftar Pengeluaran */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Riwayat Biaya Operasional
          </h2>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {expenses.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-12">Belum ada catatan pengeluaran biaya.</p>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        exp.category === 'fixed'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {exp.category === 'fixed' ? 'Biaya Tetap' : 'Biaya Variabel'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        (exp.payment_method || 'cash') === 'cash'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {(exp.payment_method || 'cash') === 'cash' ? '💵 Cash' : '💳 Transfer'}
                      </span>
                      <span className="text-xs text-slate-400">{exp.expense_date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{exp.title}</h4>
                    {exp.notes && <p className="text-xs text-slate-500">{exp.notes}</p>}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Rp {Number(exp.amount).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

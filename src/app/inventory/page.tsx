"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { Package, AlertTriangle, CheckCircle2, Layers, Upload, FileSpreadsheet, X } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const { productsServices, importProductsServices } = useTenant();
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawText, setRawText] = useState("");
  const [importCount, setImportCount] = useState<number | null>(null);

  const productsList = productsServices.filter((ps) => ps.type === 'product');
  const servicesList = productsServices.filter((ps) => ps.type === 'service');
  const highStockProducts = productsList.filter((p) => p.stock >= 40);
  const stagnantServices = servicesList.filter((s) =>
    s.is_dead_stock ||
    !s.last_sold_at ||
    (Date.now() - new Date(s.last_sold_at).getTime()) > 14 * 86400000
  );

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const lines = rawText.trim().split("\n");
    const parsedItems: Array<{
      name: string;
      type: 'product' | 'service';
      cost_price: number;
      sell_price: number;
      stock: number;
    }> = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        const name = parts[0];
        const typeStr = parts[1]?.toLowerCase() === 'product' ? 'product' : 'service';
        const cost_price = Number(parts[2]) || 0;
        const sell_price = Number(parts[3]) || cost_price * 1.5;
        const stock = Number(parts[4]) || (typeStr === 'product' ? 10 : 0);

        if (name) {
          parsedItems.push({
            name,
            type: typeStr,
            cost_price,
            sell_price,
            stock,
          });
        }
      }
    });

    if (parsedItems.length > 0) {
      const count = importProductsServices(parsedItems);
      setImportCount(count);
      setRawText("");
      setTimeout(() => {
        setShowImportModal(false);
        setImportCount(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Inventory &amp; Stok Layanan/Produk
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Import Layanan/Produk</span>
          </button>

          <Link
            href="/catalog"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition"
          >
            + Tambah Manual
          </Link>
        </div>
      </div>

      {/* Modal Import Bulk Data Layanan/Produk */}
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
                  Import Layanan &amp; Data Produk Owner
                </h3>
                <p className="text-xs text-slate-500">Paste CSV/Text format: Nama, Tipe (service/product), HPP, Harga Jual, Stok</p>
              </div>
            </div>

            {importCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Berhasil meng-import {importCount} data layanan/produk!</span>
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
                  placeholder={`Contoh:\nDeep Cleaning Sneaker, service, 10000, 45000, 0\nRecolor Leather Bag, service, 30000, 150000, 0\nCleaner Spray 250ml, product, 20000, 40000, 25`}
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
                  Proses Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operational Alerts */}
      {(highStockProducts.length > 0 || stagnantServices.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Stok Tinggi</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">Beberapa produk memiliki stok yang perlu didorong penjualannya.</p>
            <div className="space-y-2">
              {highStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300">{p.stock} pcs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Layanan Belum Laku</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">Layanan yang belum memiliki transaksi dalam 14 hari terakhir perlu diperhatikan.</p>
            <div className="space-y-2">
              {stagnantServices.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                    {!s.last_sold_at ? "Belum pernah laku" : "Tidak laku >14 hari"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Barang Ritel & Stok */}
      <div className="space-y-6">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Stok Barang Ritel Fisik ({productsList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productsList.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Stok Gudang
                  </span>
                  {p.is_dead_stock && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Dead Stock
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{p.name}</h3>
                <p className="text-xs text-slate-500">
                  HPP: Rp {p.cost_price.toLocaleString("id-ID")} • Jual: Rp {p.sell_price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Sisa Stok</span>
                <span className={`text-xl font-extrabold ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {p.stock} pcs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layanan Jasa */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          Daftar Layanan Jasa Toko ({servicesList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesList.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Layanan Jasa
                  </span>
                  {s.is_dead_stock && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Stagnan 14d
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{s.name}</h3>
                <p className="text-xs text-slate-500">
                  HPP: Rp {s.cost_price.toLocaleString("id-ID")} • Jual: Rp {s.sell_price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                  Siap Dipesan
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

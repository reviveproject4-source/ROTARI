"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { ProductService } from "@/types";
import { Package, Plus, Trash2, Clock, Layers, AlertTriangle } from "lucide-react";

export default function CatalogPage() {
  const { productsServices, addProductService, deleteProductService } = useTenant();

  const [name, setName] = useState("");
  const [type, setType] = useState<'product' | 'service'>('service');
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">(120);
  const [rawMaterialCost, setRawMaterialCost] = useState<number | "">(0);
  const [stock, setStock] = useState<number | "">(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !costPrice || !sellPrice) return;

    addProductService({
      name,
      type,
      cost_price: Number(costPrice),
      sell_price: Number(sellPrice),
      duration_minutes: type === 'service' ? Number(durationMinutes) : undefined,
      raw_material_cost: type === 'service' ? Number(rawMaterialCost) : undefined,
      stock: type === 'product' ? Number(stock) : 0,
    });

    setName("");
    setCostPrice("");
    setSellPrice("");
    setStock(0);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Katalog Hybrid (Produk Ritel & Layanan Jasa)
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Add Product/Service */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-sky-600" />
            Tambah Item Katalog Hybrid
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Tipe Katalog *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('service')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    type === 'service'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Layanan Jasa
                </button>
                <button
                  type="button"
                  onClick={() => setType('product')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    type === 'product'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Barang Fisik (Ritel)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Nama Produk / Layanan *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Leather Recolor / Insole Gel"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Harga Modal (HPP) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="10000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Harga Jual *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="45000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-sky-600 dark:text-sky-400"
                />
              </div>
            </div>

            {type === 'service' ? (
              <div className="grid grid-cols-2 gap-3 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900">
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : "")}
                    placeholder="180"
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                    Bahan Habis Pakai (Rp)
                  </label>
                  <input
                    type="number"
                    value={rawMaterialCost}
                    onChange={(e) => setRawMaterialCost(e.target.value ? Number(e.target.value) : "")}
                    placeholder="5000"
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Stok Fisik Rak
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  placeholder="24"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition"
            >
              Simpan ke Katalog
            </button>
          </form>
        </div>

        {/* List Catalog */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Daftar Katalog Hybrid ({productsServices.length})
          </h2>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {productsServices.map((ps) => (
              <div key={ps.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ps.type === 'service'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {ps.type === 'service' ? 'Layanan Jasa' : `Barang Ritel (Stok: ${ps.stock})`}
                    </span>
                    {ps.is_dead_stock && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {ps.type === 'product' ? 'Dead Stock Fisik' : 'Zero Traction Service'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ps.name}</h4>
                  <div className="text-xs text-slate-500 space-x-3">
                    <span>HPP: Rp {ps.cost_price.toLocaleString("id-ID")}</span>
                    <span>•</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">Jual: Rp {ps.sell_price.toLocaleString("id-ID")}</span>
                    {ps.duration_minutes && <span>• Durasi: {ps.duration_minutes} menit</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteProductService(ps.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

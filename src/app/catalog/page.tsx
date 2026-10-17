"use client";

import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { Package, Plus, Trash2, Clock, Layers, AlertTriangle, Store, Wrench, Utensils } from "lucide-react";

export default function CatalogPage() {
  const { tenant, productsServices, addProductService, deleteProductService } = useTenant();
  const businessType = tenant.business_type || 'service';

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
            {businessType === 'restaurant'
              ? 'Katalog Menu & Bahan Resto/Cafe'
              : businessType === 'retail'
              ? 'Katalog Produk Toko Retail'
              : 'Katalog Layanan & Sparepart Jasa'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standar SaaS: HPP dicatat murni harga beli kulakan / bahan baku, tidak rumit.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {businessType === 'restaurant' ? (
            <Utensils className="w-4 h-4 text-amber-600" />
          ) : businessType === 'retail' ? (
            <Store className="w-4 h-4 text-sky-600" />
          ) : (
            <Wrench className="w-4 h-4 text-indigo-600" />
          )}
          <span>Archetype: {businessType.toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Add Product/Service */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-sky-600" />
            Tambah Item Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Tipe Item Katalog *
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
                  {businessType === 'restaurant' ? 'Menu Olahan/Saji' : businessType === 'retail' ? 'Layanan Tambahan' : 'Layanan Jasa'}
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
                  {businessType === 'restaurant' ? 'Bahan / Minuman Kemasan' : businessType === 'retail' ? 'Barang Fisik Retail' : 'Bahan / Sparepart'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Nama Item *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  businessType === 'restaurant'
                    ? 'misal: Es Kopi Susu Aren / Biji Kopi Robusta 1kg'
                    : businessType === 'retail'
                    ? 'misal: Kaos Polos Combed 30s / Sabun Cuci 500ml'
                    : 'misal: Deep Cleaning Sepatu / Sol Karet Sepatu'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {businessType === 'restaurant'
                    ? 'Harga Beli Bahan (HPP) *'
                    : businessType === 'retail'
                    ? 'Harga Kulakan (HPP) *'
                    : 'Harga Modal (HPP) *'}
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
                    Durasi Pengerjaan / Masak (Menit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : "")}
                    placeholder="120"
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 mb-1">
                    Biaya Bahan Pendukung (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={rawMaterialCost}
                    onChange={(e) => setRawMaterialCost(e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
                <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                  Stok Awal Fisik *
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  placeholder="20"
                  className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-xs font-bold"
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

        {/* List of Products & Services */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Daftar Item Terdaftar ({productsServices.length})
            </h2>
          </div>

          <div className="space-y-3">
            {productsServices.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'service'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {item.type === 'service'
                        ? (businessType === 'restaurant' ? 'Menu Olahan' : 'Layanan Jasa')
                        : (businessType === 'restaurant' ? 'Bahan / Minuman Kemasan' : 'Barang Fisik')}
                    </span>
                    {item.is_dead_stock && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Dead Stock
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{item.name}</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                    <span>HPP: Rp {item.cost_price.toLocaleString("id-ID")}</span>
                    <span>Jual: Rp {item.sell_price.toLocaleString("id-ID")}</span>
                    {item.type === 'product' && <span>Stok: {item.stock} pcs</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteProductService(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition"
                  title="Hapus Item"
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

"use client";

import { useState, useMemo } from "react";
import { useTenant } from "@/lib/tenant-context";
import { 
  Users, 
  Lock, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  X, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  RefreshCw,
  Phone,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Pencil,
  Trash2,
  UserPlus,
  Plus
} from "lucide-react";

type PosPreset = "auto" | "moka" | "pawoon" | "majoo" | "olsera" | "kasir_pintar" | "standard_excel";

interface ParsedCustomerPreview {
  rawLine: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_spent?: number;
  total_orders?: number;
  notes?: string;
  isValid: boolean;
  isExisting: boolean;
  phoneNormalized: boolean;
  validationError?: string;
}

export default function CashierCustomersPage() {
  const { customers, currentUser, importCustomers, addCustomer, updateCustomer, deleteCustomer, tenant } = useTenant();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Form input konsumen baru (bisa dilakukan oleh kasir & owner)
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  // Form edit konsumen (khusus owner/kepala cabang)
  const [editCustForm, setEditCustForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [activeTab, setActiveTab] = useState<"paste" | "file">("file");
  const [selectedPreset, setSelectedPreset] = useState<PosPreset>("auto");
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [importCount, setImportCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "at_risk_45" | "lost_90">("all");
  
  // Custom Column Mappings (optional manual override)
  const [colMappingName, setColMappingName] = useState<string>("auto");
  const [colMappingPhone, setColMappingPhone] = useState<string>("auto");
  const [colMappingEmail, setColMappingEmail] = useState<string>("auto");
  const [colMappingAddress, setColMappingAddress] = useState<string>("auto");

  // Phone Normalizer helper
  const normalizeIndonesianPhone = (raw: string): { normalized: string; wasModified: boolean; isValid: boolean } => {
    let clean = raw.trim().replace(/[^0-9+]/g, "");
    const original = clean;

    if (clean.startsWith("+62")) {
      clean = "0" + clean.slice(3);
    } else if (clean.startsWith("62")) {
      clean = "0" + clean.slice(2);
    } else if (clean.startsWith("8") && clean.length >= 9) {
      // Common when Excel drops leading zero
      clean = "0" + clean;
    }

    const isValid = /^08[1-9][0-9]{7,11}$/.test(clean);
    return {
      normalized: clean,
      wasModified: clean !== original,
      isValid,
    };
  };

  // Smart universal delimiter detector
  const detectDelimiter = (text: string): string => {
    const lines = text.trim().split("\n").filter((l) => l.trim().length > 0).slice(0, 5);
    if (lines.length === 0) return ",";

    const commaCounts = lines.map((l) => (l.match(/,/g) || []).length);
    const semicolonCounts = lines.map((l) => (l.match(/;/g) || []).length);
    const tabCounts = lines.map((l) => (l.match(/\t/g) || []).length);
    const pipeCounts = lines.map((l) => (l.match(/\|/g) || []).length);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgTab = avg(tabCounts);
    const avgSemicolon = avg(semicolonCounts);
    const avgComma = avg(commaCounts);
    const avgPipe = avg(pipeCounts);

    if (avgTab > 0 && avgTab >= avgComma && avgTab >= avgSemicolon) return "\t";
    if (avgSemicolon > 0 && avgSemicolon >= avgComma) return ";";
    if (avgPipe > 0 && avgPipe >= avgComma) return "|";
    return ",";
  };

  // Parse CSV line safely with quotes
  const parseLineWithQuotes = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ""));
    return result;
  };

  // Parse & preview data
  const parsedPreview = useMemo<ParsedCustomerPreview[]>(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.trim().split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const delimiter = detectDelimiter(rawText);
    const firstLineParts = parseLineWithQuotes(lines[0], delimiter);

    // Check if first line is a header
    const hasHeader = firstLineParts.some((p) =>
      /(nama|name|customer|pelanggan|telepon|phone|hp|handphone|wa|email|alamat|address)/i.test(p)
    );

    const headers = hasHeader ? firstLineParts.map((h) => h.toLowerCase()) : [];
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Detect column indexes
    let nameIdx = -1;
    let phoneIdx = -1;
    let emailIdx = -1;
    let addressIdx = -1;
    let spentIdx = -1;
    let orderIdx = -1;

    if (hasHeader) {
      nameIdx = headers.findIndex((h) => /(nama|customer|pelanggan|client|full_?name)/i.test(h));
      phoneIdx = headers.findIndex((h) => /(phone|telp|telepon|hp|handphone|wa|whatsapp|mobile|no_?hp|kontak)/i.test(h));
      emailIdx = headers.findIndex((h) => /(email|surel|mail)/i.test(h));
      addressIdx = headers.findIndex((h) => /(alamat|address|kota|city|domisili)/i.test(h));
      spentIdx = headers.findIndex((h) => /(spent|belanja|total_?omset|total_?nominal|sales)/i.test(h));
      orderIdx = headers.findIndex((h) => /(kunjungan|visit|orders|nota|transaksi)/i.test(h));
    }

    // Preset overrides if user selected explicit POS template
    if (selectedPreset === "moka") {
      nameIdx = 0; phoneIdx = 1; emailIdx = 2; spentIdx = 3; orderIdx = 4;
    } else if (selectedPreset === "pawoon") {
      nameIdx = 0; phoneIdx = 1; emailIdx = 2; addressIdx = 3; spentIdx = 4;
    } else if (selectedPreset === "majoo") {
      nameIdx = 0; phoneIdx = 1; emailIdx = 2; addressIdx = 3; orderIdx = 4;
    } else if (selectedPreset === "kasir_pintar") {
      nameIdx = 0; phoneIdx = 1; emailIdx = 2; addressIdx = 3;
    } else if (selectedPreset === "standard_excel") {
      nameIdx = 0; phoneIdx = 1; emailIdx = 2; addressIdx = 3;
    }

    // Default fallback if not found
    if (nameIdx === -1) nameIdx = 0;
    if (phoneIdx === -1) phoneIdx = firstLineParts.length > 1 ? 1 : 0;

    const existingPhones = new Set(
      customers.map((c) => c.phone.trim().replace(/[^0-9]/g, ""))
    );

    return dataLines.map((line) => {
      const parts = parseLineWithQuotes(line, delimiter);
      const rawName = parts[nameIdx] || "Pelanggan Baru";
      const rawPhone = parts[phoneIdx] || "";
      const rawEmail = emailIdx >= 0 ? parts[emailIdx] : undefined;
      const rawAddress = addressIdx >= 0 ? parts[addressIdx] : undefined;
      const rawSpent = spentIdx >= 0 ? Number(parts[spentIdx]?.replace(/[^0-9]/g, "") || 0) : 0;
      const rawOrders = orderIdx >= 0 ? Number(parts[orderIdx]?.replace(/[^0-9]/g, "") || 1) : 1;

      const { normalized, wasModified, isValid } = normalizeIndonesianPhone(rawPhone);
      const isExisting = existingPhones.has(normalized);

      let validationError: string | undefined;
      if (!rawPhone) validationError = "Nomor HP kosong";
      else if (!isValid) validationError = "Format HP tidak valid (Wajib 08xx / min 10 digit)";

      return {
        rawLine: line,
        name: rawName,
        phone: normalized,
        email: rawEmail && rawEmail.includes("@") ? rawEmail : undefined,
        address: rawAddress,
        total_spent: rawSpent > 0 ? rawSpent : undefined,
        total_orders: rawOrders > 0 ? rawOrders : undefined,
        isValid,
        isExisting,
        phoneNormalized: wasModified,
        validationError,
      };
    });
  }, [rawText, selectedPreset, customers]);

  const validParsedList = useMemo(() => parsedPreview.filter((p) => p.isValid), [parsedPreview]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
      }
    };
    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (validParsedList.length === 0) return;

    const toImport = validParsedList.map((p) => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
      address: p.address,
      total_orders: p.total_orders,
      total_spent: p.total_spent,
      notes: `Import Universal POS (${selectedPreset.toUpperCase()})`,
    }));

    const count = importCustomers(toImport);
    setImportCount(count);
    setRawText("");
    setFileName("");

    setTimeout(() => {
      setShowImportModal(false);
      setImportCount(null);
    }, 2500);
  };

  // Download Sample Template CSV
  const handleDownloadSample = (preset: "standard" | "moka" | "pawoon") => {
    let csvContent = "";
    let downloadFileName = "template_konsumen_radartoko.csv";

    if (preset === "moka") {
      downloadFileName = "template_import_moka_pos.csv";
      csvContent = "Customer Name,Phone,Email,Total Spent,Visit Count,Notes\n" +
        "Andi Pratama,081298765432,andi@example.com,1500000,4,Pelanggan VIP\n" +
        "Budi Santoso,085612345678,budi@example.com,850000,2,Langganan Sneakers\n" +
        "Rina Maharani,081390112233,rina@example.com,2300000,6,Treatment Tas & Sepatu";
    } else if (preset === "pawoon") {
      downloadFileName = "template_import_pawoon_pos.csv";
      csvContent = "Nama Pelanggan;Nomor Telepon;Email;Alamat;Total Transaksi;Kunjungan Terakhir\n" +
        "Dimas Saputra;082112223333;dimas@example.com;Karawaci Tangerang;1250000;2026-09-15\n" +
        "Nadia Putri;081277889900;nadia@example.com;Gading Serpong;950000;2026-09-20\n" +
        "Fajar Ramadhan;085700112233;fajar@example.com;Cipondoh Tangerang;1800000;2026-08-30";
    } else {
      downloadFileName = "template_import_universal.csv";
      csvContent = "Nama,No WhatsApp,Email,Alamat,Total Belanja,Jumlah Kunjungan\n" +
        "Kevin Wijaya,081188776655,kevin@example.com,Modernland Tangerang,750000,3\n" +
        "Salsa Amelia,082233445566,salsa@example.com,Lippo Karawaci,1450000,5\n" +
        "Yoga Kurniawan,081355667788,yoga@example.com,BSD City,550000,2";
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current customers list to CSV
  const handleExportCustomers = () => {
    const headers = ["Nama Konsumen", "Nomor WhatsApp", "Email", "Alamat", "Status Churn", "Total Order", "Total Belanja (Rp)", "Order Terakhir"];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.address || ""}"`,
      `"${c.churn_status}"`,
      c.total_orders || 0,
      c.total_spent || 0,
      `"${new Date(c.last_order_at).toLocaleDateString("id-ID")}"`
    ]);

    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `database_konsumen_${tenant.business_name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered customer list for display
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === "all" ? true : c.churn_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const activeCount = customers.filter((c) => c.churn_status === "active").length;
  const dormantCount = customers.filter((c) => c.churn_status === "at_risk_45").length;
  const lostCount = customers.filter((c) => c.churn_status === "lost_90").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Universal Importer
            </span>
            <span className="text-xs text-slate-400 font-medium">Multi-POS Compatible</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5 mt-1">
            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Database &amp; Import Konsumen ({currentUser.role === "owner" ? "Akses Owner" : "Mode Kasir"})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola data pelanggan dan import otomatis dari semua aplikasi POS (Moka, Pawoon, Majoo, Olsera, Kasir Pintar, Excel, Google Sheets).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tombol Input Konsumen Baru - Bisa dilakukan oleh KASIR & OWNER */}
          <button
            onClick={() => {
              setNewCustForm({ name: "", phone: "", email: "", address: "", notes: "" });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Input Konsumen Baru</span>
          </button>

          {currentUser.role === "owner" ? (
            <>
              <button
                onClick={handleExportCustomers}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                title="Download CSV database pelanggan"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import dari POS Lain</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Kasir: Input Diizinkan • Edit/Hapus Khusus Owner</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Konsumen</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{customers.length}</p>
          <span className="text-[10px] text-slate-400">Terdaftar di sistem</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Pelanggan Aktif</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-[10px] text-slate-400">Order &lt; 30 hari</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Dormant (&ge;30 Hari)</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{dormantCount}</p>
          <span className="text-[10px] text-slate-400">Perlu diingatkan WA</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Lost (&ge;60 Hari)</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{lostCount}</p>
          <span className="text-[10px] text-slate-400">Target voucher retensi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, nomor HP, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Semua ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("at_risk_45")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "at_risk_45"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Dormant ({dormantCount})
            </button>
            <button
              onClick={() => setStatusFilter("lost_90")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === "lost_90"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Lost ({lostCount})
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Daftar Pelanggan ({filteredCustomers.length})
          </h2>
          <span className="text-xs text-slate-400">
            {searchQuery ? `Hasil pencarian "${searchQuery}"` : "Urutan kunjungan terbaru"}
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">Tidak ada pelanggan yang cocok dengan filter.</p>
            {currentUser.role === "owner" && (
              <button
                onClick={() => setShowImportModal(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Import Pelanggan Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Nama Pelanggan</th>
                  <th className="pb-3">No WhatsApp / HP</th>
                  <th className="pb-3">Status Retensi</th>
                  <th className="pb-3 text-right">Total Transaksi</th>
                  <th className="pb-3 text-right">Total Belanja</th>
                  <th className="pb-3">Kunjungan Terakhir</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 pl-2">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                      {c.address && <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.address}</div>}
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {c.phone}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                        c.churn_status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : c.churn_status === "at_risk_45"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {c.churn_status === "active" ? "Aktif" : c.churn_status === "at_risk_45" ? "Dormant (≥30d)" : "Lost (≥60d)"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {c.total_orders || 1}x
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      Rp {(c.total_spent || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(c.last_order_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${c.phone.replace(/^0/, "62")}?text=Halo%20Kak%20${encodeURIComponent(c.name)}%2C%20terima%20kasih%20telah%20menjadi%20pelanggan%20setia%20kami.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 font-bold text-[11px] transition"
                          title="Chat WhatsApp"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="hidden sm:inline">WA</span>
                        </a>

                        {/* Fitur Edit & Hapus KONSUMEN: KHUSUS OWNER / KEPALA CABANG */}
                        {currentUser.role === "owner" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCustomer(c);
                                setEditCustForm({
                                  name: c.name,
                                  phone: c.phone,
                                  email: c.email || "",
                                  address: c.address || "",
                                  notes: c.notes || ""
                                });
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 transition"
                              title="Edit Data Konsumen (Khusus Owner)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus data konsumen "${c.name}"? Data ini akan dihapus dari sistem.`)) {
                                  deleteCustomer(c.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition"
                              title="Hapus Konsumen (Khusus Owner)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: UNIVERSAL POS CUSTOMER IMPORTER (OWNER FEATURE) */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => {
                setShowImportModal(false);
                setRawText("");
                setFileName("");
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                  Universal POS Customer Importer
                </h3>
                <p className="text-xs text-slate-500">
                  Import dari semua POS: Moka, Pawoon, Majoo, Olsera, Kasir Pintar, Excel, Google Sheets.
                </p>
              </div>
            </div>

            {/* Success alert */}
            {importCount !== null && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Berhasil meng-import &amp; memperbarui {importCount} data konsumen ke Radar Toko!</span>
              </div>
            )}

            {/* Presets and template buttons */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Format POS Sumber / Preset:
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contoh Format:</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample("standard")}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
                  >
                    Universal
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample("moka")}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
                  >
                    Moka
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSample("pawoon")}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
                  >
                    Pawoon
                  </button>
                </div>
              </div>

              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as PosPreset)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="auto">✨ Auto-Deteksi Universal (Otomatis Kenali Kolom &amp; Delimiter)</option>
                <option value="moka">☕ Moka POS (Customer Name, Phone, Email, Total Spent...)</option>
                <option value="pawoon">📱 Pawoon POS (Nama Pelanggan; Nomor Telepon; Email; Alamat...)</option>
                <option value="majoo">🏬 Majoo POS (Nama, No HP, Email, Alamat, Total Transaksi...)</option>
                <option value="olsera">🛍️ Olsera POS (Nama Customer, No WA, Email, Alamat...)</option>
                <option value="kasir_pintar">💡 Kasir Pintar (Nama, No Telepon / WA, Email, Alamat...)</option>
                <option value="standard_excel">📊 Google Sheets / Microsoft Excel (Kolom Bebas / Paste Langsung)</option>
              </select>
            </div>

            {/* Input Method Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`pb-2 text-xs font-black transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === "file"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File (.csv, .txt, .tsv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`pb-2 text-xs font-black transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === "paste"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Copy-Paste dari Excel / Tabel
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === "file" && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition">
                  <Upload className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {fileName ? `File terpilih: ${fileName}` : "Klik untuk upload file CSV / TXT / TSV ekspor POS"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Mendukung file ekspor dari Moka, Pawoon, Majoo, Olsera, Kasir Pintar, Excel, dll.
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Tab 2: Textarea Paste */}
            {activeTab === "paste" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paste baris data dari Excel / Google Sheets / Catatan teks:
                </label>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Contoh copy-paste dari Excel atau CSV:\nNama\tNo HP\tEmail\tAlamat\nAndi Pratama\t081298765432\tandi@mail.com\tBSD City\nBudi Santoso\t+6285612345678\tbudi@mail.com\tCikokol\nDewi Lestari\t081390112233\tdewi@mail.com\tSerpong`}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Live Parsing Preview */}
            {parsedPreview.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      Preview Data Hasil Deteksi ({parsedPreview.length} Baris):
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {validParsedList.length} Siap Diimpor
                    </span>
                    {parsedPreview.length - validParsedList.length > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        {parsedPreview.length - validParsedList.length} Format Tidak Valid
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Otomatis normalisasi +62 dan nomor HP Excel
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Nama</th>
                        <th className="p-2.5">No WhatsApp</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Alamat</th>
                        <th className="p-2.5 text-right">Belanja / Kunjungan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedPreview.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className={row.isValid ? "hover:bg-slate-50 dark:hover:bg-slate-800/40" : "bg-rose-50/50 dark:bg-rose-950/20"}>
                          <td className="p-2.5">
                            {row.isValid ? (
                              row.isExisting ? (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  <RefreshCw className="w-2.5 h-2.5" /> Update Data
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Pelanggan Baru
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                <AlertCircle className="w-2.5 h-2.5" /> {row.validationError || "Gagal"}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                          <td className="p-2.5 font-mono">
                            {row.phone}
                            {row.phoneNormalized && (
                              <span className="text-[9px] text-purple-600 block">✓ Normal 08xx</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-500">{row.email || "-"}</td>
                          <td className="p-2.5 text-slate-500 truncate max-w-[120px]">{row.address || "-"}</td>
                          <td className="p-2.5 text-right text-slate-600 font-semibold">
                            {row.total_spent ? `Rp ${row.total_spent.toLocaleString("id-ID")}` : "-"}
                            {row.total_orders ? ` (${row.total_orders}x)` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedPreview.length > 15 && (
                  <p className="text-[11px] text-center text-slate-400 italic">
                    ... dan {parsedPreview.length - 15} baris data lainnya
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Otomatis cegah duplikasi nomor HP</span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setRawText("");
                    setFileName("");
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={validParsedList.length === 0}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Proses Import ({validParsedList.length} Konsumen)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INPUT KONSUMEN BARU (KASIR & OWNER BISA INPUT) */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Input Konsumen Baru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.role === 'owner' ? 'Akses Owner / Kepala Cabang' : 'Akses Kasir (Tambah Pelanggan Baru)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustForm.name.trim() || !newCustForm.phone.trim()) {
                  alert("Nama dan Nomor WhatsApp/HP wajib diisi!");
                  return;
                }
                const cleanPhone = newCustForm.phone.trim().replace(/[^0-9]/g, "");
                addCustomer({
                  name: newCustForm.name.trim(),
                  phone: cleanPhone.startsWith("62") ? "0" + cleanPhone.slice(2) : cleanPhone,
                  email: newCustForm.email.trim() || undefined,
                  address: newCustForm.address.trim() || undefined,
                  notes: newCustForm.notes.trim() || undefined,
                });
                setShowAddModal(false);
                setNewCustForm({ name: "", phone: "", email: "", address: "", notes: "" });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nama Konsumen *
                </label>
                <input
                  type="text"
                  required
                  value={newCustForm.name}
                  onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                  placeholder="misal: Hendra Gunawan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  No WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustForm.phone}
                  onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={newCustForm.email}
                  onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                  placeholder="hendra@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alamat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={newCustForm.address}
                  onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  placeholder="Alamat rumah / domisili pelanggan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={newCustForm.notes}
                  onChange={(e) => setNewCustForm({ ...newCustForm, notes: e.target.value })}
                  placeholder="misal: Langganan cuci sepatu, minta info promo"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  Simpan Konsumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT KONSUMEN (KHUSUS OWNER / KEPALA CABANG) */}
      {/* ======================================================== */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Edit Data Konsumen
                  </h3>
                  <p className="text-[11px] text-sky-600 font-semibold">
                    Khusus Wewenang Owner / Kepala Cabang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editCustForm.name.trim() || !editCustForm.phone.trim()) {
                  alert("Nama dan Nomor WhatsApp/HP wajib diisi!");
                  return;
                }
                const cleanPhone = editCustForm.phone.trim().replace(/[^0-9]/g, "");
                updateCustomer(editingCustomer.id, {
                  name: editCustForm.name.trim(),
                  phone: cleanPhone.startsWith("62") ? "0" + cleanPhone.slice(2) : cleanPhone,
                  email: editCustForm.email.trim() || undefined,
                  address: editCustForm.address.trim() || undefined,
                  notes: editCustForm.notes.trim() || undefined,
                });
                setEditingCustomer(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nama Konsumen *
                </label>
                <input
                  type="text"
                  required
                  value={editCustForm.name}
                  onChange={(e) => setEditCustForm({ ...editCustForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  No WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  value={editCustForm.phone}
                  onChange={(e) => setEditCustForm({ ...editCustForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={editCustForm.email}
                  onChange={(e) => setEditCustForm({ ...editCustForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Alamat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editCustForm.address}
                  onChange={(e) => setEditCustForm({ ...editCustForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={editCustForm.notes}
                  onChange={(e) => setEditCustForm({ ...editCustForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

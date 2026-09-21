"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/lib/tenant-context";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  ShieldCheck, 
  UserCheck, 
  Package, 
  Users,
  MessageSquareText,
  LogOut,
  Building2,
  ChevronRight,
  Bell,
  Sparkles,
  Layers,
  Store,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { LoginModal } from "./login-modal";

export function SaasShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    tenant, 
    currentUser, 
    updateTenant, 
    transactions, 
    daysRemainingInTrial, 
    isTrialExpired,
    extendTrial
  } = useTenant();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Owner Nav Items (Termasuk Super Admin & Demo Request)
  const ownerNavItems = [
    { href: "/", label: "Dashboard Utama", icon: LayoutDashboard, badge: null },
    { href: "/employees", label: "Data Pegawai", icon: Users, badge: null },
    { href: "/inventory", label: "Inventory & Stok", icon: Package, badge: null },
    { href: "/expenses", label: "Biaya Operasional", icon: DollarSign, badge: null },
    { href: "/crm", label: "CRM Laporan", icon: MessageSquareText, badge: "Laporan" },
    { href: "/super-admin", label: "Super Admin", icon: ShieldCheck, badge: "Platform" },
    { href: "/demo-request", label: "Form Demo", icon: Sparkles, badge: "Public" },
    { href: "/settings", label: "Pengaturan Outlet", icon: SettingsIcon, badge: null },
  ];

  // Cashier Nav Items (Exactly 4 items)
  const pendingQueueCount = transactions.filter((t) => t.status === "partially_paid" || t.work_status === "ready_for_pickup").length;

  const cashierNavItems = [
    { href: "/pos", label: "Buat Transaksi", icon: ShoppingCart, badge: pendingQueueCount > 0 ? `${pendingQueueCount} Sisa` : null },
    { href: "/cashier/customers", label: "Data Pelanggan", icon: Users, badge: "Read-Only" },
    { href: "/cashier/crm", label: "CRM Retensi", icon: MessageSquareText, badge: "Reminder" },
    { href: "/cashier/settings", label: "Setting Kasir", icon: SettingsIcon, badge: null },
  ];

  const currentNavItems = currentUser.role === "owner" ? ownerNavItems : cashierNavItems;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateTenant({ theme_preference: newTheme });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* 1. Left Sidebar Navigation (Modern SaaS Shell) */}
      <aside className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.business_name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0">
                {tenant.business_name.charAt(0)}
              </div>
            )}
            
            {!sidebarCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  {tenant.business_name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  SaaS Multi-Tenant
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Role Badge & Authenticated User Switcher */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  currentUser.role === 'owner' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  Role: {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                Ganti User (PIN)
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed && (
            <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Menu {currentUser.role === "owner" ? "Owner Platform" : "Kasir Operasional"}
            </span>
          )}

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? currentUser.role === "owner"
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer inside Sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="truncate text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
                </div>
              )}
            </div>

            {mounted && !sidebarCollapsed && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* 2. Main Content Canvas with Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 flex items-center justify-between z-20">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Outlet:</span>
              <strong className="text-slate-900 dark:text-slate-100">{tenant.business_name}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Trial Status Badge */}
            {tenant.subscription_status === 'active' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                Langganan Aktif
              </span>
            ) : isTrialExpired ? (
              <Link 
                href="/super-admin"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 animate-pulse"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                Trial Expired (Terkunci)
              </Link>
            ) : (
              <Link
                href="/super-admin"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 hover:bg-amber-200 transition"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Trial: Sisa {daysRemainingInTrial} Hari
              </Link>
            )}

            {mounted && (
              <button
                onClick={toggleTheme}
                className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
          </div>

        </header>

        {/* Scrollable Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 relative">
          
          {/* Trial Expiry Lock Screen (If Trial Expired and not on /super-admin or /demo-request) */}
          {isTrialExpired && pathname !== '/super-admin' && pathname !== '/demo-request' ? (
            <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md text-center space-y-4 border border-rose-200 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-black text-2xl">
                  🔒
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Masa Uji Coba 14 Hari Berakhir
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Akses outlet <strong>{tenant.business_name}</strong> telah terkunci karena batas masa uji coba 14 hari telah habis. Silakan hubungi Super Admin untuk aktivasi berlangganan atau perpanjangan lisensi.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/super-admin"
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition"
                  >
                    Buka Super Admin (Buka Kunci / Perpanjang)
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            children
          )}

        </main>

      </div>

    </div>
  );
}

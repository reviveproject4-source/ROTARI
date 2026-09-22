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
import { LoginScreen } from "./login-screen";
import { Menu, X as CloseIcon } from "lucide-react";

export function SaasShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    tenant, 
    currentUser, 
    isAuthenticated,
    logout,
    updateTenant, 
    transactions, 
    daysRemainingInTrial, 
    isTrialExpired,
    extendTrial
  } = useTenant();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Owner Nav Items (Operasional Outlet Owner)
  const ownerNavItems = [
    { href: "/", label: "Dashboard Utama", icon: LayoutDashboard, badge: null },
    { href: "/employees", label: "Data Pegawai", icon: Users, badge: null },
    { href: "/inventory", label: "Inventory & Stok", icon: Package, badge: null },
    { href: "/expenses", label: "Biaya Operasional", icon: DollarSign, badge: null },
    { href: "/crm", label: "CRM Laporan", icon: MessageSquareText, badge: "Laporan" },
    { href: "/settings", label: "Pengaturan Outlet", icon: SettingsIcon, badge: null },
  ];

  // Super Admin Nav Items (Khusus Super Admin)
  const superAdminNavItems = [
    { href: "/super-admin", label: "Dashboard Super Admin", icon: ShieldCheck, badge: "Super Admin" },
  ];

  // Cashier Nav Items (Exactly 4 items)
  const pendingQueueCount = transactions.filter((t) => t.status === "partially_paid" || t.work_status === "ready_for_pickup").length;

  const cashierNavItems = [
    { href: "/pos", label: "Buat Transaksi", icon: ShoppingCart, badge: pendingQueueCount > 0 ? `${pendingQueueCount} Sisa` : null },
    { href: "/cashier/customers", label: "Data Pelanggan", icon: Users, badge: "Read-Only" },
    { href: "/cashier/crm", label: "CRM Retensi", icon: MessageSquareText, badge: "Reminder" },
    { href: "/cashier/settings", label: "Setting Kasir", icon: SettingsIcon, badge: null },
  ];

  const isSuperAdminRoute = pathname === "/super-admin";
  const currentNavItems = (isSuperAdminRoute || currentUser.id === "user-super-admin" || currentUser.email === "superadmin@rotari.id")
    ? superAdminNavItems
    : currentUser.role === "owner" 
    ? ownerNavItems 
    : cashierNavItems;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateTenant({ theme_preference: newTheme });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 relative">
      
      {!isAuthenticated && <LoginScreen />}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 1. Left Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      } ${
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      }`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img 
              src="/rotari-logo.png" 
              alt="ROTARI Logo" 
              className="w-9 h-9 rounded-full object-contain bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0" 
            />
            
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <div className="truncate">
                <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  ROTARI
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  POS &amp; CRM Platform
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
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
              <div className="flex items-center space-x-2 text-[10px] font-extrabold">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Ganti User
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  onClick={() => logout()}
                  className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                >
                  <LogOut className="w-3 h-3" /> Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed && (
            <span className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
              Menu {isSuperAdminRoute || currentUser.id === "user-super-admin" || currentUser.email === "superadmin@rotari.id" ? "Super Admin Platform" : currentUser.role === "owner" ? "Owner Platform" : "Kasir Operasional"}
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
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-20">
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 truncate max-w-[140px] sm:max-w-xs">
              <Building2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <strong className="text-slate-900 dark:text-slate-100 truncate">{tenant.business_name}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Trial Status Badge */}
            {tenant.subscription_status === 'active' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                <span className="hidden sm:inline">Langganan </span>Aktif
              </span>
            ) : isTrialExpired ? (
              <Link 
                href="/super-admin"
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 animate-pulse"
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-rose-600" />
                Trial Expired
              </Link>
            ) : (
              <Link
                href="/super-admin"
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 hover:bg-amber-200 transition"
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Trial: {daysRemainingInTrial} Hari
              </Link>
            )}

            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme Mode"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
          </div>

        </header>

        {/* Scrollable Main Content Canvas (pb-24 for Sticky Mobile Bottom Nav) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-slate-50 dark:bg-slate-950 relative">
          
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

        {/* Sticky Mobile Bottom Navigation Bar for Smartphone Screens */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {currentNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? currentUser.role === "owner"
                      ? "text-sky-600 dark:text-sky-400 font-extrabold"
                      : "text-emerald-600 dark:text-emerald-400 font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? (currentUser.role === 'owner' ? 'text-sky-600' : 'text-emerald-600') : ''}`} />
                <span className="text-[10px] tracking-tight truncate max-w-[65px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>

      </div>

    </div>
  );
}

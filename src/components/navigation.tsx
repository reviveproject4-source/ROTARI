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
  UserCheck2,
  LogOut,
  Store
} from "lucide-react";
import { useState, useEffect } from "react";

export function Navigation() {
  const pathname = usePathname();
  const { tenant, currentUser, setCurrentUserRole, updateTenant } = useTenant();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Owner Nav Items (Hapus Kasir POS dari Owner Nav)
  const ownerNavItems = [
    { href: "/", label: "Dashboard Utama", icon: LayoutDashboard },
    { href: "/employees", label: "Pegawai", icon: Users },
    { href: "/inventory", label: "Inventory & Stok", icon: Package },
    { href: "/expenses", label: "Pengeluaran", icon: DollarSign },
    { href: "/crm", label: "CRM Laporan", icon: MessageSquareText },
    { href: "/settings", label: "Pengaturan", icon: SettingsIcon },
  ];

  // Cashier Nav Items (Exactly 4 navigation items: Buat Nota, Pelanggan, CRM, Setting)
  const cashierNavItems = [
    { href: "/pos", label: "Buat Nota", icon: ShoppingCart },
    { href: "/cashier/customers", label: "Pelanggan", icon: Users },
    { href: "/cashier/crm", label: "CRM", icon: MessageSquareText },
    { href: "/cashier/settings", label: "Setting", icon: SettingsIcon },
  ];

  const currentNavItems = currentUser.role === "owner" ? ownerNavItems : cashierNavItems;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateTenant({ theme_preference: newTheme });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Outlet Identity */}
          <div className="flex items-center space-x-3">
            <img 
              src="/rotari-logo.png" 
              alt="ROTARI Logo" 
              className="w-9 h-9 rounded-full object-contain bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-700" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  ROTARI ({tenant.business_name})
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  currentUser.role === 'owner' 
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' 
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {currentUser.role === 'owner' ? 'Owner Mode' : 'Kasir Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                Login: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? currentUser.role === 'owner' 
                        ? "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Role Switcher & Dark Mode Toggle */}
          <div className="flex items-center space-x-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Light / Dark Mode"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Authenticated User Role Badge */}
            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className={`px-2.5 py-1 rounded-lg uppercase ${
                currentUser.role === 'owner' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs transition ${
                  isActive
                    ? currentUser.role === 'owner' ? "text-sky-600 font-bold" : "text-emerald-600 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}

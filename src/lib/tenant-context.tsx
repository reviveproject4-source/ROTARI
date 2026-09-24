"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, Role, WorkStatus, PromoInstruction, ProspectLead } from "@/types";
import { 
  initialTenant, 
  initialUsers, 
  initialProductsServices, 
  initialExpenses, 
  initialCustomers, 
  initialTransactions, 
  initialCrmLogs, 
  initialPromoInstructions, 
  initialProspectLeads,
  SUPER_ADMIN_USER
} from "./initial-data";
import { supabase } from "./supabase";
import {
  persistTenantToSupabase,
  persistUserToSupabase,
  persistCustomerToSupabase,
  persistProductServiceToSupabase,
  deleteProductServiceFromSupabase,
  persistExpenseToSupabase,
  deleteExpenseFromSupabase,
  persistTransactionToSupabase,
  persistCrmLogToSupabase,
  persistPromoInstructionToSupabase,
  persistProspectLeadToSupabase,
} from "./supabase-sync";

interface TenantContextType {
  tenant: Tenant;
  currentUser: User;
  isAuthenticated: boolean;
  logout: () => void;
  users: User[];
  productsServices: ProductService[];
  expenses: OperationalExpense[];
  customers: Customer[];
  transactions: Transaction[];
  crmLogs: CrmLog[];
  promoInstructions: PromoInstruction[];
  prospectLeads: ProspectLead[];
  
  // Trial 14 Hari calculation
  daysRemainingInTrial: number;
  isTrialExpired: boolean;
  extendTrial: (daysToAdd: number) => void;
  activateSubscription: () => void;
  
  // Bulk import for Owner
  importProductsServices: (items: Array<Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">>) => number;
  importCustomers: (custs: Array<Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">>) => number;
  
  // Prospect Lead Methods
  addProspectLead: (lead: Omit<ProspectLead, "id" | "created_at" | "status">) => void;
  updateLeadStatus: (id: string, status: 'new' | 'contacted' | 'converted') => void;
  deleteProspectLead: (id: string) => void;

  updateTenant: (updated: Partial<Tenant>) => void;
  setCurrentUserRole: (role: Role) => void;
  setCurrentUserWithPin: (userId: string, pin: string) => boolean;
  loginWithCredentials: (identifier: string, pin: string) => { success: boolean; user?: User };
  registerDemoTenant: (data: { name: string; email: string; phone: string; businessName: string; pinCode?: string }) => User;
  updateUserPin: (userId: string, newPin: string) => void;
  toggleAttendance: (userId: string) => void;
  addUser: (user: Omit<User, "id" | "tenant_id" | "is_active">) => void;
  deleteUser: (id: string) => void;
  addProductService: (item: Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">) => void;
  deleteProductService: (id: string) => void;
  addExpense: (expense: Omit<OperationalExpense, "id" | "tenant_id">) => void;
  deleteExpense: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "tenant_id" | "invoice_number" | "created_at">) => Transaction;
  updateWorkStatus: (transactionId: string, status: WorkStatus) => void;
  settleTransaction: (transactionId: string) => void;
  addCrmLog: (log: Omit<CrmLog, "id" | "tenant_id" | "sent_at" | "is_converted">) => void;
  addCustomer: (cust: Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">) => Customer;
  addPromoInstruction: (instr: Omit<PromoInstruction, "id" | "tenant_id" | "created_at" | "status">) => void;
  completePromoInstruction: (id: string) => void;
  
  // Financial metrics
  totalRevenue: number;
  totalHPP: number;
  totalOperationalExpenses: number;
  netProfit: number;
  totalCashReceived: number;
  totalTransferReceived: number;
  
  // CRM Metrics
  totalWaSent: number;
  crmConvertedCount: number;
  crmConvertedAmount: number;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Helper safe JSON parse for SessionStorage
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save to sessionStorage:", err);
  }
}

function getStorageItemWithMerge<T extends { id: string }>(key: string, initialData: T[]): T[] {
  if (typeof window === "undefined") return initialData;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return initialData;
    const saved = JSON.parse(raw) as T[];
    if (!Array.isArray(saved) || saved.length === 0) return initialData;
    const merged = [...saved];
    initialData.forEach((item) => {
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item);
      }
    });
    return merged;
  } catch {
    return initialData;
  }
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  // Multi-Tenant Registries (Memory & SessionStorage)
  const [tenants, setTenants] = useState<Tenant[]>(() => getStorageItemWithMerge("rotari_tenants_registry", [initialTenant]));
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("rotari_active_tenant_id") || "tenant-001";
    }
    return "tenant-001";
  });

  const [users, setUsers] = useState<User[]>(() => getStorageItemWithMerge("rotari_users_registry", initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => initialUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Repositories
  const [allProductsServices, setAllProductsServices] = useState<ProductService[]>(() => getStorageItemWithMerge("rotari_products_registry", initialProductsServices));
  const [allExpenses, setAllExpenses] = useState<OperationalExpense[]>(() => getStorageItemWithMerge("rotari_expenses_registry", initialExpenses));
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => getStorageItemWithMerge("rotari_customers_registry", initialCustomers));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => getStorageItemWithMerge("rotari_transactions_registry", initialTransactions));
  const [allCrmLogs, setAllCrmLogs] = useState<CrmLog[]>(() => getStorageItemWithMerge("rotari_crm_logs_registry", initialCrmLogs));
  const [allPromoInstructions, setAllPromoInstructions] = useState<PromoInstruction[]>(() => getStorageItemWithMerge("rotari_promo_instructions_registry", initialPromoInstructions));
  const [prospectLeads, setProspectLeads] = useState<ProspectLead[]>(() => getStorageItemWithMerge("rotari_prospect_leads_registry", initialProspectLeads));

  // Helper: Resolve User Profile & Tenant Identity from Supabase Auth Session
  const resolveTenantUserFromSession = (sessionUser: any): { user: User | null; error?: string } => {
    if (!sessionUser) return { user: null, error: "No active Auth session." };

    const foundUser = users.find(
      (u) => u.id === sessionUser.id || (u.email && u.email.toLowerCase() === sessionUser.email?.toLowerCase())
    );

    if (!foundUser) {
      return { user: null, error: "Akun belum terdaftar di ROTARI." };
    }

    if (!foundUser.tenant_id) {
      return { user: null, error: "User belum terikat dengan Tenant valid." };
    }

    const foundTenant = tenants.find((t) => t.id === foundUser.tenant_id);
    if (!foundTenant) {
      return { user: null, error: "Tenant tidak ditemukan." };
    }

    return { user: foundUser };
  };

  // 1. Restore Active Session on Mount & Listen to Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const { user, error } = resolveTenantUserFromSession(session.user);
        if (user) {
          setCurrentUser(user);
          setActiveTenantId(user.tenant_id);
          setIsAuthenticated(true);
        } else {
          console.warn("Access Denied on Session Restore:", error);
          setIsAuthenticated(false);
        }
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const { user, error } = resolveTenantUserFromSession(session.user);
        if (user) {
          setCurrentUser(user);
          setActiveTenantId(user.tenant_id);
          setIsAuthenticated(true);
        } else {
          console.warn("Access Denied on Auth State Change:", error);
          setIsAuthenticated(false);
        }
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(initialUsers[0]);
        setActiveTenantId("tenant-001");
        setIsAuthenticated(false);
      }
    });

    if (typeof window !== "undefined") {
      const savedUserId = sessionStorage.getItem("rotari_auth_user_id");
      if (savedUserId && savedUserId === SUPER_ADMIN_USER.id) {
        setCurrentUser(SUPER_ADMIN_USER);
        setIsAuthenticated(true);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, tenants]);

  // Anti-Spoofing Effect: Ensure activeTenantId is strictly derived from currentUser.tenant_id
  useEffect(() => {
    if (isAuthenticated && currentUser && (currentUser.role as string) !== "superadmin") {
      if (activeTenantId !== currentUser.tenant_id) {
        console.warn("Tenant spoofing detected. Reconciling activeTenantId to derived user tenant:", currentUser.tenant_id);
        setActiveTenantId(currentUser.tenant_id);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("rotari_active_tenant_id", currentUser.tenant_id);
        }
      }
    }
  }, [isAuthenticated, currentUser, activeTenantId]);

  // Sync registries to SessionStorage
  useEffect(() => { setStorageItem("rotari_tenants_registry", tenants); }, [tenants]);
  useEffect(() => { setStorageItem("rotari_users_registry", users); }, [users]);
  useEffect(() => { setStorageItem("rotari_products_registry", allProductsServices); }, [allProductsServices]);
  useEffect(() => { setStorageItem("rotari_expenses_registry", allExpenses); }, [allExpenses]);
  useEffect(() => { setStorageItem("rotari_customers_registry", allCustomers); }, [allCustomers]);
  useEffect(() => { setStorageItem("rotari_transactions_registry", allTransactions); }, [allTransactions]);
  useEffect(() => { setStorageItem("rotari_crm_logs_registry", allCrmLogs); }, [allCrmLogs]);
  useEffect(() => { setStorageItem("rotari_promo_instructions_registry", allPromoInstructions); }, [allPromoInstructions]);
  useEffect(() => { setStorageItem("rotari_prospect_leads_registry", prospectLeads); }, [prospectLeads]);

  // Derived Active Tenant
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0] || initialTenant;

  // Scoped Collections by Active Tenant
  const scopedUsers = users.filter((u) => u.tenant_id === activeTenant.id);
  const productsServices = allProductsServices.filter((p) => p.tenant_id === activeTenant.id);
  const expenses = allExpenses.filter((e) => e.tenant_id === activeTenant.id);
  const customers = allCustomers.filter((c) => c.tenant_id === activeTenant.id);
  const transactions = allTransactions.filter((t) => t.tenant_id === activeTenant.id);
  const crmLogs = allCrmLogs.filter((l) => l.tenant_id === activeTenant.id);
  const promoInstructions = allPromoInstructions.filter((p) => p.tenant_id === activeTenant.id);

  // 14-Day Trial Calculations for Active Tenant
  const trialEndsDate = new Date(activeTenant.trial_ends_at || Date.now() + 14 * 86400000);
  const diffTime = trialEndsDate.getTime() - Date.now();
  const daysRemainingInTrial = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isTrialExpired = activeTenant.subscription_status === "expired" || (activeTenant.subscription_status === "trial" && daysRemainingInTrial <= 0);

  const extendTrial = (daysToAdd: number) => {
    const newExpiry = new Date(trialEndsDate.getTime() + daysToAdd * 86400000).toISOString();
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenant.id ? { ...t, trial_ends_at: newExpiry, subscription_status: "trial" } : t))
    );
  };

  const activateSubscription = () => {
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenant.id ? { ...t, subscription_status: "active" } : t))
    );
  };

  // Bulk Import for Owner
  const importProductsServices = (
    items: Array<Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">>
  ): number => {
    const newItems: ProductService[] = items.map((item, idx) => ({
      ...item,
      id: `ps-imp-${Date.now()}-${idx}`,
      tenant_id: activeTenant.id,
      is_dead_stock: false,
      last_sold_at: new Date().toISOString(),
    }));
    setAllProductsServices((prev) => [...newItems, ...prev]);
    return newItems.length;
  };

  const importCustomers = (
    custs: Array<Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">>
  ): number => {
    const newCusts: Customer[] = custs.map((c, idx) => ({
      ...c,
      id: `cust-imp-${Date.now()}-${idx}`,
      tenant_id: activeTenant.id,
      last_order_at: new Date().toISOString(),
      churn_status: "active",
    }));
    setAllCustomers((prev) => [...newCusts, ...prev]);
    return newCusts.length;
  };

  // Prospect Leads Handler
  const addProspectLead = (leadData: Omit<ProspectLead, "id" | "created_at" | "status">) => {
    const newLead: ProspectLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "new",
    };
    setProspectLeads((prev) => [newLead, ...prev]);
    persistProspectLeadToSupabase(newLead);
  };

  const updateLeadStatus = (id: string, status: 'new' | 'contacted' | 'converted') => {
    setProspectLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, status };
          persistProspectLeadToSupabase(updated);
          return updated;
        }
        return l;
      })
    );
  };

  const deleteProspectLead = (id: string) => {
    setProspectLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const addPromoInstruction = (
    instr: Omit<PromoInstruction, "id" | "tenant_id" | "created_at" | "status">
  ) => {
    const newInstr: PromoInstruction = {
      ...instr,
      id: `promo-${Date.now()}`,
      tenant_id: activeTenant.id,
      created_at: new Date().toISOString(),
      status: "active",
    };
    setAllPromoInstructions((prev) => [newInstr, ...prev]);
    persistPromoInstructionToSupabase(newInstr);
  };

  const completePromoInstruction = (id: string) => {
    setAllPromoInstructions((prev) =>
      prev.map((pi) => {
        if (pi.id === id) {
          const updated = { ...pi, status: "completed" as const };
          persistPromoInstructionToSupabase(updated);
          return updated;
        }
        return pi;
      })
    );
  };

  // Financial Calculations
  const totalRevenue = transactions
    .filter((tx) => tx.status !== "cancelled")
    .reduce((sum, tx) => sum + tx.total_amount, 0);

  const totalHPP = transactions
    .filter((tx) => tx.status !== "cancelled")
    .reduce(
      (sum, tx) => sum + tx.items.reduce((itemSum, i) => itemSum + i.cost_price * i.quantity, 0),
      0
    );

  const totalOperationalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalHPP - totalOperationalExpenses;

  const totalCashReceived = transactions
    .filter((tx) => tx.status !== "cancelled" && tx.payment_method === "cash")
    .reduce((sum, tx) => sum + tx.paid_amount, 0);

  const totalTransferReceived = transactions
    .filter((tx) => tx.status !== "cancelled" && (tx.payment_method === "transfer" || tx.payment_method === "qris"))
    .reduce((sum, tx) => sum + tx.paid_amount, 0);

  // CRM Analytics
  const totalWaSent = crmLogs.length;
  const crmConvertedLogs = crmLogs.filter((l) => l.is_converted);
  const crmConvertedCount = crmConvertedLogs.length;
  const crmConvertedAmount = crmConvertedLogs.reduce((sum, l) => sum + (l.converted_amount || 0), 0);

  const updateTenant = (updated: Partial<Tenant>) => {
    const merged = { ...activeTenant, ...updated };
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenant.id ? merged : t))
    );
    persistTenantToSupabase(merged);
  };

  const setCurrentUserRole = (role: Role) => {
    const targetUser = scopedUsers.find((u) => u.role === role) || scopedUsers[0] || users[0];
    setCurrentUser(targetUser);
  };

  const loginWithCredentials = (identifier: string, pin: string): { success: boolean; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    // 1. Super Admin Isolated Check
    const matchesSuperAdmin = 
      (cleanPin === SUPER_ADMIN_USER.pin_code) &&
      (!cleanId || cleanId === "superadmin" || cleanId === "superadmin@rotari.id" || cleanId === "super_admin");

    if (matchesSuperAdmin) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rotari_sa_auth", "true");
        sessionStorage.setItem("rotari_auth_user_id", SUPER_ADMIN_USER.id);
      }
      setCurrentUser(SUPER_ADMIN_USER);
      setIsAuthenticated(true);
      return { success: true, user: SUPER_ADMIN_USER };
    }

    // 2. Standard Tenant User Check
    const matchedUser = users.find((u) => {
      const matchesPin = u.pin_code === cleanPin;
      if (!cleanId) return matchesPin;
      const matchesId = 
        (u.email && u.email.toLowerCase().includes(cleanId)) || 
        (u.name && u.name.toLowerCase().includes(cleanId)) || 
        u.id.toLowerCase() === cleanId ||
        u.role.toLowerCase() === cleanId;
      return matchesId && matchesPin;
    });

    if (matchedUser) {
      if (matchedUser.email) {
        supabase.auth.signInWithPassword({
          email: matchedUser.email,
          password: cleanPin,
        }).catch((err) => {
          console.warn("Supabase Auth signIn attempt:", err?.message || err);
        });
      }
      setCurrentUser(matchedUser);
      setActiveTenantId(matchedUser.tenant_id);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rotari_auth_user_id", matchedUser.id);
        sessionStorage.setItem("rotari_active_tenant_id", matchedUser.tenant_id);
      }
      return { success: true, user: matchedUser };
    }

    return { success: false };
  };

  const setCurrentUserWithPin = (userId: string, pin: string): boolean => {
    return loginWithCredentials(userId, pin).success;
  };

  // Task 4: Tenant Baru Registration (Isolated from Demo Tenant)
  const registerDemoTenant = ({ name, email, phone, businessName, pinCode }: { name: string; email: string; phone: string; businessName: string; pinCode?: string }): User => {
    const newTenantId = `tenant-${Date.now()}`;
    const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();
    
    const newTenant: Tenant = {
      id: newTenantId,
      business_name: businessName,
      logo_url: "/logo.png",
      address: "Outlet Utama",
      phone_number: phone,
      terms_and_conditions: initialTenant.terms_and_conditions,
      thermal_paper_size: "68mm",
      theme_preference: "light",
      created_at: new Date().toISOString(),
      trial_ends_at: trialExpiryIso,
      subscription_status: "trial",
      reminder_rules: initialTenant.reminder_rules,
    };

    const newOwnerUser: User = {
      id: `user-owner-${Date.now()}`,
      tenant_id: newTenantId,
      name,
      email,
      role: "owner",
      pin_code: pinCode && pinCode.trim() ? pinCode.trim() : "123456",
      is_active: true,
    };

    // Add to multi-tenant registries without touching existing Demo Tenant (tenant-001)
    setTenants((prev) => [newTenant, ...prev]);
    setUsers((prev) => [newOwnerUser, ...prev]);
    setActiveTenantId(newTenantId);
    setCurrentUser(newOwnerUser);
    setIsAuthenticated(true);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("rotari_auth_user_id", newOwnerUser.id);
      sessionStorage.setItem("rotari_active_tenant_id", newTenantId);
    }

    persistTenantToSupabase(newTenant);
    persistUserToSupabase(newOwnerUser);

    addProspectLead({
      name,
      email,
      phone,
      business_name: businessName,
    });

    return newOwnerUser;
  };

  const logout = () => {
    supabase.auth.signOut().catch((err) => {
      console.warn("Supabase Auth signOut error:", err?.message || err);
    });
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rotari_auth_user_id");
      sessionStorage.removeItem("rotari_active_tenant_id");
      sessionStorage.removeItem("rotari_sa_auth");
    }
  };

  const updateUserPin = (userId: string, newPin: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, pin_code: newPin };
          persistUserToSupabase(updated);
          return updated;
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      const updatedCurr = { ...currentUser, pin_code: newPin };
      setCurrentUser(updatedCurr);
      persistUserToSupabase(updatedCurr);
    }
  };

  const toggleAttendance = (userId: string) => {
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const locationStr = activeTenant.address || "Outlet Utama";

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          let updated: User;
          if (!u.clock_in) {
            updated = {
              ...u,
              clock_in: timeStr,
              clock_in_date: dateStr,
              clock_in_location: locationStr,
              clock_out: undefined,
            };
          } else if (!u.clock_out) {
            updated = { ...u, clock_out: timeStr };
          } else {
            updated = {
              ...u,
              clock_in: timeStr,
              clock_in_date: dateStr,
              clock_in_location: locationStr,
              clock_out: undefined,
            };
          }
          persistUserToSupabase(updated);
          return updated;
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => {
        let updated: User;
        if (!prev.clock_in) {
          updated = {
            ...prev,
            clock_in: timeStr,
            clock_in_date: dateStr,
            clock_in_location: locationStr,
            clock_out: undefined,
          };
        } else if (!prev.clock_out) {
          updated = { ...prev, clock_out: timeStr };
        } else {
          updated = {
            ...prev,
            clock_in: timeStr,
            clock_in_date: dateStr,
            clock_in_location: locationStr,
            clock_out: undefined,
          };
        }
        persistUserToSupabase(updated);
        return updated;
      });
    }
  };

  const addUser = (userData: Omit<User, "id" | "tenant_id" | "is_active">) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      tenant_id: activeTenant.id,
      is_active: true,
    };
    setUsers((prev) => [newUser, ...prev]);
    persistUserToSupabase(newUser);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addProductService = (
    item: Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">
  ) => {
    const newItem: ProductService = {
      ...item,
      id: `ps-${Date.now()}`,
      tenant_id: activeTenant.id,
      is_dead_stock: false,
      last_sold_at: new Date().toISOString(),
    };
    setAllProductsServices((prev) => [newItem, ...prev]);
    persistProductServiceToSupabase(newItem);
  };

  const deleteProductService = (id: string) => {
    setAllProductsServices((prev) => prev.filter((p) => p.id !== id));
    deleteProductServiceFromSupabase(id);
  };

  const addExpense = (expense: Omit<OperationalExpense, "id" | "tenant_id">) => {
    const newExpense: OperationalExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      tenant_id: activeTenant.id,
    };
    setAllExpenses((prev) => [newExpense, ...prev]);
    persistExpenseToSupabase(newExpense);
  };

  const deleteExpense = (id: string) => {
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteExpenseFromSupabase(id);
  };

  const addCustomer = (
    cust: Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">
  ): Customer => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      tenant_id: activeTenant.id,
      last_order_at: new Date().toISOString(),
      churn_status: "active",
    };
    setAllCustomers((prev) => [newCust, ...prev]);
    persistCustomerToSupabase(newCust);
    return newCust;
  };

  const addTransaction = (
    tx: Omit<Transaction, "id" | "tenant_id" | "invoice_number" | "created_at">
  ): Transaction => {
    const invoiceNum = `INV/${new Date().getFullYear()}/${String(
      transactions.length + 1
    ).padStart(3, "0")}`;

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      tenant_id: activeTenant.id,
      invoice_number: invoiceNum,
      created_at: new Date().toISOString(),
    };

    setAllTransactions((prev) => [newTx, ...prev]);
    persistTransactionToSupabase(newTx);

    // Update customer stats
    setAllCustomers((prev) =>
      prev.map((c) => {
        if (c.id === tx.customer_id) {
          const updatedCust = {
            ...c,
            total_orders: (c.total_orders || 0) + 1,
            total_spent: (c.total_spent || 0) + tx.paid_amount,
            last_order_at: new Date().toISOString(),
            churn_status: "active" as const,
          };
          persistCustomerToSupabase(updatedCust);
          return updatedCust;
        }
        return c;
      })
    );

    // Update stock for product items
    tx.items.forEach((item) => {
      if (item.type === "product") {
        setAllProductsServices((prev) =>
          prev.map((ps) => {
            if (ps.id === item.item_id) {
              const newStock = Math.max(0, ps.stock - item.quantity);
              const updatedPs = {
                ...ps,
                stock: newStock,
                last_sold_at: new Date().toISOString(),
              };
              persistProductServiceToSupabase(updatedPs);
              return updatedPs;
            }
            return ps;
          })
        );
      }
    });

    return newTx;
  };

  const updateWorkStatus = (transactionId: string, status: WorkStatus) => {
    setAllTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated = { ...t, work_status: status };
          persistTransactionToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const settleTransaction = (transactionId: string) => {
    setAllTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated = {
            ...t,
            status: "paid" as const,
            paid_amount: t.total_amount,
          };
          persistTransactionToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const addCrmLog = (
    log: Omit<CrmLog, "id" | "tenant_id" | "sent_at" | "is_converted">
  ) => {
    const newLog: CrmLog = {
      ...log,
      id: `crm-${Date.now()}`,
      tenant_id: activeTenant.id,
      sent_at: new Date().toISOString(),
      is_converted: false,
    };
    setAllCrmLogs((prev) => [newLog, ...prev]);
    persistCrmLogToSupabase(newLog);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant: activeTenant,
        currentUser,
        isAuthenticated,
        logout,
        users: scopedUsers,
        productsServices,
        expenses,
        customers,
        transactions,
        crmLogs,
        promoInstructions,
        prospectLeads,
        daysRemainingInTrial,
        isTrialExpired,
        extendTrial,
        activateSubscription,
        importProductsServices,
        importCustomers,
        addProspectLead,
        updateLeadStatus,
        deleteProspectLead,
        updateTenant,
        setCurrentUserRole,
        setCurrentUserWithPin,
        loginWithCredentials,
        registerDemoTenant,
        updateUserPin,
        toggleAttendance,
        addUser,
        deleteUser,
        addProductService,
        deleteProductService,
        addExpense,
        deleteExpense,
        addTransaction,
        updateWorkStatus,
        settleTransaction,
        addCrmLog,
        addCustomer,
        addPromoInstruction,
        completePromoInstruction,
        totalRevenue,
        totalHPP,
        totalOperationalExpenses,
        netProfit,
        totalCashReceived,
        totalTransferReceived,
        totalWaSent,
        crmConvertedCount,
        crmConvertedAmount,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

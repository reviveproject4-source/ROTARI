"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, WorkStatus, PromoInstruction, ProspectLead } from "@/types";
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
} from "./initial-data";
import { supabase } from "./supabase";
import {
  persistTenantToSupabase,
  persistUserToSupabase,
  persistCustomerToSupabase,
  deleteCustomerFromSupabase,
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
  importCustomers: (custs: Array<Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status"> & { last_order_at?: string; churn_status?: 'active' | 'at_risk_45' | 'lost_90' }>) => number;
  
  // Prospect Lead Methods
  addProspectLead: (lead: Omit<ProspectLead, "id" | "created_at" | "status">) => void;
  updateLeadStatus: (id: string, status: 'new' | 'contacted' | 'converted') => void;
  deleteProspectLead: (id: string) => void;

  updateTenant: (updated: Partial<Tenant>) => void;
  loginWithCredentials: (identifier: string, pin: string) => { success: boolean; user?: User };
  updateUserPin: (userId: string, newPin: string) => void;
  toggleAttendance: (userId: string) => void;
  addUser: (user: Omit<User, "id" | "tenant_id" | "is_active">) => void;
  deleteUser: (id: string) => void;
  addProductService: (item: Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">) => void;
  deleteProductService: (id: string) => void;
  addExpense: (expense: Omit<OperationalExpense, "id" | "tenant_id">) => void;
  deleteExpense: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "tenant_id" | "invoice_number" | "created_at"> & { created_at?: string }) => Transaction;
  updateWorkStatus: (transactionId: string, status: WorkStatus) => void;
  settleTransaction: (transactionId: string) => void;
  addCrmLog: (log: Omit<CrmLog, "id" | "tenant_id" | "sent_at" | "is_converted">) => void;
  addCustomer: (cust: Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  approveSpecialDiscount: (transactionId: string) => void;
  rejectSpecialDiscount: (transactionId: string) => void;
  addPromoInstruction: (instr: Omit<PromoInstruction, "id" | "tenant_id" | "created_at" | "status">) => void;
  completePromoInstruction: (id: string) => void;
  
  // Financial metrics
  totalRevenue: number;
  totalHPP: number;
  totalOperationalExpenses: number;
  totalCashExpenses: number;
  totalTransferExpenses: number;
  netProfit: number;
  totalCashReceived: number;
  totalTransferReceived: number;
  netCash: number;
  netTransfer: number;
  totalDiscounts: number;
  cashTransactionsCount: number;
  transferTransactionsCount: number;
  
  // CRM Metrics
  totalWaSent: number;
  crmConvertedCount: number;
  crmConvertedAmount: number;
}

export function getCustomerChurnStatus(
  lastOrderAt: string,
  rules?: { dormant_days: number; lost_days: number }
): 'active' | 'at_risk_45' | 'lost_90' {
  const dormantDays = rules?.dormant_days ?? 30;
  const lostDays = rules?.lost_days ?? 60;
  const diffDays = Math.floor((Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= lostDays) return 'lost_90';
  if (diffDays >= dormantDays) return 'at_risk_45';
  return 'active';
}

export function formatReminderMessage(
  template: string,
  customerName: string,
  businessName: string,
  extraPromo?: string
): string {
  return template
    .replace(/\{nama\}/gi, customerName)
    .replace(/\{toko\}/gi, businessName)
    .replace(/\{promo\}/gi, extraPromo || "");
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
  const [tenants, setTenants] = useState<Tenant[]>(() => getStorageItemWithMerge("rotari_tenants_registry_v2", [initialTenant]));
  // Tenant selection is not restored from browser storage. Until a trusted
  // server-side membership resolver exists, use only the local demo tenant.
  const [activeTenantId, setActiveTenantId] = useState<string>(initialTenant.id);

  const [users, setUsers] = useState<User[]>(() => getStorageItemWithMerge("rotari_users_registry_v2", initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => initialUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Repositories
  const [allProductsServices, setAllProductsServices] = useState<ProductService[]>(() => getStorageItemWithMerge("rotari_products_registry_v2", initialProductsServices));
  const [allExpenses, setAllExpenses] = useState<OperationalExpense[]>(() => getStorageItemWithMerge("rotari_expenses_registry_v2", initialExpenses));
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => getStorageItemWithMerge("rotari_customers_registry_v2", initialCustomers));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => getStorageItemWithMerge("rotari_transactions_registry_v2", initialTransactions));
  const [allCrmLogs, setAllCrmLogs] = useState<CrmLog[]>(() => getStorageItemWithMerge("rotari_crm_logs_registry_v2", initialCrmLogs));
  const [allPromoInstructions, setAllPromoInstructions] = useState<PromoInstruction[]>(() => getStorageItemWithMerge("rotari_promo_instructions_registry_v2", initialPromoInstructions));
  const [prospectLeads, setProspectLeads] = useState<ProspectLead[]>(() => getStorageItemWithMerge("rotari_prospect_leads_registry_v2", initialProspectLeads));

  // Authentication is intentionally fail-closed. The previous resolver
  // trusted browser-held user and tenant registries, which are user-editable.
  // Do not establish an application identity until a trusted server-side
  // Auth UID -> profile -> tenant membership resolver exists.
  useEffect(() => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rotari_auth_user_id");
      sessionStorage.removeItem("rotari_active_tenant_id");
      sessionStorage.removeItem("rotari_sa_auth");
    }
  }, []);

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
  useEffect(() => { setStorageItem("rotari_tenants_registry_v2", tenants); }, [tenants]);
  useEffect(() => { setStorageItem("rotari_users_registry_v2", users.map(({ pin_code: _pinCode, ...user }) => user)); }, [users]);
  useEffect(() => { setStorageItem("rotari_products_registry_v2", allProductsServices); }, [allProductsServices]);
  useEffect(() => { setStorageItem("rotari_expenses_registry_v2", allExpenses); }, [allExpenses]);
  useEffect(() => { setStorageItem("rotari_customers_registry_v2", allCustomers); }, [allCustomers]);
  useEffect(() => { setStorageItem("rotari_transactions_registry_v2", allTransactions); }, [allTransactions]);
  useEffect(() => { setStorageItem("rotari_crm_logs_registry_v2", allCrmLogs); }, [allCrmLogs]);
  useEffect(() => { setStorageItem("rotari_promo_instructions_registry_v2", allPromoInstructions); }, [allPromoInstructions]);
  useEffect(() => { setStorageItem("rotari_prospect_leads_registry_v2", prospectLeads); }, [prospectLeads]);

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
    custs: Array<Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status"> & { last_order_at?: string; churn_status?: 'active' | 'at_risk_45' | 'lost_90' }>
  ): number => {
    setAllCustomers((prev) => {
      const updatedList = [...prev];
      custs.forEach((c, idx) => {
        const cleanPhone = c.phone.trim().replace(/[^0-9]/g, "");
        const existingIdx = updatedList.findIndex(
          (existing) => existing.tenant_id === activeTenant.id && (
            existing.phone.replace(/[^0-9]/g, "") === cleanPhone
          )
        );

        if (existingIdx >= 0) {
          const existing = updatedList[existingIdx];
          const updated: Customer = {
            ...existing,
            name: c.name || existing.name,
            email: c.email || existing.email,
            address: c.address || existing.address,
            notes: c.notes || existing.notes,
            total_orders: (existing.total_orders || 0) + (c.total_orders || 0),
            total_spent: (existing.total_spent || 0) + (c.total_spent || 0),
            last_order_at: c.last_order_at || existing.last_order_at || new Date().toISOString(),
            churn_status: c.churn_status || existing.churn_status || "active",
          };
          updatedList[existingIdx] = updated;
          persistCustomerToSupabase(updated);
        } else {
          const newCust: Customer = {
            ...c,
            id: `cust-imp-${Date.now()}-${idx}`,
            tenant_id: activeTenant.id,
            last_order_at: c.last_order_at || new Date().toISOString(),
            churn_status: c.churn_status || "active",
          };
          updatedList.unshift(newCust);
          persistCustomerToSupabase(newCust);
        }
      });
      return updatedList;
    });
    return custs.length;
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
  const totalCashExpenses = expenses
    .filter((e) => (e.payment_method || "cash") === "cash")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalTransferExpenses = expenses
    .filter((e) => e.payment_method === "transfer")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const netProfit = totalRevenue - totalHPP - totalOperationalExpenses;

  const validTransactions = transactions.filter((tx) => tx.status !== "cancelled");
  const cashTransactions = validTransactions.filter((tx) => tx.payment_method === "cash");
  const transferTransactions = validTransactions.filter(
    (tx) => tx.payment_method === "transfer" || tx.payment_method === "qris"
  );

  const totalCashReceived = cashTransactions.reduce((sum, tx) => sum + tx.paid_amount, 0);
  const totalTransferReceived = transferTransactions.reduce((sum, tx) => sum + tx.paid_amount, 0);

  const netCash = totalCashReceived - totalCashExpenses;
  const netTransfer = totalTransferReceived - totalTransferExpenses;

  const totalDiscounts = validTransactions.reduce((sum, tx) => sum + (tx.discount_amount || 0), 0);
  const cashTransactionsCount = cashTransactions.length;
  const transferTransactionsCount = transferTransactions.length;

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

  // Client-only PIN authentication and demo aliases were removed.
  // A future login must verify credentials with Supabase Auth and resolve
  // authorization from a trusted server-side profile/membership record.
  const loginWithCredentials = (_identifier: string, _pin: string): { success: boolean; user?: User } => {
    setIsAuthenticated(false);
    return { success: false };
  };

  const logout = () => {
    void supabase.auth.signOut().catch((err) => {
      console.warn("Supabase Auth signOut error:", err?.message || err);
    });
    setIsAuthenticated(false);
    setCurrentUser(initialUsers[0]);
    setActiveTenantId(initialTenant.id);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rotari_auth_user_id");
      sessionStorage.removeItem("rotari_active_tenant_id");
      sessionStorage.removeItem("rotari_sa_auth");
    }
  };

  // PINs are no longer an application credential and are not stored locally
  // or synchronized. Password management belongs to the Auth provider.
  const updateUserPin = (_userId: string, _newPin: string) => {
    console.warn("Local PIN changes are disabled; use the verified account recovery flow.");
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
    setAllProductsServices((prev) => prev.filter((p) => !(p.id === id && p.tenant_id === activeTenant.id)));
    void deleteProductServiceFromSupabase(id, activeTenant.id);
  };

  const addExpense = (expense: Omit<OperationalExpense, "id" | "tenant_id">) => {
    const newExpense: OperationalExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      tenant_id: activeTenant.id,
      payment_method: expense.payment_method || "transfer",
    };
    setAllExpenses((prev) => [newExpense, ...prev]);
    persistExpenseToSupabase(newExpense);
  };

  const deleteExpense = (id: string) => {
    setAllExpenses((prev) => prev.filter((e) => !(e.id === id && e.tenant_id === activeTenant.id)));
    void deleteExpenseFromSupabase(id, activeTenant.id);
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

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    setAllCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updatedData };
          persistCustomerToSupabase(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const deleteCustomer = (id: string) => {
    setAllCustomers((prev) => prev.filter((c) => !(c.id === id && c.tenant_id === activeTenant.id)));
    void deleteCustomerFromSupabase(id, activeTenant.id);
  };

  const addTransaction = (
    tx: Omit<Transaction, "id" | "tenant_id" | "invoice_number" | "created_at"> & { created_at?: string }
  ): Transaction => {
    const invoiceNum = `INV/${new Date().getFullYear()}/${String(
      transactions.length + 1
    ).padStart(3, "0")}`;

    const remaining = Math.max(0, tx.total_amount - tx.paid_amount);

    const newTx: Transaction = {
      branch_name: tx.branch_name || activeTenant.address || "Outlet Utama",
      ...tx,
      id: `tx-${Date.now()}`,
      tenant_id: activeTenant.id,
      invoice_number: invoiceNum,
      remaining_amount: tx.remaining_amount !== undefined ? tx.remaining_amount : remaining,
      dp_amount: tx.dp_amount !== undefined ? tx.dp_amount : (tx.payment_stage === 'dp' ? tx.paid_amount : 0),
      discount_special_status: tx.discount_special_requested ? (tx.discount_special_status || 'pending') : 'none',
      created_at: tx.created_at || new Date().toISOString(),
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
            remaining_amount: 0,
          };
          persistTransactionToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const approveSpecialDiscount = (transactionId: string) => {
    setAllTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated: Transaction = {
            ...t,
            discount_special_status: "approved",
          };
          persistTransactionToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const rejectSpecialDiscount = (transactionId: string) => {
    setAllTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated: Transaction = {
            ...t,
            discount_special_status: "rejected",
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
        loginWithCredentials,
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
        updateCustomer,
        deleteCustomer,
        approveSpecialDiscount,
        rejectSpecialDiscount,
        addPromoInstruction,
        completePromoInstruction,
        totalRevenue,
        totalHPP,
        totalOperationalExpenses,
        totalCashExpenses,
        totalTransferExpenses,
        netProfit,
        totalCashReceived,
        totalTransferReceived,
        netCash,
        netTransfer,
        totalDiscounts,
        cashTransactionsCount,
        transferTransactionsCount,
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, Role, WorkStatus, PromoInstruction, ProspectLead } from "@/types";
import { initialTenant, initialUsers, initialProductsServices, initialExpenses, initialCustomers, initialTransactions, initialCrmLogs, initialPromoInstructions, initialProspectLeads } from "./initial-data";

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

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [productsServices, setProductsServices] = useState<ProductService[]>(initialProductsServices);
  const [expenses, setExpenses] = useState<OperationalExpense[]>(initialExpenses);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [crmLogs, setCrmLogs] = useState<CrmLog[]>(initialCrmLogs);
  const [promoInstructions, setPromoInstructions] = useState<PromoInstruction[]>(initialPromoInstructions);
  const [prospectLeads, setProspectLeads] = useState<ProspectLead[]>(initialProspectLeads);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUserId = sessionStorage.getItem("rotari_auth_user_id");
      if (savedUserId) {
        const u = initialUsers.find((x) => x.id === savedUserId);
        if (u) {
          setCurrentUser(u);
          setIsAuthenticated(true);
        }
      }
    }
  }, []);

  // 14-Day Trial Calculations
  const trialEndsDate = new Date(tenant.trial_ends_at || Date.now() + 14 * 86400000);
  const diffTime = trialEndsDate.getTime() - Date.now();
  const daysRemainingInTrial = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isTrialExpired = tenant.subscription_status === "expired" || (tenant.subscription_status === "trial" && daysRemainingInTrial <= 0);

  const extendTrial = (daysToAdd: number) => {
    const newExpiry = new Date(trialEndsDate.getTime() + daysToAdd * 86400000).toISOString();
    setTenant((prev) => ({
      ...prev,
      trial_ends_at: newExpiry,
      subscription_status: "trial",
    }));
  };

  const activateSubscription = () => {
    setTenant((prev) => ({
      ...prev,
      subscription_status: "active",
    }));
  };

  // Bulk Import for Owner
  const importProductsServices = (
    items: Array<Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">>
  ): number => {
    const newItems: ProductService[] = items.map((item, idx) => ({
      ...item,
      id: `ps-imp-${Date.now()}-${idx}`,
      tenant_id: tenant.id,
      is_dead_stock: false,
      last_sold_at: new Date().toISOString(),
    }));
    setProductsServices((prev) => [...newItems, ...prev]);
    return newItems.length;
  };

  const importCustomers = (
    custs: Array<Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">>
  ): number => {
    const newCusts: Customer[] = custs.map((c, idx) => ({
      ...c,
      id: `cust-imp-${Date.now()}-${idx}`,
      tenant_id: tenant.id,
      last_order_at: new Date().toISOString(),
      churn_status: "active",
    }));
    setCustomers((prev) => [...newCusts, ...prev]);
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
  };

  const updateLeadStatus = (id: string, status: 'new' | 'contacted' | 'converted') => {
    setProspectLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
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
      tenant_id: tenant.id,
      created_at: new Date().toISOString(),
      status: "active",
    };
    setPromoInstructions((prev) => [newInstr, ...prev]);
  };

  const completePromoInstruction = (id: string) => {
    setPromoInstructions((prev) =>
      prev.map((pi) => (pi.id === id ? { ...pi, status: "completed" } : pi))
    );
  };


  // Financial calculations
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

  // Cash vs Transfer breakdown
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
    setTenant((prev) => ({ ...prev, ...updated }));
  };

  const setCurrentUserRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  const loginWithCredentials = (identifier: string, pin: string): { success: boolean; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

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
      setCurrentUser(matchedUser);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rotari_auth_user_id", matchedUser.id);
      }
      return { success: true, user: matchedUser };
    }

    return { success: false };
  };

  const setCurrentUserWithPin = (userId: string, pin: string): boolean => {
    return loginWithCredentials(userId, pin).success;
  };

  const registerDemoTenant = ({ name, email, phone, businessName, pinCode }: { name: string; email: string; phone: string; businessName: string; pinCode?: string }): User => {
    const trialExpiryIso = new Date(Date.now() + 14 * 86400000).toISOString();
    
    setTenant((prev) => ({
      ...prev,
      business_name: businessName,
      phone_number: phone,
      trial_ends_at: trialExpiryIso,
      subscription_status: "trial",
    }));

    const newOwnerUser: User = {
      id: `user-owner-${Date.now()}`,
      tenant_id: tenant.id,
      name,
      email,
      role: "owner",
      pin_code: pinCode && pinCode.trim() ? pinCode.trim() : "123456",
      is_active: true,
    };

    setUsers((prev) => [newOwnerUser, ...prev.filter((u) => u.role !== "owner")]);
    setCurrentUser(newOwnerUser);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rotari_auth_user_id", newOwnerUser.id);
    }

    addProspectLead({
      name,
      email,
      phone,
      business_name: businessName,
    });

    return newOwnerUser;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rotari_auth_user_id");
    }
  };

  const updateUserPin = (userId: string, newPin: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, pin_code: newPin } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, pin_code: newPin }));
    }
  };

  const toggleAttendance = (userId: string) => {
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const locationStr = tenant.address || "Outlet Utama";

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (!u.clock_in) {
            return {
              ...u,
              clock_in: timeStr,
              clock_in_date: dateStr,
              clock_in_location: locationStr,
              clock_out: undefined,
            };
          }
          if (!u.clock_out) {
            return { ...u, clock_out: timeStr };
          }
          // Reset shift
          return {
            ...u,
            clock_in: timeStr,
            clock_in_date: dateStr,
            clock_in_location: locationStr,
            clock_out: undefined,
          };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev.clock_in) {
          return {
            ...prev,
            clock_in: timeStr,
            clock_in_date: dateStr,
            clock_in_location: locationStr,
            clock_out: undefined,
          };
        }
        if (!prev.clock_out) {
          return { ...prev, clock_out: timeStr };
        }
        return {
          ...prev,
          clock_in: timeStr,
          clock_in_date: dateStr,
          clock_in_location: locationStr,
          clock_out: undefined,
        };
      });
    }
  };

  const addUser = (user: Omit<User, "id" | "tenant_id" | "is_active">) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      tenant_id: tenant.id,
      is_active: true,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addProductService = (item: Omit<ProductService, "id" | "tenant_id" | "is_dead_stock">) => {
    const newItem: ProductService = {
      ...item,
      id: `ps-${Date.now()}`,
      tenant_id: tenant.id,
      is_dead_stock: false,
      last_sold_at: new Date().toISOString(),
    };
    setProductsServices((prev) => [newItem, ...prev]);
  };

  const deleteProductService = (id: string) => {
    setProductsServices((prev) => prev.filter((ps) => ps.id !== id));
  };

  const addExpense = (exp: Omit<OperationalExpense, "id" | "tenant_id">) => {
    const newExp: OperationalExpense = {
      ...exp,
      id: `exp-${Date.now()}`,
      tenant_id: tenant.id,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addCustomer = (cust: Omit<Customer, "id" | "tenant_id" | "last_order_at" | "churn_status">): Customer => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      tenant_id: tenant.id,
      last_order_at: new Date().toISOString(),
      churn_status: "active",
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const addCrmLog = (logData: Omit<CrmLog, "id" | "tenant_id" | "sent_at" | "is_converted">) => {
    const newLog: CrmLog = {
      ...logData,
      id: `crm-${Date.now()}`,
      tenant_id: tenant.id,
      sent_at: new Date().toISOString(),
      is_converted: false,
    };
    setCrmLogs((prev) => [newLog, ...prev]);
  };

  const addTransaction = (
    txData: Omit<Transaction, "id" | "tenant_id" | "invoice_number" | "created_at">
  ): Transaction => {
    const invNumber = `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}/${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    let attributedLogId: string | undefined = undefined;
    if (txData.customer_id) {
      const recentLog = crmLogs.find(
        (l) => l.customer_id === txData.customer_id && !l.is_converted
      );
      if (recentLog) {
        attributedLogId = recentLog.id;
        setCrmLogs((prev) =>
          prev.map((l) =>
            l.id === recentLog.id
              ? {
                  ...l,
                  is_converted: true,
                  converted_amount: txData.total_amount,
                  converted_at: new Date().toISOString(),
                }
              : l
          )
        );
      }
    }

    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      tenant_id: tenant.id,
      invoice_number: invNumber,
      crm_attributed_log_id: attributedLogId,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.customer_id) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newTx.customer_id
            ? { ...c, last_order_at: newTx.created_at, churn_status: "active" }
            : c
        )
      );
    }

    newTx.items.forEach((item) => {
      setProductsServices((prev) =>
        prev.map((ps) => {
          if (ps.id === item.item_id) {
            const updatedStock = ps.type === "product" ? Math.max(0, ps.stock - item.quantity) : ps.stock;
            return {
              ...ps,
              stock: updatedStock,
              last_sold_at: newTx.created_at,
              is_dead_stock: false,
            };
          }
          return ps;
        })
      );
    });

    return newTx;
  };

  const updateWorkStatus = (transactionId: string, status: WorkStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, work_status: status } : tx))
    );
  };

  const settleTransaction = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? { ...tx, paid_amount: tx.total_amount, status: "paid", work_status: "completed" }
          : tx
      )
    );
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        currentUser,
        isAuthenticated,
        logout,
        users,
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
        deleteProspectLead: deleteProspectLead,
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

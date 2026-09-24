import { supabase } from "./supabase";
import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

/**
 * Persistence layer for Supabase Project oluzsthlxjxxpukxkcry.
 * Returns explicit status object { success, error } for audit verification.
 */

export interface SyncResult {
  success: boolean;
  error?: any;
}

export async function persistTenantToSupabase(tenant: Tenant): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("tenants").upsert({
      id: tenant.id,
      business_name: tenant.business_name,
      logo_url: tenant.logo_url,
      address: tenant.address,
      phone_number: tenant.phone_number,
      terms_and_conditions: tenant.terms_and_conditions,
      thermal_paper_size: tenant.thermal_paper_size,
      theme_preference: tenant.theme_preference,
      created_at: tenant.created_at,
      trial_ends_at: tenant.trial_ends_at,
      subscription_status: tenant.subscription_status,
      reminder_rules: tenant.reminder_rules,
    });
    if (error) {
      console.error("Supabase Tenant Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Tenant Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistUserToSupabase(user: User): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("users").upsert({
      id: user.id,
      tenant_id: user.tenant_id,
      name: user.name,
      email: user.email,
      role: user.role,
      pin_code: user.pin_code,
      is_active: user.is_active,
      clock_in: user.clock_in,
      clock_out: user.clock_out,
      clock_in_date: user.clock_in_date,
      clock_in_location: user.clock_in_location,
    });
    if (error) {
      console.error("Supabase User Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase User Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistCustomerToSupabase(customer: Customer): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("customers").upsert({
      id: customer.id,
      tenant_id: customer.tenant_id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notes: customer.notes,
      total_orders: customer.total_orders || 0,
      total_spent: customer.total_spent || 0,
      last_order_at: customer.last_order_at,
      churn_status: customer.churn_status,
    });
    if (error) {
      console.error("Supabase Customer Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Customer Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistProductServiceToSupabase(item: ProductService): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("products_services").upsert({
      id: item.id,
      tenant_id: item.tenant_id,
      name: item.name,
      type: item.type,
      cost_price: item.cost_price,
      selling_price: item.sell_price,
      stock: item.stock || 0,
      is_dead_stock: item.is_dead_stock || false,
    });
    if (error) {
      console.error("Supabase Product/Service Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Product/Service Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function deleteProductServiceFromSupabase(id: string): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("products_services").delete().eq("id", id);
    if (error) {
      console.error("Supabase Product/Service Delete Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Product/Service Delete Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistExpenseToSupabase(expense: OperationalExpense): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("operational_expenses").upsert({
      id: expense.id,
      tenant_id: expense.tenant_id,
      category: expense.category,
      amount: expense.amount,
      description: expense.title + (expense.notes ? ` - ${expense.notes}` : ""),
      date: expense.expense_date,
    });
    if (error) {
      console.error("Supabase Expense Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Expense Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function deleteExpenseFromSupabase(id: string): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("operational_expenses").delete().eq("id", id);
    if (error) {
      console.error("Supabase Expense Delete Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Expense Delete Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistTransactionToSupabase(tx: Transaction): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("transactions").upsert({
      id: tx.id,
      tenant_id: tx.tenant_id,
      invoice_number: tx.invoice_number,
      customer_id: tx.customer_id || null,
      customer_name: tx.customer_name || null,
      customer_phone: tx.customer_phone || null,
      items: tx.items,
      subtotal: tx.subtotal,
      discount: tx.discount_amount || 0,
      total_amount: tx.total_amount,
      payment_method: tx.payment_method,
      payment_status: tx.status,
      order_status: tx.work_status,
      cashier_id: tx.cashier_id,
      cashier_name: tx.cashier_name,
      created_at: tx.created_at,
    });

    if (error) {
      console.error("Supabase Transaction Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Transaction Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistCrmLogToSupabase(log: CrmLog): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("crm_logs").upsert({
      id: log.id,
      tenant_id: log.tenant_id,
      customer_id: log.customer_id,
      customer_name: log.customer_name,
      phone: log.customer_phone,
      type: log.type,
      message: log.message_content,
      status: log.is_converted ? 'converted' : 'sent',
      created_at: log.sent_at,
    });
    if (error) {
      console.error("Supabase CRM Log Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase CRM Log Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistPromoInstructionToSupabase(promo: PromoInstruction): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("promo_instructions").upsert({
      id: promo.id,
      tenant_id: promo.tenant_id,
      title: promo.product_name,
      content: promo.promo_message,
      is_active: promo.status === "active",
      created_at: promo.created_at,
    });
    if (error) {
      console.error("Supabase Promo Instruction Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Promo Instruction Sync Exception:", err);
    return { success: false, error: err };
  }
}

export async function persistProspectLeadToSupabase(lead: ProspectLead): Promise<SyncResult> {
  try {
    const { error } = await supabase.from("prospect_leads").upsert({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      business_name: lead.business_name,
      status: lead.status,
      created_at: lead.created_at,
    });
    if (error) {
      console.error("Supabase Prospect Lead Sync Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error("Supabase Prospect Lead Sync Exception:", err);
    return { success: false, error: err };
  }
}

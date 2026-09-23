import { supabase } from "./supabase";
import { Tenant, User, ProductService, OperationalExpense, Customer, Transaction, CrmLog, PromoInstruction, ProspectLead } from "@/types";

/**
 * Helper persistence layer for Supabase Project uzrqolqdqsispedbmtrl.
 * Performs background asynchronous persistence without blocking UI flow.
 */

export async function persistTenantToSupabase(tenant: Tenant): Promise<void> {
  try {
    await supabase.from("tenants").upsert({
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
  } catch (err) {
    console.error("Supabase Tenant Sync Error:", err);
  }
}

export async function persistUserToSupabase(user: User): Promise<void> {
  try {
    await supabase.from("users").upsert({
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
  } catch (err) {
    console.error("Supabase User Sync Error:", err);
  }
}

export async function persistCustomerToSupabase(customer: Customer): Promise<void> {
  try {
    await supabase.from("customers").upsert({
      id: customer.id,
      tenant_id: customer.tenant_id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notes: customer.notes,
      total_orders: customer.total_orders,
      total_spent: customer.total_spent,
      last_order_at: customer.last_order_at,
      churn_status: customer.churn_status,
    });
  } catch (err) {
    console.error("Supabase Customer Sync Error:", err);
  }
}

export async function persistProductServiceToSupabase(item: ProductService): Promise<void> {
  try {
    await supabase.from("products_services").upsert({
      id: item.id,
      tenant_id: item.tenant_id,
      name: item.name,
      type: item.type,
      cost_price: item.cost_price,
      sell_price: item.sell_price,
      duration_minutes: item.duration_minutes,
      raw_material_cost: item.raw_material_cost,
      stock: item.stock,
      is_dead_stock: item.is_dead_stock,
      last_sold_at: item.last_sold_at,
    });
  } catch (err) {
    console.error("Supabase Product/Service Sync Error:", err);
  }
}

export async function deleteProductServiceFromSupabase(id: string): Promise<void> {
  try {
    await supabase.from("products_services").delete().eq("id", id);
  } catch (err) {
    console.error("Supabase Product/Service Delete Error:", err);
  }
}

export async function persistExpenseToSupabase(expense: OperationalExpense): Promise<void> {
  try {
    await supabase.from("operational_expenses").upsert({
      id: expense.id,
      tenant_id: expense.tenant_id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
      notes: expense.notes,
    });
  } catch (err) {
    console.error("Supabase Expense Sync Error:", err);
  }
}

export async function deleteExpenseFromSupabase(id: string): Promise<void> {
  try {
    await supabase.from("operational_expenses").delete().eq("id", id);
  } catch (err) {
    console.error("Supabase Expense Delete Error:", err);
  }
}

export async function persistTransactionToSupabase(tx: Transaction): Promise<void> {
  try {
    await supabase.from("transactions").upsert({
      id: tx.id,
      tenant_id: tx.tenant_id,
      invoice_number: tx.invoice_number,
      customer_id: tx.customer_id,
      customer_name: tx.customer_name,
      customer_phone: tx.customer_phone,
      cashier_id: tx.cashier_id,
      cashier_name: tx.cashier_name,
      photo_url: tx.photo_url,
      work_status: tx.work_status,
      item_notes: tx.item_notes,
      subtotal: tx.subtotal,
      discount_type: tx.discount_type,
      discount_value: tx.discount_value,
      discount_amount: tx.discount_amount,
      total_amount: tx.total_amount,
      paid_amount: tx.paid_amount,
      status: tx.status,
      payment_method: tx.payment_method,
      payment_stage: tx.payment_stage,
      crm_attributed_log_id: tx.crm_attributed_log_id,
      created_at: tx.created_at,
    });

    if (tx.items && tx.items.length > 0) {
      const itemsPayload = tx.items.map((item) => ({
        id: item.id,
        tenant_id: tx.tenant_id,
        transaction_id: tx.id,
        item_id: item.item_id,
        name: item.name,
        type: item.type,
        cost_price: item.cost_price,
        unit_price: item.unit_price,
        quantity: item.quantity,
        gross_margin: item.gross_margin,
      }));
      await supabase.from("transaction_items").upsert(itemsPayload);
    }
  } catch (err) {
    console.error("Supabase Transaction Sync Error:", err);
  }
}

export async function persistCrmLogToSupabase(log: CrmLog): Promise<void> {
  try {
    await supabase.from("crm_logs").upsert({
      id: log.id,
      tenant_id: log.tenant_id,
      customer_id: log.customer_id,
      customer_name: log.customer_name,
      customer_phone: log.customer_phone,
      cashier_name: log.cashier_name,
      type: log.type,
      message_content: log.message_content,
      sent_at: log.sent_at,
      is_converted: log.is_converted,
      converted_transaction_id: log.converted_transaction_id,
      converted_amount: log.converted_amount,
      converted_at: log.converted_at,
    });
  } catch (err) {
    console.error("Supabase CRM Log Sync Error:", err);
  }
}

export async function persistPromoInstructionToSupabase(promo: PromoInstruction): Promise<void> {
  try {
    await supabase.from("promo_instructions").upsert({
      id: promo.id,
      tenant_id: promo.tenant_id,
      product_id: promo.product_id,
      product_name: promo.product_name,
      stock: promo.stock,
      promo_message: promo.promo_message,
      status: promo.status,
      created_at: promo.created_at,
    });
  } catch (err) {
    console.error("Supabase Promo Instruction Sync Error:", err);
  }
}

export async function persistProspectLeadToSupabase(lead: ProspectLead): Promise<void> {
  try {
    await supabase.from("prospect_leads").upsert({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      business_name: lead.business_name,
      status: lead.status,
      created_at: lead.created_at,
    });
  } catch (err) {
    console.error("Supabase Prospect Lead Sync Error:", err);
  }
}

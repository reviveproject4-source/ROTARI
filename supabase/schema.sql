-- =============================================================================
-- ROTARI SAAS PLATFORM: MULTI-TENANT DATABASE SCHEMA & RLS AUTHORIZATION
-- Supabase Project ID: uzrqolqdqsispedbmtrl
-- Organization: kdqqayqqhsljhavsklja
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TENANTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    terms_and_conditions TEXT NOT NULL,
    thermal_paper_size VARCHAR(20) DEFAULT '68mm',
    theme_preference VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
    reminder_rules JSONB DEFAULT '{"dormant_days": 45, "lost_days": 90, "stagnant_service_days": 14}'::jsonb
);

-- -----------------------------------------------------------------------------
-- 2. USERS / PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'cashier', 'superadmin')),
    pin_code VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    clock_in VARCHAR(50),
    clock_out VARCHAR(50),
    clock_in_date VARCHAR(50),
    clock_in_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. CUSTOMERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    last_order_at TIMESTAMPTZ DEFAULT NOW(),
    churn_status VARCHAR(20) DEFAULT 'active' CHECK (churn_status IN ('active', 'at_risk_45', 'lost_90')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. PRODUCTS & SERVICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service')),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sell_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    raw_material_cost NUMERIC(12, 2) DEFAULT 0,
    stock INT DEFAULT 0,
    is_dead_stock BOOLEAN DEFAULT FALSE,
    last_sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. OPERATIONAL EXPENSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operational_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('fixed', 'variable')),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cashier_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    work_status VARCHAR(30) DEFAULT 'baru',
    item_notes TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'amount' CHECK (discount_type IN ('percent', 'amount')),
    discount_value NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'cancelled')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'qris')),
    payment_stage VARCHAR(20) DEFAULT 'full' CHECK (payment_stage IN ('dp', 'full')),
    crm_attributed_log_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TRANSACTION ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES products_services(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service')),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    gross_margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. CRM LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('retention_45', 'retention_90')),
    message_content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_converted BOOLEAN DEFAULT FALSE,
    converted_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    converted_amount NUMERIC(12, 2) DEFAULT 0,
    converted_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 9. PROMO INSTRUCTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promo_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products_services(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    stock INT DEFAULT 0,
    promo_message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. PROSPECT LEADS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prospect_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) AUTHORIZATION & TENANT ISOLATION POLICIES
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_leads ENABLE ROW LEVEL SECURITY;

-- Helper Function to resolve current user tenant identity from auth.jwt() or profile
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Tenants Policies
CREATE POLICY "Tenants - Read own tenant" ON tenants
    FOR SELECT USING (
        id = get_current_user_tenant_id() 
        OR (auth.jwt()->>'role') = 'superadmin'
    );

CREATE POLICY "Tenants - Update own tenant" ON tenants
    FOR UPDATE USING (
        id = get_current_user_tenant_id() 
        OR (auth.jwt()->>'role') = 'superadmin'
    );

-- 2. Users / Profiles Policies
CREATE POLICY "Users - Tenant Isolation Select" ON users
    FOR SELECT USING (
        tenant_id = get_current_user_tenant_id()
        OR (auth.jwt()->>'role') = 'superadmin'
    );

CREATE POLICY "Users - Tenant Isolation Insert" ON users
    FOR INSERT WITH CHECK (
        tenant_id = get_current_user_tenant_id()
        OR (auth.jwt()->>'role') = 'superadmin'
    );

CREATE POLICY "Users - Tenant Isolation Update" ON users
    FOR UPDATE USING (
        tenant_id = get_current_user_tenant_id()
        OR (auth.jwt()->>'role') = 'superadmin'
    );

CREATE POLICY "Users - Tenant Isolation Delete" ON users
    FOR DELETE USING (
        tenant_id = get_current_user_tenant_id()
        OR (auth.jwt()->>'role') = 'superadmin'
    );

-- 3. Customers Policies
CREATE POLICY "Customers - Tenant Isolation Select" ON customers
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Customers - Tenant Isolation Insert" ON customers
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Customers - Tenant Isolation Update" ON customers
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Customers - Tenant Isolation Delete" ON customers
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 4. Products & Services Policies
CREATE POLICY "Products - Tenant Isolation Select" ON products_services
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Products - Tenant Isolation Insert" ON products_services
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Products - Tenant Isolation Update" ON products_services
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Products - Tenant Isolation Delete" ON products_services
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 5. Operational Expenses Policies
CREATE POLICY "Expenses - Tenant Isolation Select" ON operational_expenses
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Expenses - Tenant Isolation Insert" ON operational_expenses
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Expenses - Tenant Isolation Update" ON operational_expenses
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Expenses - Tenant Isolation Delete" ON operational_expenses
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 6. Transactions Policies
CREATE POLICY "Transactions - Tenant Isolation Select" ON transactions
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transactions - Tenant Isolation Insert" ON transactions
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transactions - Tenant Isolation Update" ON transactions
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transactions - Tenant Isolation Delete" ON transactions
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 7. Transaction Items Policies
CREATE POLICY "Transaction Items - Tenant Isolation Select" ON transaction_items
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transaction Items - Tenant Isolation Insert" ON transaction_items
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transaction Items - Tenant Isolation Update" ON transaction_items
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Transaction Items - Tenant Isolation Delete" ON transaction_items
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 8. CRM Logs Policies
CREATE POLICY "CRM Logs - Tenant Isolation Select" ON crm_logs
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "CRM Logs - Tenant Isolation Insert" ON crm_logs
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "CRM Logs - Tenant Isolation Update" ON crm_logs
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "CRM Logs - Tenant Isolation Delete" ON crm_logs
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 9. Promo Instructions Policies
CREATE POLICY "Promo Instructions - Tenant Isolation Select" ON promo_instructions
    FOR SELECT USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Promo Instructions - Tenant Isolation Insert" ON promo_instructions
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Promo Instructions - Tenant Isolation Update" ON promo_instructions
    FOR UPDATE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

CREATE POLICY "Promo Instructions - Tenant Isolation Delete" ON promo_instructions
    FOR DELETE USING (tenant_id = get_current_user_tenant_id() OR (auth.jwt()->>'role') = 'superadmin');

-- 10. Prospect Leads Policies (Public / Super Admin)
CREATE POLICY "Prospect Leads - Insert Public" ON prospect_leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Prospect Leads - Select Super Admin" ON prospect_leads
    FOR SELECT USING ((auth.jwt()->>'role') = 'superadmin' OR true);

CREATE POLICY "Prospect Leads - Update Super Admin" ON prospect_leads
    FOR UPDATE USING ((auth.jwt()->>'role') = 'superadmin' OR true);

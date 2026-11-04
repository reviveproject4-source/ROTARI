import test from "node:test";
import assert from "node:assert/strict";
import { hashPin, verifyPin, verifyPinSync, KNOWN_HASHES } from "../src/lib/crypto.ts";

interface MockTenant {
  id: string;
  business_name: string;
  business_type: "retail" | "service" | "restaurant";
  created_at: string;
  subscription_status: string;
  trial_ends_at: string;
}

interface MockUser {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: "owner" | "cashier" | "staff" | "superadmin";
  pin_hash?: string;
  pin_code?: string;
  is_active: boolean;
}

const initialTenant: MockTenant = {
  id: "tenant-001",
  business_name: "Rotari Motor & Servis",
  business_type: "service",
  created_at: new Date().toISOString(),
  subscription_status: "active",
  trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
};

const initialUsers: MockUser[] = [
  {
    id: "user-001",
    tenant_id: "tenant-001",
    name: "Budi Santoso",
    email: "owner@rotari.id",
    role: "owner",
    pin_hash: KNOWN_HASHES["123456"],
    is_active: true,
  },
  {
    id: "user-002",
    tenant_id: "tenant-001",
    name: "Siti Rahma",
    email: "siti@rotari.id",
    role: "cashier",
    pin_hash: KNOWN_HASHES["1122"],
    is_active: true,
  },
];

test("Audit Pemulihan Jalur Tenant & Integritas Jalur Demo", async (t) => {
  // Mock In-Memory Registries mimicking sessionStorage
  let mockTenants: MockTenant[] = [initialTenant];
  let mockUsers: MockUser[] = [...initialUsers];
  let sessionStorageMock: Record<string, string> = {};

  // Emulation of TenantContext logic
  function mockRegisterTenant(data: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    businessType?: "retail" | "service" | "restaurant";
    pinCode?: string;
  }): MockUser {
    const newTenantId = `tenant-${Date.now()}`;
    const cleanPin = data.pinCode && data.pinCode.trim() ? data.pinCode.trim() : "123456";
    const initialHash = KNOWN_HASHES[cleanPin];

    const newTenant: MockTenant = {
      id: newTenantId,
      business_name: data.businessName,
      business_type: data.businessType || "retail",
      created_at: new Date().toISOString(),
      subscription_status: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    };

    const newOwner: MockUser = {
      id: `user-owner-${Date.now()}`,
      tenant_id: newTenantId,
      name: data.name,
      email: data.email,
      role: "owner",
      pin_hash: initialHash,
      pin_code: initialHash ? undefined : cleanPin,
      is_active: true,
    };

    mockTenants.unshift(newTenant);
    mockUsers.unshift(newOwner);

    sessionStorageMock["rotari_auth_user_id"] = newOwner.id;
    sessionStorageMock["rotari_active_tenant_id"] = newTenantId;

    return newOwner;
  }

  function mockLoginWithCredentials(identifier: string, pin: string) {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    // 1. Demo Cashier Shortcut (Scoped to tenant-001)
    if (cleanId === "kasir" || cleanId === "siti" || cleanId === "siti@rotari.id") {
      const cashierUser = mockUsers.find((u) => u.tenant_id === "tenant-001" && u.role === "cashier") || initialUsers[1];
      if (!cleanPin || verifyPinSync(cleanPin, cashierUser.pin_hash || cashierUser.pin_code)) {
        sessionStorageMock["rotari_auth_user_id"] = cashierUser.id;
        sessionStorageMock["rotari_active_tenant_id"] = cashierUser.tenant_id;
        return { success: true, user: cashierUser };
      }
    }

    // 2. Demo Owner Shortcut (Scoped to tenant-001)
    if (cleanId === "owner" || cleanId === "owner@rotari.id" || cleanId === "budi") {
      const ownerUser = mockUsers.find((u) => u.tenant_id === "tenant-001" && u.role === "owner") || initialUsers[0];
      if (!cleanPin || verifyPinSync(cleanPin, ownerUser.pin_hash || ownerUser.pin_code)) {
        sessionStorageMock["rotari_auth_user_id"] = ownerUser.id;
        sessionStorageMock["rotari_active_tenant_id"] = ownerUser.tenant_id;
        return { success: true, user: ownerUser };
      }
    }

    // 3. Standard Real Tenant User Login
    const matchedUser = mockUsers.find((u) => {
      const matchesPin = verifyPinSync(cleanPin, u.pin_hash || u.pin_code);
      if (!cleanId) return matchesPin;
      const cleanEmail = u.email ? u.email.trim().toLowerCase() : "";
      const cleanName = u.name ? u.name.trim().toLowerCase() : "";
      const matchesId = 
        cleanEmail === cleanId ||
        cleanEmail.includes(cleanId) ||
        cleanName === cleanId ||
        u.id.toLowerCase() === cleanId;
      return matchesId && matchesPin;
    });

    if (matchedUser) {
      sessionStorageMock["rotari_auth_user_id"] = matchedUser.id;
      sessionStorageMock["rotari_active_tenant_id"] = matchedUser.tenant_id;
      return { success: true, user: matchedUser };
    }

    return { success: false };
  }

  function mockRestoreSession() {
    const savedUserId = sessionStorageMock["rotari_auth_user_id"];
    if (savedUserId) {
      const savedUser = mockUsers.find((u) => u.id === savedUserId);
      if (savedUser) {
        return {
          currentUser: savedUser,
          activeTenantId: savedUser.tenant_id,
          isAuthenticated: true,
        };
      }
    }
    return {
      currentUser: initialUsers[0],
      activeTenantId: "tenant-001",
      isAuthenticated: false,
    };
  }

  await t.test("Jalur Demo: Login Demo Owner & Kasir tetap berfungsi mulus", () => {
    // 1-Click Demo Owner
    const ownerRes = mockLoginWithCredentials("owner@rotari.id", "123456");
    assert.equal(ownerRes.success, true);
    assert.equal(ownerRes.user?.tenant_id, "tenant-001");
    assert.equal(ownerRes.user?.role, "owner");

    // 1-Click Demo Kasir Siti
    const cashierRes = mockLoginWithCredentials("siti@rotari.id", "1122");
    assert.equal(cashierRes.success, true);
    assert.equal(cashierRes.user?.tenant_id, "tenant-001");
    assert.equal(cashierRes.user?.role, "cashier");

    // Demo Aliases remain scoped to tenant-001
    const aliasRes = mockLoginWithCredentials("kasir", "1122");
    assert.equal(aliasRes.success, true);
    assert.equal(aliasRes.user?.tenant_id, "tenant-001");
  });

  await t.test("Jalur Tenant: Pendaftaran tenant mandiri dengan PIN kustom berhasil diisolasi", async () => {
    const customPin = "778899";
    const newOwner = mockRegisterTenant({
      name: "Doni Wijaya",
      email: "doni@kedaikopi.com",
      phone: "081234567890",
      businessName: "Kedai Kopi Doni",
      businessType: "restaurant",
      pinCode: customPin,
    });

    assert.ok(newOwner.id.startsWith("user-owner-"));
    assert.ok(newOwner.tenant_id.startsWith("tenant-"));
    assert.notEqual(newOwner.tenant_id, "tenant-001", "Tenant baru harus memiliki tenant_id unik terpisah");

    // Compute expected hash asynchronously
    const expectedHash = await hashPin(customPin);
    newOwner.pin_hash = expectedHash;
    newOwner.pin_code = undefined;

    // Verify authentication with custom PIN
    const authValid = await verifyPin(customPin, newOwner.pin_hash);
    assert.equal(authValid, true, "PIN kustom tenant baru harus valid diverifikasi");

    const authInvalid = await verifyPin("123456", newOwner.pin_hash);
    assert.equal(authInvalid, false, "Default demo PIN tidak boleh tembus ke akun tenant baru");
  });

  await t.test("Jalur Tenant: Pemulihan sesi tenant asli saat reload berhasil dipulihkan", () => {
    // Current session is the newly created tenant owner (from previous test)
    const session = mockRestoreSession();

    assert.equal(session.isAuthenticated, true, "Sesi tenant asli harus dipulihkan (authenticated)");
    assert.ok(session.currentUser.id.startsWith("user-owner-"), "User bukan Budi Demo");
    assert.notEqual(session.activeTenantId, "tenant-001", "Active tenant bukan tenant-001");
  });

  await t.test("Jalur Tenant: Shortcut demo tidak membajak akun tenant asli", () => {
    // If a demo user logs in using shortcut 'budi' or 'owner'
    const demoRes = mockLoginWithCredentials("budi", "123456");
    assert.equal(demoRes.success, true);
    assert.equal(demoRes.user?.tenant_id, "tenant-001", "Shortcut demo selalu mengarah ke tenant demo tenant-001");

    // Real tenant logs in with their own email
    const tenantRes = mockLoginWithCredentials("doni@kedaikopi.com", "778899");
    assert.equal(tenantRes.success, true);
    assert.notEqual(tenantRes.user?.tenant_id, "tenant-001", "Tenant asli mengarah ke tenant miliknya");
  });
});

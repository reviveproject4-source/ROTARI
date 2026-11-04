import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Database Schema & RLS Policy Hardening Test Suite (P0.3, P1.1, P1.2)", async (t) => {
  const rootDir = process.cwd();
  const schemaPath = path.join(rootDir, "supabase", "schema.sql");
  const migrationPath = path.join(rootDir, "supabase", "migrations", "20261104010000_security_hardening.sql");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const migrationContent = fs.readFileSync(migrationPath, "utf-8");

  await t.test("P0.3: prospect_leads policies must NOT contain 'OR true' vulnerability in USING clause", () => {
    // Matches actual SQL policy USING condition with OR true
    const policyUsingOrTrueRegex = /CREATE\s+POLICY[\s\S]*?ON\s+public\.prospect_leads[\s\S]*?USING\s*\([^)]*?\bOR\s+true\b[^)]*?\)/i;
    assert.doesNotMatch(
      schemaContent,
      policyUsingOrTrueRegex,
      "Unified schema must not contain 'OR true' in prospect_leads policy USING clause"
    );
    assert.doesNotMatch(
      migrationContent,
      policyUsingOrTrueRegex,
      "Hardening migration must not contain 'OR true' in prospect_leads policy USING clause"
    );
  });

  await t.test("P0.4: Storage transaction-photos bucket must be private (public = false)", () => {
    assert.match(
      schemaContent,
      /SET\s+public\s*=\s*false[\s\S]*?id\s*=\s*'transaction-photos'/i,
      "Bucket transaction-photos must be set to public = false in schema.sql"
    );
    assert.match(
      migrationContent,
      /SET\s+public\s*=\s*false[\s\S]*?id\s*=\s*'transaction-photos'/i,
      "Bucket transaction-photos must be set to public = false in hardening migration"
    );
  });

  await t.test("P0.4: Storage upload policy must NOT allow 'anon' uploads", () => {
    const uploadPolicyRegex = /CREATE\s+POLICY\s+"Allow Upload Transaction Photos"[\s\S]*?FOR\s+INSERT[\s\S]*?WITH\s+CHECK\s*\(([\s\S]*?)\);/i;
    
    const schemaMatch = schemaContent.match(uploadPolicyRegex);
    assert.ok(schemaMatch, "Upload policy must exist in schema.sql");
    assert.ok(!schemaMatch[1].includes("'anon'"), "Upload policy in schema.sql must not permit anon role");

    const migrationMatch = migrationContent.match(uploadPolicyRegex);
    assert.ok(migrationMatch, "Upload policy must exist in hardening migration");
    assert.ok(!migrationMatch[1].includes("'anon'"), "Upload policy in migration must not permit anon role");
  });

  await t.test("P1.1: get_auth_tenant_id() must be SECURITY DEFINER with fixed search_path = public, pg_temp", () => {
    assert.match(
      schemaContent,
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_auth_tenant_id\(\)[\s\S]*?SECURITY\s+DEFINER[\s\S]*?SET\s+search_path\s*=\s*public,\s*pg_temp/i,
      "get_auth_tenant_id in schema.sql must specify SET search_path = public, pg_temp"
    );
    assert.match(
      migrationContent,
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_auth_tenant_id\(\)[\s\S]*?SECURITY\s+DEFINER[\s\S]*?SET\s+search_path\s*=\s*public,\s*pg_temp/i,
      "get_auth_tenant_id in migration must specify SET search_path = public, pg_temp"
    );
  });

  await t.test("P1.1: get_auth_user_role() must be SECURITY DEFINER with fixed search_path = public, pg_temp", () => {
    assert.match(
      schemaContent,
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_auth_user_role\(\)[\s\S]*?SECURITY\s+DEFINER[\s\S]*?SET\s+search_path\s*=\s*public,\s*pg_temp/i,
      "get_auth_user_role in schema.sql must specify SET search_path = public, pg_temp"
    );
    assert.match(
      migrationContent,
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.get_auth_user_role\(\)[\s\S]*?SECURITY\s+DEFINER[\s\S]*?SET\s+search_path\s*=\s*public,\s*pg_temp/i,
      "get_auth_user_role in migration must specify SET search_path = public, pg_temp"
    );
  });

  await t.test("P1.2: Users table in schema and migration supports pin_hash", () => {
    assert.match(schemaContent, /pin_hash\s+TEXT/i);
    assert.match(migrationContent, /ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+pin_hash\s+TEXT/i);
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { hashPin, verifyPin, verifyPinSync, KNOWN_HASHES } from "../src/lib/crypto.ts";

test("Crypto PIN Security Test Suite", async (t) => {
  await t.test("hashPin generates valid 64-character salted SHA-256 hex string", async () => {
    const pin = "123456";
    const hash = await hashPin(pin);
    assert.equal(typeof hash, "string");
    assert.equal(hash.length, 64);
    assert.equal(hash, KNOWN_HASHES["123456"]);
  });

  await t.test("different PINs generate completely different cryptographic hashes", async () => {
    const hash1 = await hashPin("1122");
    const hash2 = await hashPin("3344");
    assert.notEqual(hash1, hash2);
  });

  await t.test("verifyPin correctly verifies matching PIN and hash", async () => {
    const pin = "789012";
    const hash = await hashPin(pin);

    const isMatch = await verifyPin(pin, hash);
    assert.equal(isMatch, true, "Valid PIN should match its hash");

    const isWrongMatch = await verifyPin("999999", hash);
    assert.equal(isWrongMatch, false, "Wrong PIN must be rejected");
  });

  await t.test("verifyPinSync validates known seed hashes synchronously", () => {
    assert.equal(verifyPinSync("123456", KNOWN_HASHES["123456"]), true);
    assert.equal(verifyPinSync("1122", KNOWN_HASHES["1122"]), true);
    assert.equal(verifyPinSync("3344", KNOWN_HASHES["3344"]), true);
    assert.equal(verifyPinSync("999999", KNOWN_HASHES["999999"]), true);
    assert.equal(verifyPinSync("000000", KNOWN_HASHES["999999"]), false);
  });

  await t.test("verifyPin supports legacy plaintext evaluation for auto-migration", async () => {
    const legacyPlaintext = "5566";
    const isValid = await verifyPin("5566", legacyPlaintext);
    assert.equal(isValid, true, "Legacy plaintext PIN should match for migration evaluation");

    const isInvalid = await verifyPin("9999", legacyPlaintext);
    assert.equal(isInvalid, false, "Invalid PIN should fail even with legacy store");
  });

  await t.test("empty or undefined inputs fail safely without throwing", async () => {
    assert.equal(await verifyPin("", "anyhash"), false);
    assert.equal(await verifyPin("123456", undefined), false);
    assert.equal(verifyPinSync("", undefined), false);
  });
});

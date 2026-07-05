// v2.13.21 — Admin gate. Credentials are validated by the `admin-unlock`
// edge function, which reads them from server-side env vars (ADMIN_PIN /
// ADMIN_TEXT). NO admin secret is ever embedded in the client bundle.
//
// Once verified, an unlock flag is kept in sessionStorage so the developer
// doesn't need to re-enter the secret on every reload. Optional WebAuthn
// biometric unlock (FaceID / TouchID) is layered on top for convenience.

import { supabase } from '@/integrations/supabase/client';

const KEY = 'atraa.admin.pin.ok.v1';
const BIOM_KEY = 'atraa.admin.biom.cred.v1'; // base64url credential id

export function isAdminHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'admin.atraa.xyz';
}

export function isAdminUnlocked(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export async function unlockAdmin(secret: string): Promise<boolean> {
  const trimmed = (secret ?? '').trim();
  if (!trimmed) return false;
  try {
    const { data, error } = await supabase.functions.invoke('admin-unlock', {
      body: { secret: trimmed },
    });
    if (error) return false;
    const ok = !!(data && (data as { ok?: boolean }).ok);
    if (!ok) return false;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    return true;
  } catch {
    return false;
  }
}

export function forceUnlock() {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
}

export function lockAdmin() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

// ============================================================
// Biometric (FaceID / TouchID) unlock — WebAuthn passkey
// ============================================================

function b64uEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uDecode(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export function isBiometricSupported(): boolean {
  return typeof window !== 'undefined'
    && !!(window as any).PublicKeyCredential
    && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch { return false; }
}

export function hasBiometricRegistered(): boolean {
  try { return !!localStorage.getItem(BIOM_KEY); } catch { return false; }
}

export function unregisterBiometric() {
  try { localStorage.removeItem(BIOM_KEY); } catch { /* ignore */ }
}

export async function registerBiometric(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'عترة — لوحة المطور' },
        user: { id: userId, name: 'admin@atraa.xyz', displayName: 'مطور عترة' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential | null;
    if (!cred) return false;
    localStorage.setItem(BIOM_KEY, b64uEncode(cred.rawId));
    return true;
  } catch (e) {
    console.warn('registerBiometric failed', e);
    return false;
  }
}

export async function unlockWithBiometric(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  const id = (() => { try { return localStorage.getItem(BIOM_KEY); } catch { return null; } })();
  if (!id) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credId = b64uDecode(id);
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge.buffer as ArrayBuffer,
        allowCredentials: [{ id: credId.buffer as ArrayBuffer, type: 'public-key', transports: ['internal'] }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    if (!assertion) return false;
    forceUnlock();
    return true;
  } catch (e) {
    console.warn('unlockWithBiometric failed', e);
    return false;
  }
}

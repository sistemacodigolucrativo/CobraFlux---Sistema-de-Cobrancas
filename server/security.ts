import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
export function randomSecret(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
export async function passwordHash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
export async function passwordMatches(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
export function csrfForSession(sessionToken: string, appSecret: string): string {
  return createHmac('sha256', appSecret).update('csrf:' + sessionToken).digest('hex');
}
export function secureEquals(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function getCookie(header: string | undefined, name: string): string | null {
  const found = (header ?? '').split(';').map((p) => p.trim()).find((p) => p.startsWith(name + '='));
  if (!found) return null;
  try { return decodeURIComponent(found.slice(name.length + 1)); } catch { return null; }
}

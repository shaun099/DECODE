import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET!;
const NAME = 'decode_sid';

const sign = (v: string) => createHmac('sha256', SECRET).update(v).digest('base64url');

export function pack(teamId: string) {
  return `${teamId}.${sign(teamId)}`;
}

export function unpack(raw?: string): string | null {
  if (!raw) return null;
  const [id, sig] = raw.split('.');
  if (!id || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(id));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export async function currentTeamId() {
  const c = await cookies();
  return unpack(c.get(NAME)?.value);
}

export async function setSession(teamId: string) {
  const c = await cookies();
  c.set(NAME, pack(teamId), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 6,
  });
}

export const COOKIE_NAME = NAME;
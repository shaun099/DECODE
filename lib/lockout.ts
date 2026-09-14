const KEY = 'decode-lock';

/** localStorage, not sessionStorage — so a new tab is locked too. */
export function setLock(ms: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, String(Date.now() + ms));
}

export function clearLock() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

/** Milliseconds remaining, or 0 if not locked. */
export function lockLeft(): number {
  if (typeof window === 'undefined') return 0;
  const until = Number(localStorage.getItem(KEY) ?? 0);
  const left = until - Date.now();
  if (left <= 0) {
    localStorage.removeItem(KEY);
    return 0;
  }
  return left;
}
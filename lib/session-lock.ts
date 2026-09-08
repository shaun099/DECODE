const KEY = 'decode-active';

/** Called when a game actually starts (not when the page loads). */
export function claim(gameId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, gameId);
}

/** Called on win, on fail, or when a lockout begins. */
export function release() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

/** Which game currently owns the terminal, or null. */
export function activeGame(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}
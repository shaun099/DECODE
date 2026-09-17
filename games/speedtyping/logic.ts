export const LEVEL_COUNT = 4;
export const TIME_LIMIT_MS = 15_000;

export const SENTENCES: string[] = [
  'The quick brown fox jumps over the lazy dog.',
  'const total = items.reduce((a, b) => a + b.value, 0);',
  'Failure is not fatal; it is the courage to continue that counts.',
  'while(true){ try{ await fetch(url); } catch(e){ retry(e); } }',
];

export function calcWpm(typedChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const words = typedChars / 5;
  return Math.round(words / minutes);
}

export function calcAccuracy(target: string, typed: string): number {
  if (!typed.length) return 100;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++;
  }
  return Math.round((correct / typed.length) * 100);
}

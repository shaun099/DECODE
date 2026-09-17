
export interface Tile { id: number; face: string }
 
export const PAIRS = 18
export const COLS  = 6
export const PEEK_MS = 1100
 
export const FACES = [
  '★', '♦', '♣', '♠', '♥', '☀',
  '☁', '⚡', '❄', '✿', '♬', '⚽',
  '✈', '⚓', '♛', '☎', '⚛', '☢',
  '♻', '⌛', '⚗', '☯', '☮', '♞',
]
 
export function newBoard(): Tile[] {
  const chosen = [...FACES].sort(() => Math.random() - 0.5).slice(0, PAIRS)
  const deck   = [...chosen, ...chosen]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck.map((face, id) => ({ id, face }))
}
 
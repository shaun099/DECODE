export interface Difference {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  radius: number;
  category: string;
}

export const SCENE_WIDTH = 1000;
export const SCENE_HEIGHT = 700;
export const TOTAL = 10;

/** Coordinates never leave the server until a difference is found. */
export const DIFFERENCES: Difference[] = [
  { id: 'diff_herb_twine', name: 'Dried Botanical Twine Bindings',
    description: 'The twine binding the hanging sage stems has 4 wraps in A, 3 in B.',
    x: 75, y: 472, radius: 34, category: 'Botanical' },
  { id: 'diff_constellation_binary', name: 'Celestial Binary Star Companion',
    description: 'The 4th constellation star has a companion star beside it.',
    x: 518, y: 115, radius: 36, category: 'Astronomy' },
  { id: 'diff_parchment_seal', name: "Scholar's Parchment Wax Signet",
    description: 'The wax signet has a single outer ring vs a double concentric ring.',
    x: 848, y: 588, radius: 32, category: 'Archives' },
  // ...paste the remaining seven from the original DIFFERENCES array
];

/** Which difference, if any, a click landed on. */
export function hitTest(x: number, y: number): Difference | null {
  for (const d of DIFFERENCES) {
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.radius * d.radius) return d;
  }
  return null;
}
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
  // Diff #1 – Hanging herbs twine wraps (4 in A vs 3 in B)
  { id: 'diff_herb_twine', name: 'Dried Botanical Twine Bindings',
    description: 'The twine binding the hanging sage stems has 4 wraps in A, 3 in B.',
    x: 75, y: 472, radius: 34, category: 'Botanical' },
  // Diff #2 – Binary companion star in constellation
  { id: 'diff_constellation_binary', name: 'Celestial Binary Star Companion',
    description: 'The 4th constellation star has a companion star beside it in B.',
    x: 518, y: 115, radius: 36, category: 'Astronomy' },
  // Diff #3 – Wax seal double concentric ring
  { id: 'diff_parchment_seal', name: "Scholar's Parchment Wax Signet",
    description: 'The wax signet has a single outer ring in A vs a double concentric ring in B.',
    x: 848, y: 588, radius: 32, category: 'Archives' },
  // Diff #4 – Clock counterweight shape (moon in A, lance-point in B)
  { id: 'diff_clock_counterweight', name: 'Astronomical Clock Counterweight',
    description: 'The minute-hand counterweight is a crescent moon in A, a lance point in B.',
    x: 145, y: 110, radius: 52, category: 'Timepiece' },
  // Diff #5 – Distillation collar ticks (6 in A vs 5 in B)
  { id: 'diff_collar_ticks', name: 'Distillation Collar Scale',
    description: 'The brass collar has 6 calibration ticks in A, 5 in B.',
    x: 806, y: 345, radius: 36, category: 'Alchemy' },
  // Diff #6 – Specimen crystal fracture vein (present only in B)
  { id: 'diff_crystal_vein', name: 'Specimen Crystal Fracture Vein',
    description: 'The crystal in the bell jar has an internal prismatic vein in B.',
    x: 660, y: 520, radius: 38, category: 'Mineralogy' },
  // Diff #7 – Armillary sphere missing tick notch (present in A, missing in B)
  { id: 'diff_armillary_tick', name: 'Armillary Horizon Tick Notch',
    description: 'One calibration tick on the horizon ring is missing in B.',
    x: 495, y: 360, radius: 48, category: 'Astronomy' },
  // Diff #8 – Alembic gold micro-flakes (3 in A vs 5 in B)
  { id: 'diff_alembic_flakes', name: 'Alembic Luminescent Flakes',
    description: 'The alembic flask has 3 gold flakes in A, 5 in B.',
    x: 335, y: 525, radius: 36, category: 'Alchemy' },
  // Diff #9 – Grimoire ribbon beads (3 in A vs 2 in B)
  { id: 'diff_grimoire_beads', name: 'Grimoire Silk Ribbon Beads',
    description: 'The grimoire ribbon has 3 knot beads in A, 2 in B.',
    x: 860, y: 148, radius: 34, category: 'Archives' },
  // Diff #10 – Chalkboard angle symbol (θ in A vs φ in B)
  { id: 'diff_angle_symbol', name: 'Chalkboard Angle Notation',
    description: 'The angle symbol on the chalkboard is θ in A, φ in B.',
    x: 193, y: 352, radius: 38, category: 'Mathematics' },
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
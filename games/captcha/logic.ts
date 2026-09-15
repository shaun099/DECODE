// Server only. Sentence pools, level config, and the SVG CAPTCHA renderer.

export interface Level { id: number; name: string; seconds: number }

export const LEVELS: Level[] = [
  { id: 0, name: 'EASY',       seconds: 45 },
  { id: 1, name: 'MEDIUM',     seconds: 45 },
  { id: 2, name: 'HARD',       seconds: 40 },
  { id: 3, name: 'EXTRA HARD', seconds: 30 },
  { id: 4, name: 'COMPLEX',    seconds: 25 },
];

export const GLOBAL_LIMIT_MS = 600_000;   // 10 minutes
export const RETRY_PENALTY_MS = 60_000;   // taken immediately on any failure

export const SENTENCES: string[][] = [
  [ 'the cat sat on the mat', 'hello world from earth', 'open the green door now',
    'five birds on the fence', 'blue sky and white clouds', 'run fast jump higher fly',
    'the quick red fox leapt', 'good morning sunny day', 'play the music out loud',
    'warm coffee and fresh bread' ],
  [ 'Order 42 ships by Friday', 'Room 7B on the 3rd floor', 'Call Agent 9 at noon today',
    'Mix 250ml with 3 spoons', 'Train leaves at platform 4', 'Score was 87 to 64 final',
    'Page 12 paragraph 3 line 8', 'Buy 6 apples and 2 lemons', 'Flight 901 departs Gate C5',
    'Send Report 14 by 5pm sharp' ],
  [ 'Upload config.dat to srv02', 'Error 503 on node alpha7', 'Patch build v3.8.1 is live',
    'Query SELECT from Table9x', 'Deploy branch rc4 to stage', 'Hash md5 output 9fa3bc01',
    'Module init port 8443 ok', 'Sync repo delta with main', 'Token exp 2026 renew fast',
    'Cache miss rate 12.4 pct' ],
  [ 'Access#Code: Zq8!mN', 'Key= xR4$pL7&wQ', 'Pass: nB3@kT9!yF', 'Auth [mX5] => {vJ2}',
    'Pin#7492 & Tok$83', 'Verify: aQ1!bR2@cS', 'Lock{D4} Open(E9)k', 'Sig: hN6$wP3#zM8',
    'Cert [xK2&jL5!mR]', 'API_key: f8G#n2Y!q' ],
  [ 'xA9$kL2@mP7&wQ4#bZ', 'Rz3!Tf8#Hn1$Wp6&Jv', 'q5Y@e2K!u8M#i4G$o7',
    'Bc6&Nx9!Ls3@Dt7#Fg', 'hW1$rJ4&mV8!pZ2@kY', 'Ue5#Qa9$Io3&Cg7!Xn',
    'tF2@Lk6#Rp1$Hs8&Wj', 'Ov4!Bn7@Yd3#Mz9$Ec', 'sG8&Jx5!Aq2@Ul6#Pi',
    'Nw3$Ft1&Hm7!Kb9@Zr' ],
];

export const HINTS = [
  'Type exactly what you see, including the spaces',
  'Type exactly — watch for numbers and capitals',
  'Type exactly — watch for numbers and dots',
  'Type exactly — symbols and case matter',
  'Type the exact string — every character counts',
];

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const challengeCount = (level: number) => (level <= 1 ? 2 : 3);

export function drawChallenges(level: number): string[] {
  const pool = [...SENTENCES[level]];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, challengeCount(level));
}

/** Per-glyph advance, so narrow and wide characters do not collide or gape. */
function widthOf(ch: string, cs: number): number {
  if (ch === ' ') return cs * 0.42;
  if (/[il1|!.,'`:;]/.test(ch)) return cs * 0.34;
  if (/[mwMW@#]/.test(ch)) return cs * 0.82;
  if (/[A-Z]/.test(ch)) return cs * 0.66;
  return cs * 0.56;
}

/**
 * Renders the distorted text as an SVG data URI. Pure string work — no canvas
 * library, so it runs on a serverless function without a native dependency.
 */
export function renderCaptcha(text: string, level: number): string {
  const W = 720, H = 200;
  const bg = ['#f0f4f8', '#e8edf3', '#dfe6ee', '#d0d9e4', '#c2cdd9'][level];
  const parts: string[] = [];

  parts.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);

  /* background dots */
  const dots = [40, 100, 200, 350, 500][level];
  for (let i = 0; i < dots; i++) {
    parts.push(
      `<circle cx="${ri(0, W)}" cy="${ri(0, H)}" r="${ri(1, 3 + level)}" ` +
      `fill="hsl(${ri(0, 360)} 40% 60%)" opacity="${(0.15 + level * 0.08).toFixed(2)}"/>`,
    );
  }

  /* straight lines */
  const lines = [2, 5, 10, 18, 28][level];
  for (let i = 0; i < lines; i++) {
    parts.push(
      `<line x1="${ri(0, W)}" y1="${ri(0, H)}" x2="${ri(0, W)}" y2="${ri(0, H)}" ` +
      `stroke="hsl(${ri(0, 360)} 50% 50%)" stroke-width="${ri(1, 2 + level)}" ` +
      `opacity="${(0.12 + level * 0.06).toFixed(2)}"/>`,
    );
  }

  /* bezier noise, harder levels only */
  const curves = [0, 0, 4, 8, 14][level];
  for (let i = 0; i < curves; i++) {
    parts.push(
      `<path d="M${ri(0, W)} ${ri(0, H)} C${ri(0, W)} ${ri(0, H)}, ${ri(0, W)} ${ri(0, H)}, ` +
      `${ri(0, W)} ${ri(0, H)}" fill="none" stroke="hsl(${ri(0, 360)} 60% 45%)" ` +
      `stroke-width="${ri(1, 3)}" opacity="${(0.15 + level * 0.05).toFixed(2)}"/>`,
    );
  }

  /* the characters */
  const size = level <= 1 ? 36 : level <= 2 ? 32 : level <= 3 ? 30 : 28;

  // measure first so the whole line can be centred properly
  const total = [...text].reduce((sum, ch) => sum + widthOf(ch, size), 0);
  let x = Math.max(16, (W - total) / 2);
  const baseY = H / 2 + size / 3;

  for (const ch of text) {
    const cs = size + (level >= 2 ? ri(-3, 3) : 0);
    const adv = widthOf(ch, cs);

    // a space draws nothing but still advances, and takes no kerning jitter
    if (ch === ' ') {
      x += adv;
      continue;
    }

    const rot = ((Math.random() - 0.5) * 2 * [0, 2, 5, 9, 15][level]).toFixed(1);
    const dy = (Math.sin(x * 0.05 + Math.random()) * [0, 2, 5, 10, 16][level]).toFixed(1);
    const hue = level <= 1 ? ri(200, 240) : ri(0, 360);
    const light = level <= 2 ? ri(15, 30) : ri(10, 40);
    const sat = level <= 1 ? ri(60, 80) : ri(40, 90);
    const y = baseY + Number(dy);

    parts.push(
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="Arial,Helvetica,sans-serif" ` +
      `font-size="${cs}" font-weight="bold" fill="hsl(${hue} ${sat}% ${light}%)" ` +
      `transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})">${esc(ch)}</text>`,
    );

    x += adv + (level >= 3 ? ri(-2, 2) : 0);
  }

  /* foreground speckle */
  const fg = [0, 0, 0, 60, 120][level];
  for (let i = 0; i < fg; i++) {
    parts.push(
      `<circle cx="${ri(0, W)}" cy="${ri(0, H)}" r="${ri(1, 2)}" ` +
      `fill="hsl(${ri(0, 360)} 30% 40%)" opacity="0.25"/>`,
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    parts.join('') + '</svg>';

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
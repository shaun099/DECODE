'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface Door { r: number; c: number; open: boolean; question: string; options: string[] }

const pad = (n: number) => String(n).padStart(2, '0');

export default function MazeGame({ hud, view, send }: GameProps) {
  const rows: number = view?.rows ?? 21;
  const cols: number = view?.cols ?? 31;
  const level: number = view?.level ?? 1;
  const grid: string = view?.grid ?? '';
  const doors: Door[] = view?.doors ?? [];
  const opened: number = view?.opened ?? 0;
  const totalDoors: number = view?.totalDoors ?? 5;
  const lives: number = view?.lives ?? 3;
  const runs: number = view?.runs ?? 0;
  const cleared: number = view?.cleared ?? 0;

  const [pos, setPos] = useState({ r: 1, c: 1 });
  const [active, setActive] = useState<number | null>(null);
  const [pick, setPick] = useState<number>(-1);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msLeft, setMsLeft] = useState<number>(view?.msLeft ?? 0);

  const sigRef = useRef('');
  const exitCell = { r: rows - 2, c: cols - 2 };

  /* a new maze arrived — reset the player */
  useEffect(() => {
    const sig = `${level}-${runs}-${grid.slice(0, 40)}`;
    if (sig === sigRef.current) return;
    sigRef.current = sig;
    setPos({ r: 1, c: 1 });
    setActive(null);
    setPick(-1);
    setBusy(false);
  }, [level, runs, grid]);

  useEffect(() => { setMsLeft(view?.msLeft ?? 0); }, [view?.msLeft]);
  useEffect(() => {
    const t = setInterval(() => setMsLeft((v: number) => Math.max(0, v - 250)), 250);
    return () => clearInterval(t);
  }, []);

  /* unlock and clear the panel when a door opens */
  useEffect(() => {
    if (active === null) return;
    if (doors[active]?.open) {
      setPos({ r: doors[active].r, c: doors[active].c });
      setActive(null);
      setPick(-1);
      setMsg({ text: 'Correct — door unlocked.', good: true });
      setBusy(false);
    }
  }, [doors, active]);

  const isWall = useCallback(
    (r: number, c: number) => grid[r * cols + c] === '1',
    [grid, cols],
  );

  const move = useCallback((dr: number, dc: number) => {
    if (active !== null || busy) return;
    setPos((p) => {
      const n = { r: p.r + dr, c: p.c + dc };
      if (n.r < 0 || n.r >= rows || n.c < 0 || n.c >= cols || isWall(n.r, n.c)) return p;

      const di = doors.findIndex((d) => d.r === n.r && d.c === n.c);
      if (di >= 0 && !doors[di].open) { setActive(di); setPick(-1); setMsg(null); return p; }

      if (n.r === exitCell.r && n.c === exitCell.c) {
        if (opened >= totalDoors) { setBusy(true); send({ action: 'exit' }); }
        else setMsg({ text: `Exit locked — open all ${totalDoors} doors first.`, good: false });
      }
      return n;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, busy, doors, rows, cols, isWall, opened, totalDoors, send]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
      }
      if (k === 'arrowup' || k === 'w') move(-1, 0);
      else if (k === 'arrowdown' || k === 's') move(1, 0);
      else if (k === 'arrowleft' || k === 'a') move(0, -1);
      else if (k === 'arrowright' || k === 'd') move(0, 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  async function submit() {
    if (active === null || pick < 0 || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res: any = await send({ door: active, pick });
      if (res?.correct) {
        // Correct — door will open via view update; the effect above will move the player
        // Keep the success message (effect also sets it, but set here for instant feedback)
        setMsg({ text: 'Correct — door unlocked.', good: true });
        // busy will be cleared by the effect when doors[active].open becomes true
        // Fallback clear in case view doesn't update quickly
        setTimeout(() => setBusy(false), 1200);
      } else {
        // Wrong answer — server already decremented lives / reset if needed
        // Check if we were locked/reset via done/locked or just lost a life
        if (res?.locked || res?.done) {
          setMsg({ text: 'No lives left — maze reset.', good: false });
        } else {
          setMsg({ text: 'Incorrect — one life lost.', good: false });
        }
        setPick(-1);
        setBusy(false);
      }
    } catch {
      setMsg({ text: 'Incorrect — one life lost.', good: false });
      setPick(-1);
      setBusy(false);
    }
  }

  const s = Math.ceil(msLeft / 1000);
  const doorAt = new Map(doors.map((d, i) => [`${d.r},${d.c}`, { ...d, i }]));
  const q = active !== null ? doors[active] : null;
  const progress = Math.round(((cleared + opened) / 15) * 100);

  return (
    <div className="mx-auto flex h-screen max-w-[1500px] flex-col gap-3 overflow-hidden px-6 py-4">
      {hud}

      {/* stats */}
      <div className="grid shrink-0 grid-cols-4 gap-2.5">
        {[
          ['LEVEL', `${level} / 2`, 'text-cyan-100'],
          ['DOORS', `${opened} / ${totalDoors}`, 'text-cyan-100'],
          ['LIVES', '♥ '.repeat(lives).trim() || '0', lives <= 1 ? 'text-red-400' : 'text-cyan-100'],
          ['TIME LEFT', `${pad(Math.floor(s / 60))}:${pad(s % 60)}`, s <= 30 ? 'text-red-400' : 'text-amber-300'],
        ].map(([label, val, tone]) => (
          <div key={label} className="rounded-lg border border-cyan-500/30 bg-[#06111d]/95 px-4 py-2.5">
            <p className="text-[10px] tracking-[2px] text-[#648195]">{label}</p>
            <p className={'mt-0.5 text-xl font-bold ' + tone}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ---------- maze ---------- */}
        <div className="flex min-h-0 flex-col rounded-lg border border-cyan-500/30 bg-[#06111d]/95 p-3">
          <div className="mb-2 flex shrink-0 items-end justify-between gap-4">
            <div>
              <h1 className="text-[15px] font-bold tracking-wide text-[#dffcff]">
                {level === 1 ? 'LEVEL 1 — CSE BASICS' : 'LEVEL 2 — CSE CHALLENGE'}
              </h1>
              <p className="mt-0.5 text-[12px] text-[#7d9aac]">
                Reach the exit. Locked doors are obstacles.
              </p>
            </div>
            <span className="shrink-0 text-[11px] tracking-wide text-[#67b4c8]">
              ↑ ↓ ← → &nbsp;or&nbsp; W A S D
            </span>
          </div>

          <div
            className="grid min-h-0 w-full gap-[2px] rounded-md border border-cyan-500/25 bg-[#01050a] p-1"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              aspectRatio: `${cols} / ${rows}`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              const wall = grid[idx] === '1';
              const door = doorAt.get(`${r},${c}`);
              const isPlayer = pos.r === r && pos.c === c;
              const isExit = r === exitCell.r && c === exitCell.c;

              let cls = wall
                ? 'bg-gradient-to-br from-[#0641a0] to-[#082b68]'
                : 'bg-[#04121d]';
              if (door) {
                cls = door.open
                  ? 'bg-gradient-to-br from-[#087b52] to-[#063b2d] ring-1 ring-emerald-400'
                  : 'bg-gradient-to-br from-[#7b1730] to-[#351022] ring-1 ring-rose-400';
              }
              if (isExit) cls = 'bg-cyan-400/80 ring-1 ring-cyan-200';
              if (isPlayer) cls = 'bg-cyan-300 ring-2 ring-cyan-100';

              return <div key={idx} className={'rounded-[2px] ' + cls} />;
            })}
          </div>

          <div className="mt-2 flex shrink-0 flex-wrap gap-4 text-[11px] tracking-wide text-[#7691a0]">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-cyan-300" />YOU</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-rose-500" />LOCKED</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-emerald-400" />OPEN</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-cyan-400" />EXIT</span>
          </div>
        </div>

        {/* ---------- side panel ---------- */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div className="rounded-lg border border-cyan-500/30 bg-[#06111d]/95 p-4">
            <p className="text-[10px] font-extrabold tracking-[2px] text-[#55cfe2]">DOOR CHALLENGE</p>

            {q ? (
              <>
                <h2 className="mt-1.5 text-[16px] font-bold text-[#dffcff]">
                  LOCKED DOOR {active! + 1}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#c9e8f1]">{q.question}</p>

                <div className="mt-3 grid gap-1.5">
                  {q.options.map((o, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPick(i)}
                      disabled={busy}
                      className={
                        'rounded-md border px-2.5 py-2 text-left text-[13px] transition-colors ' +
                        (pick === i
                          ? 'border-cyan-400 bg-[#0b2634] text-cyan-100'
                          : 'border-[#214258] bg-[#07131f] text-[#c9e8f1] hover:border-cyan-500/60')
                      }
                    >
                      {String.fromCharCode(65 + i)}. {o}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={pick < 0 || busy}
                  className="mt-3 w-full rounded-lg bg-cyan-400 py-2.5 text-[13px] font-extrabold
                             tracking-wide text-[#001015] hover:brightness-110 disabled:opacity-35"
                >
                  {busy ? 'CHECKING…' : 'SUBMIT ANSWER'}
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-1.5 text-[16px] font-bold text-[#dffcff]">Keep moving</h2>
                <p className="mt-2 text-[13px] text-[#90a9b7]">
                  Find the next locked door, or reach the glowing exit.
                </p>
              </>
            )}

            {msg && (
              <p className={'mt-2.5 text-[12px] font-bold ' + (msg.good ? 'text-emerald-400' : 'text-rose-400')}>
                {msg.text}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-cyan-500/30 bg-[#06111d]/95 p-4">
            <p className="text-[10px] font-extrabold tracking-[2px] text-[#55cfe2]">MISSION</p>
            <h2 className="mt-1.5 text-[16px] font-bold text-[#dffcff]">Find the key fragment</h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full border border-[#173345] bg-[#09151e]">
              <div
                className="h-full bg-gradient-to-r from-[#087cff] to-[#1ee7ff] transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#7e9aaa]">
              {cleared + opened} / 15 doors cleared across both levels
            </p>
            {runs > 0 && (
              <p className="mt-2 text-[11px] text-[#7e9aaa]">Attempt {runs + 1}.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
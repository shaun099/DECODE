'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

const ENGINE_CSS = `
#stage {
  --bg:#0f1116; --bg2:#181b23; --stage:#0c0e13; --fg:#ece8df;
  --muted:#9a978e; --line:rgba(236,232,223,.12); --panel:rgba(24,27,35,.66);
  --accent:#ffb24d; --accent-press:#d98a26;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
#stage .hidden { display:none !important; }

#stage canvas#game {
  display:block; max-width:100%; max-height:100%;
  background:var(--bg); border-radius:10px; touch-action:none;
}

#stage #hud {
  position:absolute; top:0; left:0; right:0;
  display:flex; align-items:flex-start; justify-content:space-between;
  padding:14px 18px; pointer-events:none; font-weight:700; z-index:5; color:var(--fg);
}
#stage .hud-left { display:flex; align-items:center; gap:12px; }
#stage .pill {
  display:inline-grid; place-items:center; min-width:30px; height:30px; padding:0 8px;
  border-radius:9px; background:var(--accent); color:#16110a; font-weight:800; font-size:15px;
}
#stage #hud-levelname { font-size:15px; letter-spacing:.08em; text-transform:uppercase; opacity:.85; }
#stage .hud-right { display:flex; align-items:center; gap:8px; font-size:15px; }
#stage .hint {
  margin-left:10px; font-size:11px; letter-spacing:.06em;
  color:var(--muted); text-transform:uppercase;
}

#stage #menu, #stage #end-screen {
  position:absolute; inset:0; z-index:10; overflow:hidden; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  background: radial-gradient(ellipse 90% 70% at 50% 18%, var(--bg2) 0%, var(--bg) 62%, var(--stage) 100%);
}
#stage .menu-inner {
  width:100%; height:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:4% 6%;
  text-align:center; overflow-y:auto; color:var(--fg);
}
#stage .title {
  margin:4px 0 6px; font-size:clamp(28px,5vw,54px); font-weight:900;
  line-height:.95; display:flex; gap:12px; flex-wrap:wrap; justify-content:center;
}
#stage .t-fable { color:var(--fg); }
#stage .t-devil { color:var(--accent); }
#stage .subtitle { margin:0 0 22px; color:var(--muted); font-size:15px; }

#stage #play-btn, #stage #end-menu-btn {
  font:inherit; font-size:18px; font-weight:800; letter-spacing:.08em;
  color:#16110a; background:var(--accent); border:none; border-radius:13px;
  padding:13px 46px; cursor:pointer; box-shadow:0 8px 0 var(--accent-press);
}
#stage #play-btn:active, #stage #end-menu-btn:active {
  transform:translateY(6px); box-shadow:0 2px 0 var(--accent-press);
}

#stage .grid-label {
  margin:24px 0 10px; font-size:11px; letter-spacing:.22em;
  text-transform:uppercase; color:var(--muted);
}
#stage #level-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; width:190px; }
#stage #level-grid button {
  aspect-ratio:1; display:grid; place-items:center; font:inherit; font-size:15px;
  font-weight:700; color:var(--fg); background:var(--panel);
  border:1px solid var(--line); border-radius:9px; cursor:pointer;
}
#stage #level-grid button:disabled { opacity:.32; cursor:not-allowed; }
#stage #level-grid button.done { background:var(--accent); border-color:var(--accent); color:#16110a; }

#stage .menu-deaths { margin:20px 0 4px; color:var(--muted); font-size:13px; }
#stage .controls-hint { margin:4px 0 0; color:var(--muted); font-size:12px; opacity:.7; }

#stage .end-title {
  font-size:clamp(30px,6vw,58px); font-weight:900; line-height:.9;
  margin:0 0 10px; color:var(--accent);
}
#stage .end-sub { color:var(--muted); font-size:17px; margin:0 0 16px; }
#stage .end-stats { font-size:15px; max-width:420px; margin:0 0 24px; line-height:1.5; }
`;

export default function LevelDevilGame({ hud, view, send }: GameProps) {
  const cleared: number[] = view?.cleared ?? [];
  const total: number = view?.total ?? 3;

  const started = useRef(false);
  const wonRef = useRef(false);
  const [deaths, setDeaths] = useState(0);

  // Wrap send so a duplicate win after the task is already solved does not
  // surface as "not the committed task" (unhandledRejection in the browser).
  // The engine fires onLevelCleared for the final room and then onAllCleared
  // ~0.8s later. Both would complete the task; the server now handles the
  // second idempotently, but we still swallow rejections so the browser does
  // not log an unhandled error.
  const safeSend = (payload: any) => {
    if (wonRef.current && payload?.all) return Promise.resolve();
    if (payload?.all) wonRef.current = true;
    const p = Promise.resolve(send(payload));
    p.catch(() => {});
    return p;
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let teardown: (() => void) | undefined;

    import('./engine').then(({ boot }) => {
      teardown = boot({
        onLevelCleared: (levelIndex, d) => {
          setDeaths(d);
          safeSend({ level: levelIndex, deaths: d });
        },
        onAllCleared: (d) => {
          setDeaths(d);
          safeSend({ all: true, deaths: d });
        },
        onReset: (d) => {
          setDeaths(d);
          // Any death resets server progress to room 1.
          safeSend({ reset: true, deaths: d });
        },
      });
    });

    return () => teardown?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex h-screen max-w-5xl flex-col gap-3 overflow-hidden px-6 py-4">
      <style dangerouslySetInnerHTML={{ __html: ENGINE_CSS }} />

      {hud}

      <div className="flex shrink-0 items-center justify-between font-mono text-[12px]">
        <span className="tracking-[0.18em] text-zinc-500">
          ROOM {Math.min(cleared.length + 1, total)} OF {total}
        </span>
        <span className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={
                'h-2 w-7 rounded-full ' +
                (cleared.includes(i)
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(255,178,77,.9)]'
                  : 'bg-zinc-800')
              }
            />
          ))}
        </span>
        <span className="tracking-[0.18em] text-zinc-500">
          ☠ <span className="text-zinc-200">{deaths}</span>
        </span>
      </div>

      {/* position:relative is what lets the overlays cover the canvas */}
      <div
        id="stage"
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden
                   rounded-xl border-2 border-amber-900/50 bg-[#0c0e13]"
      >
        <canvas id="game" width={960} height={540} />

        <div id="hud" className="hidden">
          <div className="hud-left">
            <span id="hud-levelnum" className="pill">1</span>
            <span id="hud-levelname" />
          </div>
          <div className="hud-right">
            <span className="skull">&#9760;</span>
            <span id="hud-deaths">0</span>
            <span className="hint">R restart</span>
          </div>
        </div>

        <div id="menu">
          <div className="menu-inner">
            <h1 className="title">
              <span className="t-fable">THE HONEST</span>
              <span className="t-devil">FLOOR</span>
            </h1>
            <p className="subtitle">Three rooms. The floor is right there.</p>
            <button id="play-btn">PLAY</button>
            <div className="grid-label">rooms</div>
            <div id="level-grid" />
            <p className="menu-deaths">
              total deaths: <span id="menu-deaths">0</span>
            </p>
            <p className="controls-hint">
              ← → / A D move · ↑ / W / SPACE jump · R restart
            </p>
          </div>
        </div>

        <div id="end-screen" className="hidden">
          <div className="menu-inner">
            <h1 className="end-title">ALL THREE<br />CLEARED</h1>
            <p className="end-sub">...and that is all that happens.</p>
            <p className="end-stats">
              you died <span id="end-deaths">0</span> times. <span id="end-roast" />
            </p>
            <button id="end-menu-btn">BACK</button>
          </div>
        </div>

        {/* the engine wires these; present but hidden */}
        <div id="topbar" className="hidden">
          <button id="btn-theme" className="ic-btn"><span id="ic-theme" /></button>
          <button id="btn-mute" className="ic-btn"><span id="ic-mute" /></button>
          <button id="btn-fs" className="ic-btn"><span id="ic-fs" /></button>
        </div>
        <div id="touch-controls" className="hidden">
          <div className="tc-group tc-move">
            <button id="tc-left" className="tc-btn" />
            <button id="tc-right" className="tc-btn" />
          </div>
          <div className="tc-group tc-actions">
            <button id="tc-restart" className="tc-btn tc-small" />
            <button id="tc-jump" className="tc-btn tc-jump" />
          </div>
        </div>
        <div id="rotate-hint" className="hidden" />
      </div>
    </div>
  );
}
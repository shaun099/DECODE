'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface MemoryCard {
  index: number;
  value: string | null;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryGame({ hud, view, send }: GameProps) {
  const cards: MemoryCard[] = view?.cards ?? [];
  const matched: number[] = view?.matched ?? [];
  const flipped: number[] = view?.flipped ?? [];
  const totalPairs: number = view?.totalPairs ?? 50;
  const failed: boolean = view?.failed ?? false;
  const done: boolean = view?.done ?? false;

  const [fullscreen, setFullscreen] = useState(false);
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);

  const gameRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  /*
   * The browser Fullscreen API only allows entering fullscreen
   * after a user gesture, hence the START button.
   */
  async function enterFullscreen() {
    try {
      await gameRef.current?.requestFullscreen();
      startedRef.current = true;
      setFullscreen(true);
      setWarning('');
    } catch {
      setWarning('Fullscreen permission is required to play.');
    }
  }

  /*
   * Fullscreen exit = game violation.
   */
  useEffect(() => {
    function handleFullscreenChange() {
      const active = document.fullscreenElement === gameRef.current;
      setFullscreen(active);

      if (startedRef.current && !active && !done && !failed) {
        setWarning('Fullscreen was exited. Game terminated.');
        send({ action: 'violation', reason: 'fullscreen-exit' });
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, [done, failed, send]);

  /*
   * Tab switching / minimizing / changing visibility.
   */
  useEffect(() => {
    function handleVisibility() {
      if (
        document.visibilityState === 'hidden' &&
        startedRef.current &&
        !done &&
        !failed
      ) {
        setWarning('Tab switching detected. Game terminated.');
        send({ action: 'violation', reason: 'tab-switch' });
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [done, failed, send]);

  /*
   * Browser back button.
   */
  useEffect(() => {
    if (!startedRef.current) return;

    const state = { memoryGame: true };

    window.history.pushState(state, '', window.location.href);

    function handlePopState() {
      window.history.pushState(state, '', window.location.href);

      if (!done && !failed) {
        setWarning('Back navigation is disabled during the game.');
        send({ action: 'violation', reason: 'back-navigation' });
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [done, failed, send, fullscreen]);

  /*
   * Keyboard restrictions.
   *
   * We cannot truly prevent every OS/browser shortcut, but we can
   * block common navigation/devtools/fullscreen shortcuts.
   */
  useEffect(() => {
    if (!fullscreen || done || failed) return;

    function handleKeyDown(e: KeyboardEvent) {
      const blocked =
        e.key === 'F5' ||
        e.key === 'F11' ||
        e.key === 'Escape' ||
        (e.ctrlKey && e.key.toLowerCase() === 'r') ||
        (e.ctrlKey && e.key.toLowerCase() === 'w') ||
        (e.ctrlKey && e.key.toLowerCase() === 'l') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') ||
        (e.ctrlKey && e.key.toLowerCase() === 'u');

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [fullscreen, done, failed]);

  /*
   * Prevent context menu.
   */
  useEffect(() => {
    function contextMenu(e: MouseEvent) {
      if (fullscreen) e.preventDefault();
    }

    document.addEventListener('contextmenu', contextMenu);

    return () => {
      document.removeEventListener('contextmenu', contextMenu);
    };
  }, [fullscreen]);

  /*
   * After two cards are shown, wait briefly before allowing another
   * selection if they do not match.
   *
   * The server remains authoritative; this only clears the displayed
   * mismatch after the server has recorded it.
   */
  useEffect(() => {
    if (flipped.length !== 2 || busy) return;

    const [a, b] = flipped;
    const ca = cards.find((c) => c.index === a);
    const cb = cards.find((c) => c.index === b);

    if (!ca || !cb) return;

    if (ca.value !== null && cb.value !== null && ca.value !== cb.value) {
      setBusy(true);

      const timer = setTimeout(() => {
        send({
          action: 'hide',
          first: a,
          second: b,
        });

        setBusy(false);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [flipped, cards, busy, send]);

  function pickCard(index: number) {
    if (!fullscreen || failed || done || busy) return;

    const card = cards.find((c) => c.index === index);
    if (!card) return;

    if (card.matched || card.flipped) return;

    /*
     * Never allow more than two cards to be active.
     */
    if (flipped.length >= 2) return;

    send({
      action: 'flip',
      index,
    });
  }

  const progress = Math.round((matched.length / (totalPairs * 2)) * 100);

  /*
   * Before fullscreen starts.
   */
  if (!fullscreen && !failed && !done) {
    return (
      <div
        ref={gameRef}
        className="flex h-screen items-center justify-center bg-black text-white"
      >
        <div className="w-full max-w-md space-y-6 px-6 text-center">
          {hud}

          <div className="rounded-lg border-2 border-emerald-700 bg-neutral-950 p-8">
            <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-emerald-400">
              MEMORY GRID
            </p>

            <h1 className="mt-3 text-3xl font-black">
              100 CARDS
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Match all 50 pairs. Two cards at a time.
              Wrong pairs are returned face down.
            </p>

            <div className="mt-6 space-y-2 text-left font-mono text-[11px] text-zinc-500">
              <p>• Fullscreen is mandatory.</p>
              <p>• Tab switching ends the game.</p>
              <p>• Back navigation is disabled.</p>
              <p>• Match all 50 pairs to complete.</p>
            </div>

            {warning && (
              <p className="mt-5 text-sm text-amber-400">
                {warning}
              </p>
            )}

            <button
              type="button"
              onClick={enterFullscreen}
              className="mt-7 w-full border-2 border-emerald-500
                         bg-emerald-500 px-6 py-3
                         font-mono text-xs font-black
                         tracking-[0.2em] text-black
                         transition hover:bg-emerald-400"
            >
              ENTER FULLSCREEN & START
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Game over / violation.
   */
  if (failed) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="rounded-lg border-2 border-amber-700 bg-neutral-950 p-10 text-center">
          <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-amber-400">
            GAME TERMINATED
          </p>

          <h1 className="mt-4 text-3xl font-black">
            RULE VIOLATION
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            {warning || 'The game was terminated because fullscreen or focus was lost.'}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Completed.
   */
  if (done) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="rounded-lg border-2 border-emerald-700 bg-neutral-950 p-10 text-center">
          <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-emerald-400">
            MEMORY GRID COMPLETE
          </p>

          <h1 className="mt-4 text-4xl font-black">
            ALL 50 PAIRS MATCHED
          </h1>

          <p className="mt-4 font-mono text-sm text-zinc-400">
            100 / 100 CARDS LOCKED IN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={gameRef}
      className="flex h-screen flex-col overflow-hidden bg-black px-6 py-5 text-white"
    >
      {hud}

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-emerald-400">
              MEMORY GRID
            </p>
            <h1 className="mt-1 text-xl font-black">
              FIND THE PAIRS
            </h1>
          </div>

          <div className="text-right font-mono">
            <p className="text-[10px] tracking-[0.15em] text-zinc-500">
              PAIRS
            </p>
            <p className="text-lg font-bold text-emerald-400">
              {matched.length / 2} / {totalPairs}
            </p>
          </div>
        </div>

        {/* Card grid */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="grid w-full max-w-[760px] gap-2"
            style={{
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
            }}
          >
            {cards.map((card) => {
              const visible =
                card.flipped || card.matched;

              return (
                <button
                  key={card.index}
                  type="button"
                  onClick={() => pickCard(card.index)}
                  disabled={
                    card.flipped ||
                    card.matched ||
                    busy
                  }
                  className={
                    'aspect-square w-full rounded-md border-2 ' +
                    'flex items-center justify-center ' +
                    'select-none transition-all duration-200 ' +
                    (visible
                      ? card.matched
                        ? 'border-emerald-500 bg-emerald-950/80'
                        : 'border-amber-400 bg-amber-200'
                      : 'border-neutral-700 bg-neutral-900 hover:border-emerald-600 hover:bg-neutral-800')
                  }
                >
                  {visible ? (
                    <span
                      className={
                        'text-2xl font-black sm:text-3xl ' +
                        (card.matched
                          ? 'text-emerald-300'
                          : 'text-neutral-900')
                      }
                    >
                      {card.value}
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-bold text-emerald-700">
                      {String(card.index + 1).padStart(2, '0')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="shrink-0 space-y-2">
          <div className="h-1.5 w-full rounded-full bg-neutral-800">
            <div
              className="h-1.5 rounded-full bg-emerald-400
                         shadow-[0_0_8px_rgba(52,211,153,.9)]
                         transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] text-zinc-500">
            <span>{matched.length} / 100 CARDS MATCHED</span>
            <span>FULLSCREEN ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
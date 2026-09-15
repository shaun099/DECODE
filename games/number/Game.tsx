'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface Clue {
  id: string;
  text: string;
}

interface MysteryView {
  round: number;

  totalGuesses: number;
  guessesUsed: number;
  guessesLeft: number;

  clues: Clue[];

  feedback: 'higher' | 'lower' | 'correct' | null;
  lastGuess: number | null;

  failed: boolean;
  done: boolean;
}

export default function NumberMystery({
  hud,
  view,
  send,
}: GameProps) {
  const gameView: MysteryView = view ?? {
    round: 1,
    totalGuesses: 4,
    guessesUsed: 0,
    guessesLeft: 4,
    clues: [],
    feedback: null,
    lastGuess: null,
    failed: false,
    done: false,
  };

  const [fullscreen, setFullscreen] =
    useState(false);

  const [warning, setWarning] =
    useState('');

  const [guess, setGuess] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const gameRef =
    useRef<HTMLDivElement>(null);

  const startedRef =
    useRef(false);

  const {
    round,
    totalGuesses,
    guessesUsed,
    guessesLeft,
    clues,
    feedback,
    lastGuess,
    failed,
    done,
  } = gameView;

  /*
   * -----------------------------------------
   * FULLSCREEN
   * -----------------------------------------
   */
  async function enterFullscreen() {
    try {
      await gameRef.current?.requestFullscreen();

      startedRef.current = true;

      setFullscreen(true);
      setWarning('');
    } catch {
      setWarning(
        'Fullscreen permission is required to play.',
      );
    }
  }

  /*
   * -----------------------------------------
   * FULLSCREEN VIOLATION
   * -----------------------------------------
   */
  useEffect(() => {
    function handleFullscreenChange() {
      const active =
        document.fullscreenElement ===
        gameRef.current;

      setFullscreen(active);

      if (
        startedRef.current &&
        !active &&
        !done &&
        !failed
      ) {
        setWarning(
          'Fullscreen was exited. Game terminated.',
        );

        send({
          action: 'violation',
          reason: 'fullscreen-exit',
        });
      }
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, [done, failed, send]);

  /*
   * -----------------------------------------
   * TAB SWITCHING
   * -----------------------------------------
   */
  useEffect(() => {
    function handleVisibility() {
      if (
        document.visibilityState === 'hidden' &&
        startedRef.current &&
        !done &&
        !failed
      ) {
        setWarning(
          'Tab switching detected. Game terminated.',
        );

        send({
          action: 'violation',
          reason: 'tab-switch',
        });
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibility,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      );
    };
  }, [done, failed, send]);

  /*
   * -----------------------------------------
   * BACK NAVIGATION
   * -----------------------------------------
   */
  useEffect(() => {
    if (!startedRef.current) return;

    const state = {
      numberMystery: true,
    };

    window.history.pushState(
      state,
      '',
      window.location.href,
    );

    function handlePopState() {
      window.history.pushState(
        state,
        '',
        window.location.href,
      );

      if (!done && !failed) {
        setWarning(
          'Back navigation is disabled during the game.',
        );

        send({
          action: 'violation',
          reason: 'back-navigation',
        });
      }
    }

    window.addEventListener(
      'popstate',
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
    };
  }, [
    done,
    failed,
    send,
    fullscreen,
  ]);

  /*
   * -----------------------------------------
   * KEYBOARD RESTRICTIONS
   * -----------------------------------------
   */
  useEffect(() => {
    if (!fullscreen || done || failed) {
      return;
    }

    function handleKeyDown(
      e: KeyboardEvent,
    ) {
      const blocked =
        e.key === 'F5' ||
        e.key === 'F11' ||
        e.key === 'Escape' ||
        (e.ctrlKey &&
          e.key.toLowerCase() === 'r') ||
        (e.ctrlKey &&
          e.key.toLowerCase() === 'w') ||
        (e.ctrlKey &&
          e.key.toLowerCase() === 'l') ||
        (e.ctrlKey &&
          e.shiftKey &&
          e.key.toLowerCase() === 'i') ||
        (e.ctrlKey &&
          e.shiftKey &&
          e.key.toLowerCase() === 'j') ||
        (e.ctrlKey &&
          e.key.toLowerCase() === 'u');

      /*
       * Allow normal typing inside the guess input.
       */
      if (
        e.target instanceof HTMLInputElement
      ) {
        if (
          e.key !== 'F5' &&
          e.key !== 'F11' &&
          e.key !== 'Escape' &&
          !(e.ctrlKey && e.key.toLowerCase() === 'r') &&
          !(e.ctrlKey && e.key.toLowerCase() === 'w') &&
          !(e.ctrlKey && e.key.toLowerCase() === 'l') &&
          !(e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase() === 'i') &&
          !(e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase() === 'j') &&
          !(e.ctrlKey && e.key.toLowerCase() === 'u')
        ) {
          return;
        }
      }

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
      true,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
        true,
      );
    };
  }, [fullscreen, done, failed]);

  /*
   * -----------------------------------------
   * CONTEXT MENU
   * -----------------------------------------
   */
  useEffect(() => {
    function contextMenu(
      e: MouseEvent,
    ) {
      if (fullscreen) {
        e.preventDefault();
      }
    }

    document.addEventListener(
      'contextmenu',
      contextMenu,
    );

    return () => {
      document.removeEventListener(
        'contextmenu',
        contextMenu,
      );
    };
  }, [fullscreen]);

  /*
   * -----------------------------------------
   * GUESS
   * -----------------------------------------
   */
  async function submitGuess() {
    if (
      !fullscreen ||
      failed ||
      done ||
      busy
    ) {
      return;
    }

    const value = Number(guess);

    if (
      !Number.isInteger(value) ||
      value < 1000 ||
      value > 9999
    ) {
      setWarning(
        'Enter a valid four-digit number.',
      );

      return;
    }

    if (guessesLeft <= 0) {
      return;
    }

    setBusy(true);
    setWarning('');

    try {
      await send({
        action: 'guess',
        value,
      });

      setGuess('');
    } catch {
      setWarning(
        'The guess could not be submitted. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  /*
   * -----------------------------------------
   * ENTER KEY
   * -----------------------------------------
   */
  function handleInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submitGuess();
    }
  }

  /*
   * -----------------------------------------
   * BEFORE FULLSCREEN
   * -----------------------------------------
   */
  if (
    !fullscreen &&
    !failed &&
    !done
  ) {
    return (
      <div
        ref={gameRef}
        className="flex h-screen items-center justify-center bg-black px-6 text-white"
      >
        <div className="w-full max-w-xl space-y-6 text-center">
          {hud}

          <div className="border-2 border-emerald-700 bg-neutral-950 p-8">
            <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-emerald-400">
              NUMBER MYSTERY
            </p>

            <h1 className="mt-4 text-4xl font-black">
              THE UNKNOWN FOUR
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              A four-digit number is hidden from
              you. Decode the clues, make your
              deductions, and find the number.
            </p>

            <div className="mt-7 space-y-3 border border-neutral-800 bg-black p-5 text-left font-mono text-[11px] text-zinc-500">
              <p>
                • FOUR GUESSES PER MYSTERY
              </p>

              <p>
                • ONLY HIGHER / LOWER AFTER A MISS
              </p>

              <p>
                • FOUR MISSES = NEW MYSTERY
              </p>

              <p>
                • THE GAME CONTINUES UNTIL SOLVED
              </p>

              <p>
                • FULLSCREEN IS MANDATORY
              </p>
            </div>

            {warning && (
              <p className="mt-5 text-sm text-amber-400">
                {warning}
              </p>
            )}

            <button
              type="button"
              onClick={enterFullscreen}
              className="mt-7 w-full border-2 border-emerald-500 bg-emerald-500 px-6 py-4 font-mono text-xs font-black tracking-[0.2em] text-black transition hover:bg-emerald-400"
            >
              ENTER FULLSCREEN & START
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * FAILED
   * -----------------------------------------
   */
  if (failed) {
    return (
      <div className="flex h-screen items-center justify-center bg-black px-6 text-white">
        <div className="border-2 border-amber-700 bg-neutral-950 p-10 text-center">
          <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-amber-400">
            GAME TERMINATED
          </p>

          <h1 className="mt-4 text-3xl font-black">
            RULE VIOLATION
          </h1>

          <p className="mt-4 max-w-md text-sm text-zinc-400">
            {warning ||
              'The game was terminated because fullscreen or focus was lost.'}
          </p>
        </div>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * COMPLETED
   * -----------------------------------------
   */
  if (done) {
    return (
      <div className="flex h-screen items-center justify-center bg-black px-6 text-white">
        <div className="border-2 border-emerald-700 bg-neutral-950 p-10 text-center">
          <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-emerald-400">
            NUMBER MYSTERY COMPLETE
          </p>

          <h1 className="mt-4 text-4xl font-black">
            MYSTERY SOLVED
          </h1>

          <p className="mt-5 font-mono text-sm text-zinc-400">
            Round {round} solved in{' '}
            {guessesUsed} guess
            {guessesUsed === 1 ? '' : 'es'}.
          </p>
        </div>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * PLAYING
   * -----------------------------------------
   */
  return (
    <div
      ref={gameRef}
      className="flex h-screen flex-col overflow-hidden bg-black px-6 py-5 text-white"
    >
      {hud}

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-5">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.28em] text-emerald-400">
              NUMBER MYSTERY
            </p>

            <h1 className="mt-1 text-xl font-black">
              THE UNKNOWN FOUR
            </h1>
          </div>

          <div className="text-right font-mono">
            <p className="text-[10px] tracking-[0.15em] text-zinc-500">
              ROUND
            </p>

            <p className="text-lg font-bold text-emerald-400">
              {round}
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid min-h-0 flex-1 gap-5 overflow-auto lg:grid-cols-[1.15fr_0.85fr]">
          {/* CLUES */}
          <section className="border-2 border-emerald-900/70 bg-neutral-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-emerald-500">
                  EVIDENCE
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  THE CLUES
                </h2>
              </div>

              <span className="font-mono text-[11px] text-zinc-600">
                CASE {String(round).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {clues.map(
                (clue, index) => (
                  <div
                    key={clue.id}
                    className="border border-neutral-800 bg-black p-4"
                  >
                    <div className="flex gap-4">
                      <span className="font-mono text-xs font-bold text-emerald-500">
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </span>

                      <p className="text-sm leading-relaxed text-zinc-300">
                        {clue.text}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* GUESS PANEL */}
          <section className="border-2 border-neutral-800 bg-neutral-950 p-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-emerald-500">
              INFERENCE
            </p>

            <h2 className="mt-2 text-2xl font-black">
              ENTER YOUR GUESS
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              The system will only tell you
              whether the mystery number is
              higher or lower.
            </p>

            <div className="mt-7">
              <label
                htmlFor="number-mystery-guess"
                className="font-mono text-[10px] tracking-[0.18em] text-zinc-500"
              >
                FOUR-DIGIT CODE
              </label>

              <input
                id="number-mystery-guess"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={guess}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      '',
                    );

                  setGuess(
                    value.slice(0, 4),
                  );
                }}
                onKeyDown={
                  handleInputKeyDown
                }
                disabled={
                  busy ||
                  guessesLeft <= 0
                }
                placeholder="0000"
                className="mt-2 w-full border-2 border-neutral-700 bg-black px-5 py-4 text-center font-mono text-3xl font-black tracking-[0.25em] text-emerald-300 outline-none transition focus:border-emerald-500 disabled:opacity-40"
              />

              <button
                type="button"
                onClick={() =>
                  void submitGuess()
                }
                disabled={
                  busy ||
                  guess.length !== 4 ||
                  guessesLeft <= 0
                }
                className="mt-4 w-full border-2 border-emerald-600 bg-emerald-500/10 px-6 py-4 font-mono text-xs font-black tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                {busy
                  ? 'PROCESSING…'
                  : 'SUBMIT GUESS'}
              </button>
            </div>

            {/* FEEDBACK */}
            {feedback && (
              <div className="mt-7 border-2 border-neutral-800 bg-black p-5 text-center">
                <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
                  SYSTEM RESPONSE
                </p>

                <p
                  className={
                    'mt-3 font-mono text-2xl font-black tracking-[0.2em] ' +
                    (feedback ===
                    'higher'
                      ? 'text-emerald-400'
                      : feedback ===
                          'lower'
                        ? 'text-amber-400'
                        : 'text-emerald-300')
                  }
                >
                  {feedback ===
                  'higher'
                    ? 'HIGHER'
                    : feedback ===
                        'lower'
                      ? 'LOWER'
                      : 'CORRECT'}
                </p>

                {lastGuess !==
                  null && (
                  <p className="mt-2 font-mono text-[11px] text-zinc-600">
                    GUESS:{' '}
                    {String(
                      lastGuess,
                    ).padStart(
                      4,
                      '0',
                    )}
                  </p>
                )}
              </div>
            )}

            {/* ATTEMPTS */}
            <div className="mt-7 border-t border-neutral-800 pt-5">
              <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] text-zinc-500">
                <span>
                  GUESSES USED
                </span>

                <span>
                  {guessesUsed} /{' '}
                  {totalGuesses}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {Array.from(
                  {
                    length:
                      totalGuesses,
                  },
                  (_, index) => (
                    <div
                      key={index}
                      className={
                        'h-2 flex-1 ' +
                        (index <
                        guessesUsed
                          ? 'bg-emerald-500'
                          : 'bg-neutral-800')
                      }
                    />
                  ),
                )}
              </div>

              <p className="mt-3 text-center font-mono text-[10px] tracking-[0.15em] text-zinc-600">
                {guessesLeft}{' '}
                GUESS
                {guessesLeft ===
                1
                  ? ''
                  : 'ES'}{' '}
                REMAINING
              </p>
            </div>

            {warning && (
              <p className="mt-5 text-center font-mono text-xs text-amber-400">
                {warning}
              </p>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 flex justify-between border-t border-neutral-900 pt-3 font-mono text-[10px] tracking-[0.15em] text-zinc-600">
          <span>
            MYSTERY ACTIVE
          </span>

          <span>
            FULLSCREEN ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
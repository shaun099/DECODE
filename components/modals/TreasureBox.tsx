'use client';

import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';
import { Inbox, X, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';

type Key = string | { game?: string; value: string };

export function TreasureBox({ keys = [] }: { keys?: Key[] }) {
  const [open, setOpen] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const items = keys.map((k) => (typeof k === 'string' ? { value: k } : k));

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 rounded-2xl border-2 border-lime-500/80 bg-black/75 px-4 py-3 backdrop-blur-md shadow-[0_0_24px_rgba(132,204,22,0.25)] transition-all hover:bg-black/90 hover:border-lime-400 hover:shadow-[0_0_32px_rgba(132,204,22,0.45)] focus:outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Key vault (${items.length})`}
      >
        <div className="relative flex items-center justify-center">
          <Inbox className="h-5 w-5 text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
          {items.length > 0 && (
            <span className="absolute -top-2.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-400 px-1 font-mono text-[10px] font-black text-black shadow-[0_0_8px_rgba(163,230,53,0.9)]">
              {items.length}
            </span>
          )}
        </div>
        <span className="hidden sm:inline-block font-mono text-xs font-bold tracking-[0.18em] text-lime-100">
          VAULT
        </span>
      </motion.button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative flex h-[80vh] max-h-[620px] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-2 border-lime-500/80 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(132,204,22,0.25)]"
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between border-b-2 border-lime-500/30 bg-lime-950/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-500/40 bg-lime-500/10 text-lime-400 shadow-[0_0_12px_rgba(132,204,22,0.3)]">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-mono text-base sm:text-lg font-black uppercase tracking-[0.2em] text-[#86efac] drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]">
                      KEY VAULT
                    </h2>
                    <span className="font-serif text-[10px] sm:text-xs tracking-[0.28em] uppercase text-lime-100/70">
                      COLLECTED FRAGMENTS ({items.length})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-lime-500/30 bg-black/40 text-lime-400 transition-colors hover:border-lime-400 hover:bg-lime-500/20 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content / Key List */}
              <div
                className="flex-1 overflow-y-auto p-5 sm:p-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#84cc1660 transparent',
                }}
              >
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-lime-500/25 bg-lime-950/10 p-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-lime-500/30 bg-lime-500/10 text-lime-400">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <p className="font-mono text-sm font-bold tracking-wider text-lime-200">
                      VAULT IS EMPTY
                    </p>
                    <p className="mt-1.5 max-w-xs font-mono text-xs leading-relaxed text-zinc-400">
                      Solve game challenges to decrypt and extract secret key fragments.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3.5">
                    {items.map((k, i) => (
                      <li
                        key={i}
                        className="group rounded-2xl border border-lime-500/40 bg-lime-950/20 p-4 transition-all hover:border-lime-400/80 hover:bg-lime-950/30 shadow-[0_0_15px_rgba(132,204,22,0.06)]"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-black tracking-widest text-lime-400">
                            <Sparkles className="h-3.5 w-3.5 text-lime-300" />
                            {`FRAGMENT #${String(i + 1).padStart(2, '0')}`}
                          </span>
                          {k.game && (
                            <span className="rounded-md border border-lime-500/30 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-lime-200/80">
                              {k.game}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 rounded-xl border border-lime-500/25 bg-black/70 px-3.5 py-2.5">
                          <code className="break-all font-mono text-sm font-bold text-lime-100 selection:bg-lime-400 selection:text-black">
                            {k.value}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(k.value, i)}
                            className="flex shrink-0 items-center gap-1 rounded-lg border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-lime-300 transition-colors hover:border-lime-400 hover:bg-lime-500/25 hover:text-white"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="h-3 w-3 text-lime-400" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-lime-400" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
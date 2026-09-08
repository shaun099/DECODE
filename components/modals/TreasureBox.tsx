'use client';

import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

type Key = string | { game?: string; value: string };

export function TreasureBox({ keys = [] }: { keys?: Key[] }) {
  const [open, setOpen] = React.useState(false);
  const items = keys.map((k) => (typeof k === 'string' ? { value: k } : k));

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/40 bg-black/80 backdrop-blur-sm shadow-[0_0_24px_-6px_rgba(34,197,94,0.55)]"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label={`Key vault (${items.length})`}
      >
        <Chest className="h-10 w-10" />
        {items.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border border-black bg-green-500 px-1.5 text-[11px] font-bold text-black">
            {items.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-green-500/50 bg-black shadow-[0_0_60px_-12px_rgba(34,197,94,0.6)]"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-green-500/25 bg-green-950/20 px-5 py-4">
                <Chest className="h-7 w-7" />
                <h2 className="font-mono text-sm tracking-wide text-green-300">
                  KEY VAULT · {items.length}
                </h2>
                <button onClick={() => setOpen(false)} className="ml-auto text-green-500/70 hover:text-green-300" aria-label="Close">✕</button>
              </div>

              <div
                className="flex-1 overflow-y-auto p-5"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#22c55e80 transparent',
                }}
              >
                {items.length === 0 ? (
                  <p className="py-10 text-center font-mono text-sm text-green-100/50">
                    Vault empty. Beat a game to earn a key.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {items.map((k, i) => (
                      <li key={i} className="rounded-lg border border-green-500/25 bg-green-950/20 p-4">
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-green-500/60">
                          Key {String(i + 1).padStart(2, '0')}{k.game ? ` · ${k.game}` : ''}
                        </p>
                        <p className="break-words font-mono text-sm text-green-100">{k.value}</p>
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

function Chest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="tb-b" x1="32" y1="32" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14532d" /><stop offset="1" stopColor="#04240f" />
        </linearGradient>
        <linearGradient id="tb-l" x1="32" y1="14" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16803d" /><stop offset="1" stopColor="#125130" />
        </linearGradient>
      </defs>
      <path d="M9 32h46v17a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V32Z" fill="url(#tb-b)" stroke="#22c55e" strokeWidth="1.6" />
      <path d="M9 32v-6a23 12 0 0 1 46 0v6Z" fill="url(#tb-l)" stroke="#22c55e" strokeWidth="1.6" />
      <path d="M18 17V52M46 17V52" stroke="#4ade80" strokeWidth="1.2" opacity="0.4" />
      <rect x="27" y="28" width="10" height="13" rx="2.5" fill="#4ade80" stroke="#dcfce7" strokeWidth="0.9" />
      <circle cx="32" cy="33" r="1.9" fill="#04240f" />
      <path d="M32 34.4v3.2" stroke="#04240f" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
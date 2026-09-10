'use client';

export default function McqRenderer({
  hud,
  view,
  onPick,
}: {
  hud: React.ReactNode;
  view: {
    index: number;
    total: number;
    score?: number;
    need?: number;
    question: string;
    options: string[];
  };
  onPick: (i: number) => void;
}) {
  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 overflow-hidden px-6 py-6">
      {hud}

      {typeof view.score === 'number' && (
        <p className="shrink-0 font-mono text-sm text-zinc-400">
          <b className="text-green-300">{view.score}</b> correct
          <span className="text-zinc-600"> / need {view.need}</span>
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto">
        <div
          className="w-full shrink-0 rounded-2xl border-2 border-green-500/50 bg-zinc-950 px-8 py-8
                     shadow-[0_0_24px_-8px_rgba(34,197,94,0.5)]"
        >
          <p className="text-center font-mono text-xl leading-relaxed text-zinc-50">
            {view.question}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {view.options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              className="flex items-center gap-4 rounded-xl border-2 border-zinc-700 bg-zinc-950
                         px-6 py-5 text-left font-mono text-base text-zinc-200 transition-all
                         hover:border-green-400 hover:text-green-50
                         hover:shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                           border-2 border-current font-bold"
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span>{o}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
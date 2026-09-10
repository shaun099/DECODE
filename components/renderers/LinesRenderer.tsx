'use client';

export default function LinesRenderer({
  hud,
  view,
  onPick,
}: {
  hud: React.ReactNode;
  view: {
    index: number;
    total: number;
    title?: string;
    spec?: string[];
    lines: string[];
    wrong: number[];
  };
  onPick: (line: number) => void;
}) {
  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 overflow-hidden px-6 py-6">
      {hud}

      {/* the brief, when a card has one */}
      {view.spec && view.spec.length > 0 && (
        <div className="shrink-0 rounded-xl border-2 border-green-500/40 bg-zinc-950 px-5 py-4">
          <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-green-400">THE BRIEF</p>
          {view.spec.map((line, i) => (
            <p key={i} className="font-mono text-[15px] leading-7 text-zinc-100">
              {line}
            </p>
          ))}
        </div>
      )}

      {view.title && (
        <p className="shrink-0 font-mono text-sm text-zinc-400">{view.title}</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-2">
        {view.lines.map((line, i) => {
          const blank = !line.trim();
          const bad = view.wrong.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={blank || bad}
              onClick={() => onPick(i)}
              className={
                'flex w-full items-start gap-4 rounded-lg px-4 py-1.5 text-left font-mono ' +
                'text-[15px] leading-7 transition-colors ' +
                (bad
                  ? 'text-zinc-600 line-through decoration-zinc-700'
                  : blank
                    ? 'text-zinc-400'
                    : 'text-zinc-200 hover:bg-green-500/15 hover:text-green-100')
              }
            >
              <span className="w-6 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
              <span className="whitespace-pre">{line || ' '}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
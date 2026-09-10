'use client';

export default function GameHud({
  name, index, total, wrong, maxWrong,
}: {
  name: string;
  index?: number;
  total?: number;
  wrong: number;
  maxWrong: number;
}) {
  const left = Math.max(0, maxWrong - wrong);
  const critical = left <= 1;

  return (
    <div className="shrink-0 space-y-2">
      <div className="flex items-center justify-between font-mono">
        <span className="text-base text-zinc-200">
          {name}
          {typeof index === 'number' && total ? (
            <span className="ml-3 text-sm text-zinc-500">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          ) : null}
        </span>

        <span className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.2em] text-zinc-600">ATTEMPTS LEFT</span>
          <span className="flex gap-1.5">
            {Array.from({ length: maxWrong }).map((_, i) => (
              <span key={i}
                className={
                  'h-2.5 w-2.5 rounded-full ' +
                  (i < left
                    ? critical
                      ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]'
                      : 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]'
                    : 'bg-zinc-800')
                }
              />
            ))}
          </span>
        </span>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          TASK LOCKED · NO EXIT UNTIL COMPLETE
        </span>
        <span className={'font-mono text-[10px] tracking-[0.2em] ' +
          (critical ? 'text-red-400' : 'text-zinc-600')}>
          {left} {left === 1 ? 'ATTEMPT' : 'ATTEMPTS'} BEFORE A 1 MINUTE LOCK
        </span>
      </div>
    </div>
  );
}
'use client';

export default function GameHud({
  name, index, total, left, max,
}: {
  name: string;
  index?: number;
  total?: number;
  left: number;        // comes from the server, never counted locally
  max: number;
}) {
  const unlimited = max >= 50;
  const critical = !unlimited && left <= 1;
  const low = !unlimited && left <= 2;
  const has = typeof index === 'number' && !!total;

  return (
    <div className="shrink-0 border-b-2 border-emerald-900/50 pb-4">
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-600">ACTIVE TASK</p>
          <h1 className="mt-1.5 truncate text-3xl font-black tracking-tight text-emerald-300">
            {name}
          </h1>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500">
            {unlimited ? 'ATTEMPTS' : 'ATTEMPTS LEFT'}
          </p>
          {unlimited ? (
            <p className="mt-1 text-base text-zinc-400">Unlimited</p>
          ) : (
            <p className="mt-1 leading-none">
              <span className={
                'font-mono text-4xl font-bold ' +
                (critical ? 'text-red-400' : low ? 'text-amber-400' : 'text-emerald-300')
              } style={{ fontVariantNumeric: 'tabular-nums' }}>
                {left}
              </span>
              <span className="ml-1.5 font-mono text-base text-zinc-500">/{max}</span>
            </p>
          )}
        </div>
      </div>

      {has && (
        <div className="mt-4 flex items-center gap-4">
          <span className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-zinc-500">
            STEP {index! + 1} / {total}
          </span>
          <div className="h-[3px] flex-1 bg-emerald-950">
            <div className="h-[3px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]
                            transition-all duration-500"
              style={{ width: `${(index! / total!) * 100}%` }} />
          </div>
        </div>
      )}

      {low && (
        <p className={
          'mt-3 font-mono text-[13px] tracking-[0.16em] ' +
          (critical ? 'text-red-400' : 'text-amber-400')
        }>
          ▲ {critical ? 'One more mistake locks you out' : 'Lockout is close'}
        </p>
      )}
    </div>
  );
}
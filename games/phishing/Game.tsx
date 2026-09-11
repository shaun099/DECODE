'use client';
import type { GameProps } from '../registry';

interface Seg { text: string; id?: string }

function Avatar({ brand }: { brand: string }) {
  const initials = brand.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  const hue = [...brand].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
      style={{ background: `linear-gradient(135deg,hsl(${hue} 55% 42%),hsl(${(hue+40)%360} 55% 28%))` }}>
      {initials}
    </div>
  );
}

export default function PhishingGame({ hud, view, send }: GameProps) {
  const seg = (parts: Seg[]) =>
    parts.map((s, i) => {
      if (!s.id) return <span key={i}>{s.text}</span>;
      const hit = view.found.includes(s.id);
      const miss = view.wrong.includes(s.id);
      return (
        <button key={i} type="button" disabled={hit || miss} onClick={() => send({ id: s.id })}
          className={
            'rounded-sm px-1 transition-colors ' +
            (hit ? 'bg-emerald-200 text-emerald-900 ring-1 ring-emerald-500'
                 : miss ? 'text-neutral-400 line-through'
                 : 'underline decoration-dotted decoration-neutral-400 underline-offset-4 hover:bg-amber-100')
          }>{s.text}</button>
      );
    });

  const get = (l: string) => view.rows.find((r: [string, Seg[]]) => r[0] === l)?.[1];

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col gap-4 overflow-hidden px-8 py-7">
      {hud}

      <div className="flex shrink-0 items-center justify-between">
        <span className="lbl">Message {view.index + 1} / {view.total}</span>
        <span className="mono text-[14px] text-[var(--g)]">
          {view.remaining} {view.remaining === 1 ? 'tell' : 'tells'} remaining
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[var(--line)] bg-white">
        <div className="flex shrink-0 items-center gap-4 border-b border-neutral-200 bg-neutral-100 px-5 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[13px] text-neutral-500">Inbox</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-neutral-200 px-8 pb-5 pt-6">
            <h1 className="text-2xl leading-snug text-neutral-900">
              {get('Subject') && seg(get('Subject')!)}
            </h1>
          </div>

          <div className="flex items-start gap-4 border-b border-neutral-200 px-8 py-5">
            <Avatar brand={view.brand} />
            <div className="min-w-0 flex-1 text-[14px]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-semibold text-neutral-900">{view.brand}</span>
                <span className="shrink-0 text-neutral-500">{get('Date') && seg(get('Date')!)}</span>
              </div>
              <div className="mt-1 text-neutral-600">{get('From') && seg(get('From')!)}</div>
              <div className="mt-0.5 text-neutral-500">to {get('To') && seg(get('To')!)}</div>
              {get('Reply-To') && (
                <div className="mt-0.5 text-neutral-500">reply-to {seg(get('Reply-To')!)}</div>
              )}
            </div>
          </div>

          <div className="space-y-5 px-8 py-7 text-[17px] leading-8 text-neutral-800">
            {view.body.map((p: Seg[], i: number) => <p key={i}>{seg(p)}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
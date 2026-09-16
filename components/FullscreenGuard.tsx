'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { Maximize2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

const fullscreenEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
] as const;

function checkFullscreen() {
  if (typeof document === 'undefined') return false;
  const fullscreenDocument = document as FullscreenDocument;

  return !!(
    fullscreenDocument.fullscreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    fullscreenDocument.mozFullScreenElement ||
    fullscreenDocument.msFullscreenElement
  );
}

function subscribeFullscreenChange(onChange: () => void) {
  if (typeof document === 'undefined') return () => {};

  fullscreenEvents.forEach((eventName) => {
    document.addEventListener(eventName, onChange);
  });

  return () => {
    fullscreenEvents.forEach((eventName) => {
      document.removeEventListener(eventName, onChange);
    });
  };
}

export default function FullscreenGuard({ children }: { children: React.ReactNode }) {
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreenChange,
    checkFullscreen,
    () => false
  );
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const logViolationMutation = trpc.game.logViolation.useMutation();
  const lastViolationRef = useRef<{ type: string; time: number }>({ type: '', time: 0 });
  const hasEnteredOnce = useRef(false);

  // Helper to log violations with a 1.5-second debounce per type
  const reportViolation = useCallback(
    (kind: 'tab_switch' | 'window_blur' | 'fullscreen_exit', detail: string) => {
      const now = Date.now();
      if (
        lastViolationRef.current.type === kind &&
        now - lastViolationRef.current.time < 1500
      ) {
        return; // debounce rapid duplicate triggers
      }
      lastViolationRef.current = { type: kind, time: now };

      logViolationMutation.mutate({ kind, detail });
    },
    [logViolationMutation]
  );

  const requestFullscreen = async () => {
    try {
      const elem = document.documentElement as FullscreenElement;
      const request =
        elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.msRequestFullscreen;

      if (!request) {
        throw new Error('Fullscreen API is not supported in this browser.');
      }

      await request.call(elem);
      hasEnteredOnce.current = true;
      setWarningMsg(null);
    } catch {
      setWarningMsg('Browser blocked fullscreen request. Please allow fullscreen permission.');
    }
  };

  useEffect(() => {
    if (checkFullscreen()) {
      hasEnteredOnce.current = true;
    }

    const handleFullscreenChange = () => {
      const fsNow = checkFullscreen();

      if (!fsNow && hasEnteredOnce.current) {
        reportViolation('fullscreen_exit', 'Exited fullscreen mode');
        setWarningMsg('Fullscreen mode exited! This incident was reported to administrators.');
      } else if (fsNow) {
        hasEnteredOnce.current = true;
        setWarningMsg(null);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('tab_switch', 'Switched browser tab or minimized window');
      }
    };

    const handleWindowBlur = () => {
      reportViolation('window_blur', 'Browser window lost focus');
    };

    fullscreenEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange);
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      fullscreenEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleFullscreenChange);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [reportViolation]);

  return (
    <>
      {/* If not in fullscreen, show blocking overlay */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-2xl border-2 border-emerald-500/50 bg-zinc-950 p-8 text-center shadow-2xl shadow-emerald-950/40">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Maximize2 className="h-8 w-8 animate-pulse" />
            </div>

            <h2 className="font-mono text-2xl font-black tracking-[0.2em] text-zinc-100">
              FULLSCREEN LOCK REQUIRED
            </h2>

            <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-400">
              To ensure competition integrity, <strong className="text-zinc-200">DECODE</strong> must
              run in full screen.
            </p>

            <div className="my-5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-left font-mono text-[11px] leading-relaxed text-amber-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <strong className="text-amber-200">PROCTORING ACTIVE:</strong> Tab switching,
                  minimizing, or leaving fullscreen is logged in real-time on the administrator
                  dashboard.
                </div>
              </div>
            </div>

            {warningMsg && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 font-mono text-xs text-red-400 text-left">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{warningMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={requestFullscreen}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-500/20 py-4 font-mono text-xs font-black tracking-[0.25em] text-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.3)] transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] active:scale-[0.98]"
            >
              <Maximize2 className="h-4 w-4" />
              ENTER FULLSCREEN TO CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={!isFullscreen ? 'pointer-events-none select-none blur-md' : ''}>
        {children}
      </div>
    </>
  );
}

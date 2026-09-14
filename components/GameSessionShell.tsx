"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface GameSessionShellProps {
  children: ReactNode;
}

export default function GameSessionShell({ children }: GameSessionShellProps) {
  const sessionRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === sessionRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    if (!sessionRef.current || document.fullscreenElement) return;
    await sessionRef.current.requestFullscreen();
  };

  return (
    <div ref={sessionRef} className="min-h-screen bg-zinc-950">
      {!isFullscreen && (
        <div className="fixed right-4 top-4 z-40">
          <button
            type="button"
            onClick={enterFullscreen}
            className="rounded-lg border border-cyan-500/50 bg-zinc-900 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-lg hover:bg-zinc-800"
          >
            Enter Fullscreen
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

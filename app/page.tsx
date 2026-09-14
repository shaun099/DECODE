"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 font-sans">
      <h1 className="text-7xl font-bold text-white md:text-9xl">DECODE</h1>
      <button
        type="button"
        onClick={() => router.push("/play")}
        className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400"
      >
        ENTER GAME
      </button>
    </div>
  );
 }
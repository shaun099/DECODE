"use client"
import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { hints } from '@/constants/hint';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <TreasureBox  />
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {hints.map((hint, index) => (
            <FlipCard key={index}
              data={hint}
              onPlay={() => router.push(`/play/game/${hint.game}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

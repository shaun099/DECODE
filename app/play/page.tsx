"use client"
import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { hints } from '@/constants/hint';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function Home() {
  const router = useRouter();
  const openSudoku = useCallback(() => {
    router.push('/play/game/sudoku');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <TreasureBox keys={['Key 1']} />
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({length: 15}).map((_, index) =>(
            <FlipCard key={index}
              data={hints[index]}
              onPlay={index === 0 ? openSudoku : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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
              onPlay={() => {
                const path = `/play/game/${hint.game}`;
                if (hint.game === 'password-finding') {
                  window.open(path, '_blank', 'noopener,noreferrer');
                  return;
                }
                router.push(path);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

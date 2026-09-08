import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { hints } from '@/constants/hint';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <TreasureBox keys={['Key 1']} />
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({length: 15}).map((_, index) =>(
            <FlipCard key={index}
        data={hints[index]}
      />
          ))}
        </div>
      </div>
    </div>
  );
}

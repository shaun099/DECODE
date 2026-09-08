import { FlipCard } from '@/components/animate-ui/components/community/flip-card';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({length: 15}).map((_, index) =>(
            <FlipCard key={index}
        data={{
          name: 'DECODE',
        }}
      />
          ))}
        </div>
      </div>
    </div>
  );
}

import PasswordFindingGame from '@/games/PasswordFinding/PasswordFindingGame';
import GameSessionShell from '@/components/GameSessionShell';

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  if (gameId === 'password-finding') {
    return (
      <GameSessionShell>
        <PasswordFindingGame />
      </GameSessionShell>
    );
  }

  return <div>Game not found</div>;
}
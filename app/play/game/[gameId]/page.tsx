import SudokuGame from '@/games/sudoku/SudokuGame';
import PhishingGame from '@/games/phishing/PhishingGame';
import LockGate from '@/components/LockGate';
import TechQuizGame from '@/games/tech_quiz/TechQuizGame';

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  let game: React.ReactNode;
  if (gameId === 'sudoku') {
    game = <SudokuGame />;
  } else if (gameId === 'phishing') {
    game = <PhishingGame nextClue="The next one shifts every letter along." />;
  } else if (gameId === 'tech_quiz') {
    game = <TechQuizGame />;
  } else {
    game = <div className="p-8 font-mono text-zinc-400">Game not found</div>;
  }

  return <LockGate gameId={gameId}>{game}</LockGate>;
}
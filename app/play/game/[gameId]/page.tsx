import SudokuGame from '@/games/sudoku/SudokuGame';

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  if (gameId === 'sudoku') {
    return <SudokuGame />;
  }

  return <div>Game not found</div>;
}
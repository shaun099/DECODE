import SudokuGame from '@/games/sudoku/SudokuGame';
import PhishingGame from '@/games/phishing/PhishingGame';
import LockGate from '@/components/LockGate';
import TechQuizGame from '@/games/tech_quiz/TechQuizGame';
import SyntaxHuntGame from '@/games/syntax_hunt/SyntaxHuntGame';
import LogicHuntGame from '@/games/logic_hunt/LogicHuntGame';

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
  } else if (gameId === 'syntax_hunt') {
    game = <SyntaxHuntGame nextClue="Your clue here." />;
  }else if (gameId === 'logic_hunt') {
    game = <LogicHuntGame nextClue="Next: fifteen questions and no second chances." />;
  }

  return <LockGate gameId={gameId}>{game}</LockGate>;
}
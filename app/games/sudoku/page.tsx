import SudokuGame from "@/games/sudoku/SudokuGame";

export default function SudokuPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950">
      <SudokuGame />
    </main>
  );
}
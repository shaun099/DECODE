'use client';
import type { ComponentType, ReactNode } from 'react';
import SyntaxGame from './syntax/Game';
import LogicGame from './logicbug/Game';
import PhishingGame from './phishing/Game';
import QuizGame from './quiz/Game';
import SudokuGame from './sudoku/Game';
import CrosswordGame from './crossword/Game';
import SpotGame from './spot/Game';
import PasswordGame from './password/Game';
import LevelDevilGame from './leveldevil/Game';
import BlindcodeGame from './blindcode/Game';
import MazeGame from './maze/Game';
import SpeedTypingGame from './speedtyping/Game';
import DecoyGame from './decoys/Game';
import { DECOY_IDS } from './decoys/ids';

export interface GameProps {
  hud: ReactNode;
  view: any;
  send: (payload: any) => any;
}

const MAP: Record<string, ComponentType<GameProps>> = {
  syntax: SyntaxGame,
  logicbug: LogicGame,
  phishing: PhishingGame,
  quiz: QuizGame,
  sudoku: SudokuGame,
  crossword: CrosswordGame,
  spot: SpotGame,
  password: PasswordGame,
  leveldevil: LevelDevilGame,
  blindcode: BlindcodeGame,
  maze: MazeGame,
  speedtyping: SpeedTypingGame,
};

DECOY_IDS.forEach((id) => { MAP[id] = DecoyGame; });

export const gameFor = (id: string) => MAP[id] ?? null;
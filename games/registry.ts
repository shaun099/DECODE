'use client';
import type { ComponentType, ReactNode } from 'react';
import SyntaxGame from './syntax/Game';
import LogicGame from './logicbug/Game';
import PhishingGame from './phishing/Game';
import QuizGame from './quiz/Game';
import SudokuGame from './sudoku/Game';
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
};

DECOY_IDS.forEach((id) => { MAP[id] = DecoyGame; });

export const gameFor = (id: string) => MAP[id] ?? null;
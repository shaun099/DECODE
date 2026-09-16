export type CardData = ReturnType<typeof JSON.parse>;

export type CardAttemptResult = {
  state: CardData;
  correct: boolean;
  done: boolean;
  [key: string]: CardData;
};

export interface CardModule {
  id: string;
  real: boolean;
  name: string;
  teaser: string;
  rules: string[];
  maxWrong: number;
  key?: { value: string; position: number };
  nextClue?: string;
  init(): CardData;
  view(state: CardData): CardData;
  attempt(state: CardData, payload: CardData): CardAttemptResult | Promise<CardAttemptResult>;
}

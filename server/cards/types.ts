export interface CardModule {
  id: string;
  real: boolean;
  name: string;
  teaser: string;
  rules: string[];
  maxWrong: number;
  key?: { value: string; position: number };
  nextClue?: string;
  init(): any;
  view(state: any): any;
  attempt(state: any, payload: any): { state: any; correct: boolean; done: boolean };
} 
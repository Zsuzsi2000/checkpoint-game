export interface Quiz {
  question: string;
  answers: { answer: string, correct: boolean }[];
  help: string;
}

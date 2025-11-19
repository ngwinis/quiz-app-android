export interface Option {
  label: string; // "A", "B", "C", "D"
  content: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
  correctAnswer: string; // "A", "B", "C", or "D"
  rawType?: string; // "Câu" or "Câu (Ứng dụng)" etc.
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  fileName: string;
}

export enum AppState {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
}
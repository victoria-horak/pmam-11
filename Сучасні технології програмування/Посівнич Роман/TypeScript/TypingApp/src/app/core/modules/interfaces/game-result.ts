import { WordStat } from "./word.stat";

export interface GameResults {
  gameStats: { wpm: number; raw: number; accuracy: number; matchTime: number; xp: number ,mistakes: number;mode: number;
    gameLength: number,
    language: string};
  wordStats: WordStat[];
  wpmTimeline: { second: number; wpm: number }[];
  mistakeTimeline: { second: number; mistakes: number }[];
}
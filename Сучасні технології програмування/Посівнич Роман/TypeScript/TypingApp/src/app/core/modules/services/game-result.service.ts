import { Injectable } from '@angular/core';
import { GameResults } from '../interfaces/game-result';

@Injectable({ providedIn: 'root' })
export class GameResultService {
  private results: GameResults | null = null;

  setResults(r: GameResults): void {
    this.results = r;
  }

  getResults(): GameResults {
    if (!this.results) {
      throw new Error('Відсутні результати гри');
    }
    return this.results;
  }
}
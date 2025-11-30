export interface Mistake {
  position: number;        // глобальний індекс у lettersContainer  
  expected: string;        // правильний символ  
  actual: string;          // що ввів користувач  
  timestamp: number;       // час помилки (опціонально)  
}

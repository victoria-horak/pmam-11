export interface RecordRequset {
    userId: string;
    wpm: number;
    raw: number;
    accuracy: number;
    consistency: number;
    chars: number;
    matchTime: number;
    experience: number;
    mode: number; 
    gameLength: number; 
    language: string; 
}
export interface RecordResponse {
    userId: string;
    wpm: number;
    raw: number;
    accuracy: number;
    consistency: number;
    chars: number;
    matchTime: number;
    dateRecord: string;
    mode: number;        
    gameLength: number; 
    language: string;
}
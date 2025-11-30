export interface LessonProgressResponse {
  id: number;
  userId: string;
  lessonId: number;
  bestWpm: number;
  bestRaw: number;
  bestAccuracy: number;
  progressPercent: number;
  lastUpdated: string;
}
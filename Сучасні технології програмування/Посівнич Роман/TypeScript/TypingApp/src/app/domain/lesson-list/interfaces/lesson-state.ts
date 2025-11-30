import { Lesson } from '../../../core/modules/interfaces/lesson';
import { LessonProgressResponse } from '../../../core/modules/interfaces/lesson-progress-response';

export interface LessonWithState extends Lesson {
  isCompleted: boolean;
  isUnlocked: boolean;
  progressData?: LessonProgressResponse | null;
}
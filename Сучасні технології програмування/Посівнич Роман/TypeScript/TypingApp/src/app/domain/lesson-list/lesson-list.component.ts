// src/app/domain/lesson-list/lesson-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Lesson } from '../../core/modules/interfaces/lesson';
import { LessonService } from '../../core/modules/services/lesson.service';
import { ProgressService } from '../../core/modules/services/progress.service';
import { AuthService } from '../../core/modules/services/auth.service';
import { LessonProgressResponse } from '../../core/modules/interfaces/lesson-progress-response';
import { LessonWithState } from './interfaces/lesson-state';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css'],
  imports: [CommonModule, RouterModule],
})
export class LessonListComponent implements OnInit {
  lessons: LessonWithState[] = [];
  currentLanguage: 'uk' | 'en' = 'uk';

  constructor(
    private lessonService: LessonService,
    private progressService: ProgressService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    const userId = this.authService.getUserDetail().id;

    this.loadLessons();
  }
  loadLessons(): void {
    const userId = this.authService.getUserDetail().id;

    this.lessonService.getLessonsByLanguage(this.currentLanguage).subscribe(lessons => {
      this.progressService.getProgress(userId).subscribe({
        next: (progress) => {
          this.processLessonsWithProgress(lessons, progress);
        },
        error: () => {
          this.processLessonsWithProgress(lessons, {
            success: true,
            result: [],
          });
        },
      });
    });
  }

  private processLessonsWithProgress(
    lessons: Lesson[],
    progress: any
  ): void {
    const progressArray = progress.success ? progress.result : [];
    const progMap = new Map<number, LessonProgressResponse>();
    progressArray.forEach((p: LessonProgressResponse) =>
      progMap.set(p.lessonId, p)
    );

    const sorted = lessons.slice().sort((a, b) => a.id - b.id);

    const lessonsWithState = sorted.map((lesson, idx) => {
      const progressData = progMap.get(lesson.id);
      const isCompleted = progressData
        ? progressData.progressPercent >= 80
        : false;

      let isUnlocked = false;
      if (idx === 0) {
        isUnlocked = true;
      } else {
        const prevLesson = sorted[idx - 1];
        const prevProgress = progMap.get(prevLesson.id);
        isUnlocked = prevProgress
          ? prevProgress.progressPercent >= 80
          : false;
      }

      return {
        ...lesson,
        isCompleted,
        isUnlocked,
        progressData: progressData || null,
      } as LessonWithState;
    });

    this.lessons = lessonsWithState;
  }
  selectLanguage(lang: 'uk' | 'en'): void {
    this.currentLanguage = lang;
    this.loadLessons();
  }
onLanguageChange(lang: 'uk' | 'en') {
  if (this.currentLanguage !== lang) {
    this.currentLanguage = lang;
    this.loadLessons();
  }
}
}

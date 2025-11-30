import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Lesson } from '../interfaces/lesson';
import { LESSONS } from '../../utils/lessons.data';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private lessons: Lesson[] = LESSONS;
  
  getLessonsByLanguage(lang: 'uk' | 'en'): Observable<Lesson[]> {
    const lessons = this.lessons.filter(lesson => lesson.language === lang);
    return of(lessons);
  }
  getLessonByIdAndLanguage(id: number, lang: 'uk' | 'en'): Lesson | undefined {
    return this.lessons.find(lesson => lesson.id === id && lesson.language === lang);
  }
}
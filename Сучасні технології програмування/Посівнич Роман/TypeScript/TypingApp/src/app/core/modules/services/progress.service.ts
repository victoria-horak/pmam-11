import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { LessonProgress } from '../interfaces/lesson-progress';
import { ExecutionResponse } from '../interfaces/execution-response';
import { LessonProgressResponse } from '../interfaces/lesson-progress-response';

@Injectable({ providedIn: 'root' })
export class ProgressService {
    private api = `${environment.apiUrl}Progress`;
    constructor(private http: HttpClient) { }

    getProgressByLessonId(userId: string, lessonId: number)
        : Observable<ExecutionResponse<LessonProgressResponse>> {
        return this.http.get<ExecutionResponse<LessonProgressResponse>>(
            `${this.api}/read/${userId}/${lessonId}`
        );
    }
    // ProgressService: повертає масив прогресу всіх уроків
    getProgress(userId: string)
        : Observable<ExecutionResponse<LessonProgressResponse[]>> {
        return this.http.get<ExecutionResponse<LessonProgressResponse[]>>(
            `${this.api}/read/${userId}`
        );
    }


    saveProgress(data: LessonProgress)
        : Observable<ExecutionResponse<LessonProgress>> {
        return this.http.post<ExecutionResponse<LessonProgress>>(
            `${this.api}/write`, data
        );
    }
}

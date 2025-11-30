// src/app/domain/result/result.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { GameResultService } from '../../core/modules/services/game-result.service';
import { LessonService } from '../../core/modules/services/lesson.service';
import { Lesson } from '../../core/modules/interfaces/lesson';
import { WordStat } from '../../core/modules/interfaces/word.stat';
import { UKR_TO_LAT } from '../../core/utils/ukr-to-lat-keymap';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
})
export class ResultComponent implements OnInit {
  gameStats!: {
    wpm: number;
    raw: number;
    accuracy: number;
    mistakes: number;
    matchTime: number;
    xp: number;
    mode: number;
    gameLength: number;
    language: string;
  };
  wpmTimeline: { second: number; wpm: number }[] = [];
  mistakeTimeline: { second: number; mistakes: number }[] = [];
  wordStats: WordStat[] = [];

  mistakeLetters: string[] = [];
  lessonsForMistakes: Lesson[] = [];
  generatedLesson!: Lesson;

  wpmChartData!: ChartConfiguration<'line'>['data'];
  wpmChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Секунди' } },
      y: { title: { display: true, text: 'WPM' }, beginAtZero: true },
    },
  };

  mistakeChartData!: ChartConfiguration<'bar'>['data'];
  mistakeChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Секунди' } },
      y: {
        title: { display: true, text: 'Кількість помилок' },
        beginAtZero: true,
      },
    },
  };

  constructor(
    private gameResult: GameResultService,
    private lessonService: LessonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const res = this.gameResult.getResults();
    this.gameStats = res.gameStats;
    this.wpmTimeline = res.wpmTimeline || [];
    this.mistakeTimeline = res.mistakeTimeline || [];
    this.wordStats = res.wordStats || [];

    this.buildWpmChart();
    this.buildMistakeChart();
    this.extractMistakeLetters();
    this.matchLessons();
    this.buildGeneratedLesson();
  }

  private buildWpmChart() {
    const labels = this.wpmTimeline.map((p) => p.second.toString());
    const data = this.wpmTimeline.map((p) => Math.round(p.wpm));
    this.wpmChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'WPM по секундах',
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66,165,245,0.3)',
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }

  private buildMistakeChart() {
    const labels = this.mistakeTimeline.map((p) => p.second.toString());
    const data = this.mistakeTimeline.map((p) => p.mistakes);
    this.mistakeChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Помилки по секундах',
          backgroundColor: 'rgba(245,50,50,0.6)',
        },
      ],
    };
  }

  getChars(w: WordStat): string[] {
    return w.typed.split('');
  }

  private extractMistakeLetters(): void {
    const rawMistakes = this.wordStats
      .filter(w => w.mistakes > 0)
      .flatMap(w =>
        w.word
          .split('')
          .map((correctChar, i) => ({
            correctChar: correctChar.toLowerCase(),
            typedChar: (w.typed[i] || '').toLowerCase()
          }))
          .filter(pair => pair.correctChar !== pair.typedChar)
          .map(pair => pair.correctChar)
      );

    if (this.gameStats.language === 'uk') {
      this.mistakeLetters = Array.from(new Set(rawMistakes));
    } else {
      this.mistakeLetters = Array.from(new Set(rawMistakes));
    }
  }

  private matchLessons(): void {
    this.lessonService.getLessonsByLanguage(this.gameStats.language as 'uk' | 'en').subscribe(all => {
      this.lessonsForMistakes = all.filter(lesson =>
        lesson.keys.some(k => this.mistakeLetters.includes(k.toLowerCase()))
      );
    });
  }

  private buildGeneratedLesson(): void {
    const letters = this.mistakeLetters.join(', ');
    this.generatedLesson = {
      id: 0,
      keys: this.mistakeLetters,
      title: this.gameStats.language === 'uk'
        ? `Практика помилкових букв: ${letters}`
        : `Practice mistake letters: ${letters}`,
      description: this.gameStats.language === 'uk'
        ? `Повторіть букви: ${letters}`
        : `Practice letters: ${letters}`,
      language: this.gameStats.language as 'uk' | 'en',
    };
  }

  startGeneratedLesson(): void {
    this.router.navigate(['/lesson', 'practice', this.gameStats.language], {
      state: { lesson: this.generatedLesson },
    });
  }

  goToLesson(id: number): void {
    this.router.navigate(['/lesson', id, this.gameStats.language]);
  }
}

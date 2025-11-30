import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { letterView } from '../../letterView';
import { AuthService } from '../../core/modules/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../core/modules/services/lesson.service';
import { Lesson } from '../../core/modules/interfaces/lesson';
import { ProgressService } from '../../core/modules/services/progress.service';
import { LessonProgress } from '../../core/modules/interfaces/lesson-progress';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-lesson',
  standalone: false,
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  lesson?: Lesson;
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('lessonContainer', { static: true }) lessonElement!: ElementRef;
  timer: any = null;
  gameStart: any = null;
  pauseTime = 0;
  numberOfMistake: number[] = [];
  lettersContainer: letterView[] = [];
  currentPosition: number = 0;
  interval: any;
  minutes: number = 0;
  seconds: number = 0;
  numberOfWords: number = 150;
  wordsCounter: number = 0;
  lastIndex: number = 0;
  isGameActive: boolean = false;
  elapsedTime: number = 0;
  currentExpectedLetter: string = '';
  PASS_THRESHOLD = 50;


  constructor(private authService: AuthService, private route: ActivatedRoute,
    private lessonService: LessonService,
    private progressService: ProgressService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const lang = this.route.snapshot.paramMap.get('lang') as 'uk' | 'en';

    if (!id || (lang !== 'uk' && lang !== 'en')) {
      console.error('Invalid route parameters');
      return;
    }

    const lesson = this.lessonService.getLessonByIdAndLanguage(id,lang);
    if (lesson) {
      this.lesson = lesson;
      this.newGame();
    } else {
      console.error('Lesson not found');
    }
  }

  generateLessonText(keys: string[], groupCount: number = 60): letterView[] {
    const result: letterView[] = [];
    let index = 0;

    for (let i = 0; i < groupCount; i++) {
      const groupLength = Math.floor(Math.random() * 3) + 2; // 2–4 символи в групі
      for (let j = 0; j < groupLength; j++) {
        const char = keys[Math.floor(Math.random() * keys.length)];
        result.push(new letterView(index++, char));
      }
      result.push(new letterView(index++, ' ')); // пробіл між групами
    }

    return result;
  }
  fillingVariables(): void {
    this.lessonElement.nativeElement.classList.remove('over');
    this.numberOfMistake = [];
    this.lettersContainer = [];
    this.currentPosition = 0;
    this.wordsCounter = 0;
    clearInterval(this.interval);
    this.isGameActive = false;
    this.pauseTime = 0;
  }

  newGame(): void {
    this.fillingVariables();

    this.lessonElement.nativeElement.blur();

    const letters = this.generateLessonText(this.lesson!.keys, 10); // 60 груп = 60 слів
    console.log('Lesson keys:', this.lesson?.keys);
    console.log('Generated letters:', letters);
    this.lettersContainer = letters;
    this.lastIndex = letters.length - 1;

    this.updateCursorPosition();
  }
  startGameTimer(): void {
    if (!this.isGameActive) {
      this.isGameActive = true;
      this.gameStart = Date.now() - this.pauseTime;
      this.startTimer();
    }
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.isGameActive) {
        this.elapsedTime = Date.now() - this.gameStart;
        this.updateTimerDisplay(this.elapsedTime);
      }
    }, 1000);
  }
  updateTimerDisplay(time: number): void {
    this.minutes = Math.floor(time / 60000);
    this.seconds = Math.floor((time % 60000) / 1000);
  }
  gameOver(): void {
    clearInterval(this.timer);
    this.isGameActive = false;
    this.timer = null;
    const elapsedTime = this.gameStart ? (Date.now() - this.gameStart) : 0;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);

    const wpm = Math.floor((this.currentPosition / 5) / (elapsedTime / 60000));
    const raw = Math.floor(this.currentPosition);
    const accuracy = Math.floor(((this.currentPosition - this.numberOfMistake.length) / this.currentPosition) * 100);
    const consistency = 100;

    console.log(`Game Over! Time: ${elapsedSeconds} seconds, Mistakes: ${this.numberOfMistake.length}, WPM: ${wpm}, raw${raw} ,accuracy ${accuracy} ,consistency ${consistency}`);
    if (this.authService.getUserDetail() !== null && this.currentPosition >= 5) {
      const model: LessonProgress = {
        userId: this.authService.getUserDetail().id,
        lessonId: this.lesson!.id,
        bestWpm: wpm,
        bestRaw: raw,
        bestAccuracy: accuracy
      };
      this.progressService.saveProgress(model)
        .pipe(
          // після успішного POST, робимо GET поточного прогресу
          switchMap(() =>
            this.progressService.getProgressByLessonId(model.userId, model.lessonId)
          )
        )
        .subscribe({
          next: res => {
            if (res.success && res.result.progressPercent >= this.PASS_THRESHOLD) {
              // пройшов – переходимо на наступний урок
              const nextId = this.lesson!.id + 1;
              this.router.navigate(['/lesson', nextId]);
            } else {
              // не дотягнув – пропонуємо зіграти ще раз
              alert(
                `Вам потрібно не менше ${this.PASS_THRESHOLD}% точності, щоб перейти далі. ` +
                `Ваш результат: ${res.result.progressPercent}%`
              );
              this.newGame();
            }
          },
          error: err => {
            console.error('Progress load failed', err);
            // навіть якщо GET провалився, даємо перезапустити урок
            this.newGame();
          }
        });
    }


    const gameElement = document.getElementById('game');
    if (gameElement) {
      gameElement.classList.add('over');
    }
    this.newGame();
  }

  pauseTimer(): void {
    if (this.isGameActive) {
      this.isGameActive = false;
      clearInterval(this.interval);
      this.pauseTime += Date.now() - this.gameStart;
    }
  }


  startWordsModeTimer(): void {
    this.interval = setInterval(() => {
      const elapsedTime = Date.now() - this.gameStart - this.pauseTime;
    }, 1000);
  }

  isCurrent(index: number): boolean {
    return this.currentPosition === index;
  }

  isCorrektLetter(char: string): boolean {
    if (this.isCurrent(this.lettersContainer[this.currentPosition].index)) {
      if (this.lettersContainer[this.currentPosition].letter === char) {
        return true;
      }
    }
    return false;
  }

  increasePocition(key: string) {
    console.log(key, this.currentPosition, this.lastIndex);
    if (this.isCorrektLetter(key)) {
      this.lettersContainer[this.currentPosition].isCorrect = true;
      this.currentPosition++;
    } else {
      if (!this.numberOfMistake.includes(this.currentPosition)) {
        this.numberOfMistake.push(this.currentPosition);
      }
      this.lettersContainer[this.currentPosition].isMistake = true;
      this.currentPosition++;
    }
    this.updateCursorPosition();
    this.highlightExpectedKey(this.lettersContainer[this.currentPosition]?.letter);
    if (this.isLastLetter()) this.gameOver();
  }

  decreasePocition(): void {
    if (this.currentPosition > 0) {
      this.currentPosition--;
      this.lettersContainer[this.currentPosition].isCorrect = false;
      this.lettersContainer[this.currentPosition].isMistake = false;

      // Remove this position from numberOfMistake if it exists
      const mistakeIndex = this.numberOfMistake.indexOf(this.currentPosition);
      if (mistakeIndex > -1) {
        this.numberOfMistake.splice(mistakeIndex, 1);
      }

      this.updateCursorPosition();
      this.highlightExpectedKey(this.lettersContainer[this.currentPosition]?.letter);

    }

  }

  spacePosition(): void {
    if (this.isCorrektLetter(' ')) {
      this.lettersContainer[this.currentPosition].isCorrect = true;
      this.wordsCounter++;
      this.currentPosition++
    } else {
      if (!this.numberOfMistake.includes(this.currentPosition)) {
        this.numberOfMistake.push(this.currentPosition);
      }
      this.lettersContainer[this.currentPosition].isMistake = true
      this.currentPosition++;
    }
    this.updateCursorPosition();
    this.highlightExpectedKey(this.lettersContainer[this.currentPosition]?.letter);
  }

  getStyles(letter: letterView) {
    return this.isCurrent(letter.index) ? 'letter current' : letter.isCorrect ? 'letter correct' : letter.isMistake ?
      'letter incorrect' : 'letter';
  }

  focusGame() {
    if (!this.isGameActive) {
      this.gameStart = Date.now();
      this.isGameActive = true;
      this.startTimer();
    }
    this.lessonElement.nativeElement.focus();

  }

  updateCursorPosition() {
    setTimeout(() => {
      const letterElements = document.getElementsByClassName('letter');
      if (letterElements.length > this.currentPosition) {
        const currentLetterElement = letterElements[this.currentPosition] as HTMLElement;
        const cursorElement = this.cursor.nativeElement;
        const parentRect = this.lessonElement.nativeElement.getBoundingClientRect();
        const rect = currentLetterElement.getBoundingClientRect();

        const top = rect.top - parentRect.top;
        const left = rect.left - parentRect.left;

        cursorElement.style.top = `${top}px`;
        cursorElement.style.left = `${left}px`;
      } else {
        console.log('Current letter element not found');
      }
    }, 0);
  }


  isLastLetter(): boolean {
    return this.currentPosition === this.lastIndex;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  highlightExpectedKey(letter: string) {
    const prev = document.querySelector('.key.expected');
    if (prev) prev.classList.remove('expected');

    let keyId = letter.toLowerCase();
    if (letter === ' ') {
      keyId = 'space';
    }

    const keyElement = document.getElementById(keyId);
    if (keyElement) keyElement.classList.add('expected');
  }


}
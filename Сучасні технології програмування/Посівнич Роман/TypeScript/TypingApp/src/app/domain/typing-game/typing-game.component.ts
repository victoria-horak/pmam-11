import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { letterView } from '../../letterView'
import { AuthService } from '../../core/modules/services/auth.service';
import { RecordService } from '../../core/modules/services/record.service';
import { RecordRequset } from '../../core/modules/interfaces/record-resquest';
import { WordStat } from '../../core/modules/interfaces/word.stat';
import { Router } from '@angular/router';
import { GameResultService } from '../../core/modules/services/game-result.service';
import { GameResults } from '../../core/modules/interfaces/game-result';
import { Mistake } from '../../core/modules/interfaces/mistake';
import { cell } from '@observablehq/plot';


@Component({
  selector: 'app-typing-game',
  templateUrl: './typing-game.component.html',
  styleUrl: './typing-game.component.css',
  standalone: false
})
export class TypingGameComponent {
  availableLanguages = ['en', 'uk'];
  selectedLanguage: 'en' | 'uk' = 'en';
  wordsEn = 'in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house become both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late line would first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also'.split(' '); wordsCount = this.wordsEn.length;
  wordsUk = `швидкий коричневий лис скаче через ледачого пса під дубом трава шепоче вітер небо безхмарне гарний день тренування текст точність швидкість українські символи комфорт інструмент вдосконалюватисьліс річка озеро гора степ поле сонце місяць зірка небо вода земля повітря вогонь рука нога око вухо ніс рот серце голова плече спина груди пальці стіл стілець книга ручка зошит дошка вчитель учень школа університет бібліотека музей театр кіно робота гроші час день ніч тиждень місяць рік сезон весна літо осінь зима ранок вечір пізно рано швидко повільно добре погано цікаво весело сумно гамір шум тиша музика пісня мелодія ритм слова мовлення письмо читання думка ідея людина друг сім’я друг другий перший останній середній високий низький великий малий довгий короткий широкий вузький світ простір час життя смерть ріст падіння зліт успіх невдача надія любов ненависть радість смуток страх відвага сила слабкість відкриття таємниця правда брехня питання відповідь дорога шлях місто село будинок квартира кімната вулиця дорога поле ліс парк сад город ферма завод машин комп’ютер телефон інтернет зв’язок електрика вода газ хліб овоч фрукт масло сіль перець цукор чай кава молоко сир яйце м’ясо риба булка пиріг торт печиво цукерка шоколад мед варення салат суп борщ котлета яблуко банан апельсин груша виноград персик лимон огірок помідор морква буряк картопля капуста шпинат гарбуз кабачок баклажан зелень цибуля часник перець базилік петрушка кріп селера кефір йогурт сметана вершки тісто мука дріжджі горіх зерно рис пшениця кукурудза овес ячмінь сочевиця горох боб квасоля яловичина свинина курка індичка качка гуска крило ніжка стегно шия тулуб стопа палець мозок легені печінка нирка сеча кров імунітет клітина тканина орган система природа космос галактика всесвіт планета марс юпітер сатурн венера меркурій уран нептун супутник астероїд комета зоря неон чіп код програма система транспорт автобус потяг літак корабель автомобіль велосипед мотоцикл скутер човен пароплав вантажівка трамвай тролейбус метро станція рейс квиток багаж порт швидкість прискорення гальмо двигун бензин дизель електро батарея зарядка адаптер дріт кабель розетка роз’єм світло лампа ліхтар дим димар труба стіна дах підлога стеля кахель плитка дерево пластик метал скло камінь бетон цемент фарба лак шпаклівка молоток пилка викрутка гайка болт гвинт дрель шуруп ланцюг ремінь шестерня колесо кузов салон кермо педаль сидіння дзеркало фара габарит сигнал сирена мигалка поліція швидка пожежна карета`.trim().split(' '); 
  words: string[] = [];
  @ViewChild('cursor') cursor!: ElementRef;
  @ViewChild('game', { static: true }) gameElement!: ElementRef;
  gameTime = 30 * 1000;
  timer: any = null;
  gameStart: any = null;
  pauseTime = 0;
  mistakes: Mistake[] = [];
  lettersContainer: letterView[] = [];
  currentPosition: number = 0;
  interval: any;
  minutes: number = 0;
  seconds: number = 0;
  selectedMode: string = 'time';
  numberOfWords: number = 150;
  wordsCounter: number = 0;
  lastIndex: number = 0;
  isGameActive: boolean = false;
  elapsedTime: number = 0;

  wordStats: WordStat[] = [];
  currentWordStartTime: number = 0;


  wpmTimeline: { second: number; wpm: number }[] = [];
  elapsedSeconds: number = 0;
  charsTypedAtSecondStart: number = 0;
  mistakeTimeline: { second: number; mistakes: number }[] = [];
  wpmInterval: any;
  mistakesCountAtSecondStart = 0;

  constructor(private authService: AuthService, private recordService: RecordService, private router: Router, private gameResultService: GameResultService) { }

  ngOnInit(): void {
    this.newGame();
  }

  randomWord(): string {
    if (this.words.length === 0) {
      console.warn('Word list is empty. Cannot generate random word.');
      return ''; // Or throw an error, depending on desired behavior
    }
    const randomIndex = Math.floor(Math.random() * this.words.length); // Use this.words.length
    return this.words[randomIndex]; // Use this.words
  }
  fillingVariables(): void {
    this.gameElement.nativeElement.classList.remove('over');
    this.mistakes = [];
    this.lettersContainer = [];
    this.currentPosition = 0;
    this.wordsCounter = 0;
    clearInterval(this.interval);
    this.isGameActive = false;
    this.pauseTime = 0;
    this.wordStats = [];
    this.currentWordStartTime = Date.now();
    this.elapsedSeconds = 0;
    this.wpmTimeline = [];
    this.mistakeTimeline = [];
    this.charsTypedAtSecondStart = 0;
    clearInterval(this.wpmInterval);
    this.elapsedSeconds = 0;
    this.charsTypedAtSecondStart = 0;
    this.mistakesCountAtSecondStart = 0;
    this.mistakeTimeline = [];

  }

  newGame(): void {
    this.fillingVariables();

    if (this.selectedMode === 'time') {
      this.numberOfWords = 150;
    } else if (this.selectedMode === 'words') {
      this.startWordsModeTimer();
    }
    this.loadWordsByLanguage();
    this.gameElement.nativeElement.blur();

    let a: string[] = [];
    for (let i = 0; i < this.numberOfWords; i++) {
      a.push(this.randomWord());
      a.push(' ');
    }
    let index: number = 0;
    a.forEach((word) => {
      word.split('').forEach((letter) => {
        this.lettersContainer.push(new letterView(index, letter));
        index++;
      });
    })

    this.lastIndex = index - 1;
    this.updateCursorPosition();
  }
  private loadWordsByLanguage(): void {
    if (this.selectedLanguage === 'en') {
      this.words = [...this.wordsEn];
    } else {
      this.words = [...this.wordsUk];
    }
    this.wordsCount = this.words.length;
  }
  onLanguageChange(): void {
    this.loadWordsByLanguage();
    this.newGame();
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

        if (this.selectedMode === 'time') {
          const remainingTime = this.gameTime - this.elapsedTime;
          if (remainingTime <= 0) {
            this.gameOver();
          } else {
            this.updateTimerDisplay(remainingTime);
          }
        } else {
          this.updateTimerDisplay(this.elapsedTime);
        }
      }
    }, 1000);

    this.wpmInterval = setInterval(() => {
      if (!this.isGameActive) return;
      const seconds = Math.floor((Date.now() - this.gameStart) / 1000);
      // WPM за секунду
      const charsNow = this.currentPosition;
      const charsTypedThisSecond = charsNow - this.charsTypedAtSecondStart;
      this.charsTypedAtSecondStart = charsNow;
      const wpm = (charsTypedThisSecond / 5) * 60;
      this.wpmTimeline.push({ second: seconds, wpm });

      // ПОМИЛКИ за секунду
      const totalMistakesNow = this.mistakes.length;
      const mistakesThisSecond = totalMistakesNow - this.mistakesCountAtSecondStart;
      this.mistakesCountAtSecondStart = totalMistakesNow;
      this.mistakeTimeline.push({ second: seconds, mistakes: mistakesThisSecond });
    }, 1000);
  }


  gameOver(): void {
    clearInterval(this.timer);
    this.isGameActive = false;
    this.timer = null;
    const elapsedTime = this.gameStart ? (Date.now() - this.gameStart) : 0;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);

    const wpm = Math.floor((this.currentPosition / 5) / (elapsedTime / 60000));
    const raw = Math.floor(this.currentPosition);
    const accuracy = Math.floor(((this.currentPosition - this.mistakes.length) / this.currentPosition) * 100);
    const consistency = 100;

    let multiplier = 1.0;
    if (this.gameTime >= 60000 || this.numberOfWords >= 50) multiplier = 1.2;
    if (this.numberOfWords >= 125 || this.gameTime >= 90000) multiplier = 1.5;

    const xp = Math.round((wpm * accuracy * multiplier) / 100);
    const modeEnumValue = this.selectedMode === 'time' ? 0 : 1;
    const gameLengthValue = this.selectedMode === 'time' ? this.gameTime : this.numberOfWords;

    console.log(`Game Over! Time: ${elapsedSeconds} seconds, Mistakes: ${this.mistakes.length}, WPM: ${wpm}, raw${raw} ,accuracy ${accuracy} ,consistency ${consistency}`);
    if (this.authService.getUserDetail() !== null && this.currentPosition >= 5) {
      const recordRequest: RecordRequset = {
        userId: this.authService.getUserDetail()?.id,
        wpm: wpm,
        raw: raw,
        accuracy: accuracy,
        consistency: consistency,
        chars: this.currentPosition,
        matchTime: elapsedSeconds,
        experience: xp,
        mode: modeEnumValue,
        gameLength: gameLengthValue,
        language: this.selectedLanguage
      };
      this.recordService.write(recordRequest).subscribe(
        response => {
          console.log('Record successfully saved', response);
        },
        error => {
          console.error('Error saving record', error);
        })
    }
    const gameElement = document.getElementById('game');
    if (gameElement) {
      gameElement.classList.add('over');
    }

    const results: GameResults = {
      gameStats: {
        wpm,
        raw,
        accuracy,
        matchTime: elapsedSeconds,
        xp,
        mistakes: this.mistakes.length,
        mode: modeEnumValue,
        gameLength: gameLengthValue,
        language: this.selectedLanguage
      },
      wordStats: this.wordStats,
      wpmTimeline: this.wpmTimeline,
      mistakeTimeline: this.mistakeTimeline
    };
    this.gameResultService.setResults(results);
    this.router.navigate(['/result']);

    // this.newGame();
  }

  pauseTimer(): void {
    if (this.isGameActive) {
      this.isGameActive = false;
      clearInterval(this.interval);
      clearInterval(this.wpmInterval);
      this.pauseTime += Date.now() - this.gameStart;
    }
  }

  updateTimerDisplay(time: number): void {
    this.minutes = Math.floor(time / 60000);
    this.seconds = Math.floor((time % 60000) / 1000);
  }

  startWordsModeTimer(): void {
    this.interval = setInterval(() => {
      const elapsedTime = Date.now() - this.gameStart - this.pauseTime;
      this.updateTimerDisplay(elapsedTime);
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
    const cell = this.lettersContainer[this.currentPosition];
    cell.typed = key;
    if (cell.letter === key) {
      cell.isCorrect = true;
    } else {
      cell.isMistake = true;
      this.mistakes.push({ position: cell.index, expected: cell.letter, actual: key, timestamp: Date.now() });
    }
    this.currentPosition++;
    this.updateCursorPosition();
    if (this.isLastLetter() && this.selectedMode === 'words') this.gameOver();
  }


  decreasePocition(): void {
    if (this.currentPosition > 0) {
      this.currentPosition--;
      const cell = this.lettersContainer[this.currentPosition];

      cell.isCorrect = false;
      cell.isMistake = false;
      if ('typed' in cell) {
        (cell as any).typed = '';
      }

      const idx = this.mistakes.findIndex(m => m.position === cell.index);
      if (idx > -1) {
        this.mistakes.splice(idx, 1);
      }

      this.updateCursorPosition();
    }
  }


  spacePosition(): void {
    const pos = this.currentPosition;
    const cell = this.lettersContainer[pos];
    const expected = cell.letter;
    const isSpaceExpected = expected === ' ';
    const hasTypedLetters = this.hasTypedLettersForCurrentWord();

    cell.typed = ' ';

    if (!isSpaceExpected) {
      cell.isMistake = true;
      if (!this.mistakes.find(m => m.position === pos)) {
        this.mistakes.push({ position: pos, expected, actual: ' ', timestamp: Date.now() });
      }
      this.currentPosition++;
      this.updateCursorPosition();
      return;
    }

    if (hasTypedLetters) {
      const now = Date.now();
      const typedWord = this.getTypedWord();
      const correctWord = this.getCorrectWord();
      const mistakesCnt = this.countMistakes(typedWord, correctWord);
      const duration = now - this.currentWordStartTime;
      const durationMin = duration / 60000;
      const wpm = durationMin > 0
        ? Math.round(1 / durationMin)
        : 0;

      this.wordStats.push({
        word: correctWord,
        typed: typedWord,
        durationMs: duration,
        mistakes: mistakesCnt,
        wpm
      });

      this.currentWordStartTime = now;
    }


    cell.isCorrect = true;
    this.wordsCounter++;
    this.currentPosition++;
    this.updateCursorPosition();

    if (this.isLastLetter() && this.selectedMode === 'words') {
      this.gameOver();
    }
  }

  hasTypedLettersForCurrentWord(): boolean {
    const wordLetters = this.lettersContainer
      .slice(this.getCurrentWordStartIndex(), this.currentPosition)
      .filter(l => l.letter !== ' '); // ігнорувати пробіли
    return wordLetters.some(l => l.isCorrect || l.isMistake);
  }
  getTypedWord(): string {
    const start = this.getCurrentWordStartIndex();
    return this.lettersContainer
      .slice(start, this.currentPosition)
      .map(l => l.typed)
      .join('');
  }


  getCorrectWord(): string {
    const start = this.getCurrentWordStartIndex();
    return this.lettersContainer
      .slice(start, this.currentPosition)
      .map(l => l.letter)
      .join('');
  }

  getCurrentWordStartIndex(): number {
    let index = this.currentPosition;
    while (index > 0 && this.lettersContainer[index - 1].letter !== ' ') {
      index--;
    }
    return index;
  }


  countMistakes(typed: string, correct: string): number {
    let count = 0;
    const max = Math.max(typed.length, correct.length);
    for (let i = 0; i < max; i++) {
      if (typed[i] !== correct[i]) count++;
    }
    return count;
  }



  getStyles(letter: letterView) {
    return this.isCurrent(letter.index) ? 'letter current' : letter.isCorrect ? 'letter correct' : letter.isMistake ?
      'letter incorrect' : 'letter';
  }

  focusGame() {
    if (!this.isGameActive) {
      this.gameStart = Date.now() - this.pauseTime;
      this.isGameActive = true;
      this.startTimer();
    }
    this.gameElement.nativeElement.focus();
  }

  updateCursorPosition() {
    setTimeout(() => {
      const letterElements = document.getElementsByClassName('letter');
      if (letterElements.length > this.currentPosition) {
        const currentLetterElement = letterElements[this.currentPosition] as HTMLElement;
        const cursorElement = this.cursor.nativeElement;
        const rect = currentLetterElement.getBoundingClientRect();
        cursorElement.style.top = `${rect.top}px`;
        cursorElement.style.left = `${rect.left}px`;
      } else {
        console.log('Current letter element not found');
      }
    }, 0);
  }


  selectMode(mode: string): void {
    this.selectedMode = mode;
    this.newGame()
  }

  selectWords(words: number): void {
    this.numberOfWords = words;
    this.newGame();
  }

  selectTime(time: number): void {
    this.gameTime = time * 1000;
    this.newGame()
  }
  selectLanguage(lang: 'en' | 'uk'): void {
    this.selectedLanguage = lang;
    this.newGame();
  }

  isLastLetter(): boolean {
    return this.currentPosition === this.lastIndex;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }


}

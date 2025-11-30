export class letterView {
    index: number;
    typed: string = '';
    letter: string;
    isMistake: boolean = false;
    isCorrect: boolean = false;

    constructor(index: number, letter: string) {
        this.index = index;
        this.letter = letter;
    }
}  
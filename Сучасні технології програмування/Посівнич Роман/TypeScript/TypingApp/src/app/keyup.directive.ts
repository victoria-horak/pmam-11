import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appKeyup]',
  standalone: false
})
export class KeyupDirective {
  @Output() actionAllowKey = new EventEmitter<string>();
  @Output() actionSpace = new EventEmitter<string>();
  @Output() actionBackspace = new EventEmitter<string>();
  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.isAllowKey(event.key)) {
      this.actionAllowKey.emit(event.key);
    }
    else if (this.isSpace(event.key)) {
      this.actionSpace.emit()
    }
    else if (this.isBackspace(event.key)) {
      this.actionBackspace.emit()
    }
  }

  private isAllowKey(key: string): boolean {
    return key.length === 1 && /^[a-zа-яєіїґ;,\./]$/i.test(key);
  }

  private isBackspace(key: string): boolean {
    return key === 'Backspace';
  }

  private isSpace(key: string): boolean {
    return key === ' ';
  }
}
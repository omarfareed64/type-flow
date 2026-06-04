import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TypingEngineService } from '../../../core/services/typing-engine.service';

@Component({
  selector: 'app-typing-display',
  standalone: true,
  template: `
    <div
      class="typing-display"
      (click)="focusInput()"
      [class.typing-display--blind]="blindMode"
    >
      <div class="typing-display__text" aria-hidden="true">
        @if (displayStart > 0) {
          <span class="typing-display__context">...</span>
        }
        @for (char of displayChars; track char.index) {
          <span [class]="char.className" [class.char--error-flash]="flashIndex === char.index">{{
            char.value
          }}</span>
        }
        @if (displayEnd < targetLength) {
          <span class="typing-display__context">...</span>
        }
      </div>
      <textarea
        #inputEl
        class="typing-display__input"
        [value]="input"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        [readonly]="disabled"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Typing input"
      ></textarea>
      <div class="typing-display__focus" aria-hidden="true">Click to focus</div>
    </div>
  `,
  styles: `
    .typing-display {
      position: relative;
      font-family: var(--mono);
      font-size: clamp(1.05rem, 2vw, 1.35rem);
      line-height: 1.75;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      cursor: text;
      min-height: 9rem;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .typing-display:focus-within {
      border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .typing-display__text {
      white-space: pre-wrap;
      word-break: break-word;
      user-select: none;
    }

    .typing-display__context {
      color: color-mix(in srgb, var(--muted) 70%, transparent);
      font-family: var(--sans);
      font-size: 0.85rem;
      padding: 0 0.25rem;
    }

    .typing-display__input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      resize: none;
      border: none;
      padding: 1.25rem 1.5rem;
      font: inherit;
      line-height: 1.75;
      background: transparent;
      color: transparent;
      caret-color: transparent;
      outline: none;
    }

    .typing-display__focus {
      position: absolute;
      right: 0.75rem;
      bottom: 0.55rem;
      color: var(--muted);
      font-family: var(--sans);
      font-size: 0.72rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
    }

    .typing-display:not(:focus-within) .typing-display__focus {
      opacity: 0.8;
    }

    .char--pending {
      color: var(--muted);
    }

    .char--correct {
      color: var(--text);
    }

    .char--incorrect {
      color: var(--error);
      background: color-mix(in srgb, var(--error) 18%, transparent);
      border-radius: 2px;
    }

    .char--incorrect.char--error-flash {
      animation: error-flash 0.35s ease-out;
    }

    @keyframes error-flash {
      0% {
        background: color-mix(in srgb, var(--error) 50%, transparent);
      }
      100% {
        background: color-mix(in srgb, var(--error) 18%, transparent);
      }
    }

    .char--current {
      color: var(--text);
      position: relative;
    }

    .char--current::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0.05em;
      height: 2px;
      background: var(--accent);
      animation: caret-blink 1s step-end infinite;
    }

    @keyframes caret-blink {
      50% {
        opacity: 0;
      }
    }

    .typing-display--blind .char--pending,
    .typing-display--blind .char--current {
      color: color-mix(in srgb, var(--muted) 35%, transparent);
    }
  `,
})
export class TypingDisplayComponent implements OnChanges {
  @Input({ required: true }) target = '';
  @Input() input = '';
  @Input() blindMode = false;
  @Input() disabled = false;
  @Input() autofocus = true;

  @Output() inputChange = new EventEmitter<string>();
  @Output() restart = new EventEmitter<void>();

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLTextAreaElement>;

  displayChars: Array<{ index: number; value: string; className: string }> = [];
  displayStart = 0;
  displayEnd = 0;
  targetLength = 0;
  flashIndex: number | null = null;
  private prevInputLen = 0;
  private readonly leadingContextChars = 900;
  private readonly trailingContextChars = 2400;
  private readonly minimumWindowChars = 3200;

  constructor(private readonly engine: TypingEngineService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['target'] || changes['input']) {
      this.refreshDisplay();
      this.triggerErrorFlash(changes);
    }
    if (changes['target'] && this.autofocus) {
      setTimeout(() => this.focusInput(), 0);
    }
  }

  refreshDisplay(): void {
    const normalizedTarget = this.engine.normalize(this.target);
    const normalizedInput = this.engine.normalize(this.input);
    this.targetLength = normalizedTarget.length;

    const cursor = Math.min(normalizedInput.length, this.targetLength);
    this.displayStart = Math.max(0, cursor - this.leadingContextChars);
    this.displayEnd = Math.min(
      this.targetLength,
      Math.max(cursor + this.trailingContextChars, this.displayStart + this.minimumWindowChars)
    );

    this.displayChars = [];
    for (let index = this.displayStart; index < this.displayEnd; index++) {
      const state = this.charStateAt(index, normalizedTarget, normalizedInput);
      this.displayChars.push({
        index,
        value: index < normalizedInput.length ? normalizedInput[index] : normalizedTarget[index],
        className: `char char--${state}`,
      });
    }
  }

  private charStateAt(
    index: number,
    normalizedTarget: string,
    normalizedInput: string
  ): 'pending' | 'correct' | 'incorrect' | 'current' {
    if (index > normalizedInput.length) {
      return 'pending';
    }
    if (index === normalizedInput.length) {
      return 'current';
    }
    return normalizedInput[index] === normalizedTarget[index] ? 'correct' : 'incorrect';
  }

  private triggerErrorFlash(changes: SimpleChanges): void {
    if (!changes['input'] || changes['input'].firstChange) {
      this.prevInputLen = this.input.length;
      return;
    }
    const grew = this.input.length > this.prevInputLen;
    this.prevInputLen = this.input.length;
    if (!grew || this.input.length === 0) {
      return;
    }
    const idx = this.input.length - 1;
    const target = this.engine.normalize(this.target);
    if (this.input[idx] !== target[idx]) {
      this.flashIndex = idx;
      setTimeout(() => {
        if (this.flashIndex === idx) {
          this.flashIndex = null;
        }
      }, 350);
    }
  }

  focusInput(): void {
    if (!this.disabled) {
      this.inputEl?.nativeElement.focus();
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = this.engine
      .normalize(textarea.value)
      .slice(0, this.engine.normalize(this.target).length);
    if (textarea.value !== value) {
      textarea.value = value;
    }
    this.inputChange.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.restart.emit();
    }
  }
}

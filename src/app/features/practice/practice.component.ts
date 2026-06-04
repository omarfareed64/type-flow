import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { StatsPanelComponent } from '../../shared/components/stats-panel/stats-panel.component';
import { TypingDisplayComponent } from '../../shared/components/typing-display/typing-display.component';
import { PRACTICE_TEXTS } from '../../core/data/practice-texts';
import { TypingEngineService } from '../../core/services/typing-engine.service';
import { TypingProgress, TypingStats } from '../../core/models/typing-stats.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [TypingDisplayComponent, StatsPanelComponent, PageHeaderComponent],
  template: `
    <div class="practice">
      <app-page-header title="Practice">
        <div page-actions class="practice__controls">
          <label class="toggle">
            <input type="checkbox" [checked]="blindMode()" (change)="blindMode.set($any($event.target).checked)" />
            Blind mode
          </label>
          <button type="button" class="btn btn--ghost btn--sm" (click)="loadNewText()">New text</button>
          <button type="button" class="btn btn--ghost btn--sm" (click)="reset()">Restart</button>
        </div>
      </app-page-header>

      <app-stats-panel [stats]="stats()" [live]="!completed()" />

      @if (completed()) {
        <div class="banner banner--success">
          Done! {{ stats().wpm }} WPM at {{ stats().accuracy }}% accuracy with {{ stats().incorrectChars }} misses.
          <button type="button" class="btn btn--sm btn--primary" (click)="loadNewText()">Next passage</button>
        </div>
      }

      <app-typing-display
        [target]="target()"
        [input]="input()"
        [blindMode]="blindMode()"
        (inputChange)="onType($event)"
        (restart)="reset()"
      />

      <p class="hint">Press any key to start · Ctrl+Enter to restart</p>
    </div>
  `,
  styles: `
    .practice__controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--muted);
      cursor: pointer;
    }

    .hint {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
  `,
})
export class PracticeComponent implements OnInit, OnDestroy {
  target = signal('');
  input = signal('');
  progress = signal<TypingProgress>({
    index: 0,
    errors: 0,
    correctChars: 0,
    incorrectChars: 0,
    startedAt: null,
    finishedAt: null,
  });
  stats = signal<TypingStats>(this.emptyStats());
  blindMode = signal(false);
  completed = signal(false);

  private tickId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly engine: TypingEngineService) {}

  ngOnInit(): void {
    this.loadNewText();
    this.tickId = setInterval(() => this.refreshStats(), 250);
  }

  ngOnDestroy(): void {
    if (this.tickId) {
      clearInterval(this.tickId);
    }
  }

  loadNewText(): void {
    const text = PRACTICE_TEXTS[Math.floor(Math.random() * PRACTICE_TEXTS.length)];
    const state = this.engine.reset(text);
    this.target.set(state.target);
    this.input.set(state.input);
    this.progress.set(state.progress);
    this.completed.set(false);
    this.refreshStats();
  }

  reset(): void {
    const state = this.engine.reset(this.target());
    this.input.set(state.input);
    this.progress.set(state.progress);
    this.completed.set(false);
    this.refreshStats();
  }

  onType(raw: string): void {
    const result = this.engine.handleInput(
      this.target(),
      this.input(),
      raw,
      this.progress()
    );
    this.input.set(result.input);
    this.progress.set(result.progress);
    this.completed.set(result.completed);
    this.refreshStats();
  }

  private refreshStats(): void {
    this.stats.set(
      this.engine.computeStats(this.target(), this.input(), this.progress())
    );
  }

  private emptyStats(): TypingStats {
    return {
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      progressPercent: 0,
      correctChars: 0,
      incorrectChars: 0,
      remainingChars: 0,
      totalKeystrokes: 0,
      durationMs: 0,
      completed: false,
    };
  }
}

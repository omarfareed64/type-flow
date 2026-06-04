import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Lesson } from '../../core/models/lesson.model';
import { TypingProgress, TypingStats } from '../../core/models/typing-stats.model';
import { LessonStorageService } from '../../core/services/lesson-storage.service';
import { TypingEngineService } from '../../core/services/typing-engine.service';
import { buildYoutubeEmbedUrl, extractYoutubeVideoId } from '../../core/utils/youtube.util';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatsPanelComponent } from '../../shared/components/stats-panel/stats-panel.component';
import { TypingDisplayComponent } from '../../shared/components/typing-display/typing-display.component';
import { StudyVideoComponent } from './components/study-video/study-video.component';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [
    TypingDisplayComponent,
    StatsPanelComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    StudyVideoComponent,
  ],
  template: `
    @if (!lesson()) {
      <app-empty-state
        title="Lesson not found"
        message="This lesson may have been deleted or moved."
        actionLabel="Back to lessons"
        actionLink="/lessons"
      />
    } @else {
      <div class="study" [class.study--with-video]="embedUrl()">
        <app-page-header
          [title]="lesson()!.title"
          [subtitle]="lesson()!.notes ?? ''"
          backLabel="← Lessons"
          backLink="/lessons"
        >
          <div page-actions class="study__controls">
            <label class="toggle">
              <input type="checkbox" [checked]="blindMode()" (change)="blindMode.set($any($event.target).checked)" />
              Blind mode
            </label>
            <label class="toggle">
              <input type="checkbox" [checked]="showVideo()" (change)="showVideo.set($any($event.target).checked)" />
              Show video
            </label>
            <button type="button" class="btn btn--ghost btn--sm" (click)="reset()">Restart</button>
          </div>
        </app-page-header>

        <app-stats-panel [stats]="stats()" [live]="!completed()" [showRaw]="true" />

        @if (completed()) {
          <div class="banner banner--success">
            Session complete: {{ stats().wpm }} WPM, {{ stats().accuracy }}% accuracy.
            <button type="button" class="btn btn--sm btn--primary" (click)="reset()">Type again</button>
          </div>
        }

        <div class="study__layout">
          @if (embedUrl() && showVideo()) {
            <app-study-video [embedUrl]="embedUrl()!" />
          }

          <div class="study__typing">
            <app-typing-display
              [target]="target()"
              [input]="input()"
              [blindMode]="blindMode()"
              (inputChange)="onType($event)"
              (restart)="reset()"
            />
          </div>
        </div>

        <p class="hint">Ctrl+Enter to restart · Toggle blind mode to hide upcoming words</p>
      </div>
    }
  `,
  styles: `
    .study__controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .study__layout {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .study--with-video .study__layout {
      grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.2fr);
    }

    @media (max-width: 900px) {
      .study--with-video .study__layout {
        grid-template-columns: 1fr;
      }
    }

    .hint {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
  `,
})
export class StudyComponent implements OnInit, OnDestroy {
  lesson = signal<Lesson | null>(null);
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
  showVideo = signal(true);
  completed = signal(false);

  embedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.lesson()?.youtubeUrl;
    if (!url) {
      return null;
    }
    const id = extractYoutubeVideoId(url);
    if (!id) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(buildYoutubeEmbedUrl(id));
  });

  private tickId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storage: LessonStorageService,
    private readonly engine: TypingEngineService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.storage.getById(id);
      if (found) {
        this.lesson.set(found);
        const state = this.engine.reset(found.script);
        this.target.set(state.target);
        this.input.set(state.input);
        this.progress.set(state.progress);
      }
    }
    this.tickId = setInterval(() => this.refreshStats(), 250);
  }

  ngOnDestroy(): void {
    if (this.tickId) {
      clearInterval(this.tickId);
    }
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

import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { LessonStorageService } from '../../core/services/lesson-storage.service';
import { TranscriptService } from '../../core/services/transcript.service';
import { isValidYoutubeUrl } from '../../core/utils/youtube.util';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page">
      <h1>{{ isEdit() ? 'Edit lesson' : 'New lesson' }}</h1>
      <p class="subtitle">
        Paste a YouTube link and fetch its transcript automatically, or enter a script yourself.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="lesson-form">
        <label>
          <span>Title</span>
          <input type="text" formControlName="title" placeholder="e.g. Spanish podcast ep. 3" />
        </label>

        <div class="youtube-block">
          <label>
            <span>YouTube URL</span>
            <input
              type="url"
              formControlName="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            @if (form.controls.youtubeUrl.touched && form.controls.youtubeUrl.value && !youtubeOk()) {
              <span class="error-text">Could not parse a valid YouTube video ID from this URL.</span>
            }
          </label>

          <div class="youtube-block__row">
            <label class="lang-field">
              <span>Caption language (optional)</span>
              <input type="text" formControlName="captionLang" placeholder="en, es, fr..." />
            </label>
            <button
              type="button"
              class="btn btn--ghost"
              [disabled]="!canFetchTranscript() || fetching()"
              (click)="fetchTranscript()"
            >
              {{ fetching() ? 'Fetching…' : 'Fetch transcript' }}
            </button>
          </div>

          @if (fetchMessage()) {
            <p class="fetch-msg" [class.fetch-msg--error]="fetchError()">{{ fetchMessage() }}</p>
          }
        </div>

        <label>
          <span>Script / transcript</span>
          <textarea
            formControlName="script"
            rows="12"
            placeholder="Click “Fetch transcript” after pasting a YouTube URL, or paste your own script here."
          ></textarea>
          <span class="field-hint">{{ scriptWordCount() }} words</span>
        </label>

        <label>
          <span>Notes (optional)</span>
          <input type="text" formControlName="notes" placeholder="Chapter, speaker, vocabulary focus..." />
        </label>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || !youtubeOk()">
            {{ isEdit() ? 'Save changes' : 'Create & study' }}
          </button>
          <a routerLink="/lessons" class="btn btn--ghost">Cancel</a>
        </div>
      </form>

      <aside class="help">
        <h3>Auto transcript</h3>
        <ul>
          <li>Paste a public YouTube URL, then click <strong>Fetch transcript</strong>.</li>
          <li>Only videos with captions/subtitles work (creator or auto-generated).</li>
          <li>Use <strong>Caption language</strong> for non-English tracks (e.g. <code>es</code>, <code>fr</code>).</li>
          <li>Run <code>npm start</code> so the transcript API runs alongside the app.</li>
        </ul>
      </aside>
    </div>
  `,
  styles: `
    .form-page {
      display: grid;
      grid-template-columns: 1fr minmax(200px, 280px);
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .form-page {
        grid-template-columns: 1fr;
      }
    }

    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.35rem;
      grid-column: 1 / -1;
    }

    .subtitle {
      color: var(--muted);
      margin: 0 0 1.25rem;
      grid-column: 1 / -1;
    }

    .lesson-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label span:first-child {
      font-size: 0.85rem;
      font-weight: 500;
    }

    input,
    textarea {
      font: inherit;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
    }

    textarea {
      resize: vertical;
      line-height: 1.5;
      font-family: var(--mono);
      font-size: 0.9rem;
    }

    .youtube-block {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 1rem;
      border-radius: var(--radius);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
      background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    }

    .youtube-block__row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .lang-field {
      flex: 1;
      min-width: 140px;
    }

    .field-hint,
    .error-text,
    .fetch-msg {
      font-size: 0.8rem;
    }

    .field-hint {
      color: var(--muted);
    }

    .error-text,
    .fetch-msg--error {
      color: var(--error);
    }

    .fetch-msg {
      margin: 0;
      color: var(--accent);
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .help {
      padding: 1rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 0.85rem;
      color: var(--muted);
    }

    .help h3 {
      margin: 0 0 0.5rem;
      font-size: 0.95rem;
      color: var(--text);
    }

    .help ul {
      margin: 0;
      padding-left: 1.1rem;
      line-height: 1.6;
    }

    .help code {
      font-family: var(--mono);
      font-size: 0.8em;
    }
  `,
})
export class LessonFormComponent implements OnInit {
  isEdit = signal(false);
  lessonId = signal<string | null>(null);
  fetching = signal(false);
  fetchMessage = signal('');
  fetchError = signal(false);
  scriptWordCount = signal(0);

  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly storage: LessonStorageService,
    private readonly transcript: TranscriptService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      youtubeUrl: [''],
      captionLang: [''],
      script: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.form.controls.script.valueChanges
      .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
      .subscribe((script) => this.scriptWordCount.set(this.countWords(script)));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const lesson = this.storage.getById(id);
      if (lesson) {
        this.isEdit.set(true);
        this.lessonId.set(id);
        this.form.patchValue({
          title: lesson.title,
          youtubeUrl: lesson.youtubeUrl ?? '',
          script: lesson.script,
          notes: lesson.notes ?? '',
        });
      }
    }
    this.scriptWordCount.set(this.countWords(this.form.controls.script.value));
  }

  private countWords(script: string): number {
    script = script.trim();
    return script ? script.split(/\s+/).length : 0;
  }

  youtubeOk(): boolean {
    const url = this.form.controls.youtubeUrl.value.trim();
    return !url || isValidYoutubeUrl(url);
  }

  canFetchTranscript(): boolean {
    const url = this.form.controls.youtubeUrl.value.trim();
    return !!url && isValidYoutubeUrl(url) && !this.fetching();
  }

  fetchTranscript(): void {
    const url = this.form.controls.youtubeUrl.value.trim();
    if (!isValidYoutubeUrl(url)) {
      this.fetchError.set(true);
      this.fetchMessage.set('Enter a valid YouTube URL first.');
      return;
    }

    const lang = this.form.controls.captionLang.value.trim() || undefined;
    this.fetching.set(true);
    this.fetchError.set(false);
    this.fetchMessage.set('Loading captions from YouTube…');

    this.transcript.fetchFromUrl(url, lang).subscribe({
      next: (res) => {
        this.form.controls.script.setValue(res.text);
        this.form.controls.script.markAsDirty();
        this.scriptWordCount.set(this.countWords(res.text));
        if (!this.form.controls.title.value.trim()) {
          this.form.controls.title.setValue(`YouTube ${res.videoId}`);
        }
        this.fetching.set(false);
        this.fetchError.set(false);
        this.fetchMessage.set(
          `Loaded ${this.scriptWordCount()} words (${res.segmentCount} segments, ${res.language}).`
        );
      },
      error: (err: Error) => {
        this.fetching.set(false);
        this.fetchError.set(true);
        this.fetchMessage.set(err.message);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.youtubeOk()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const lesson = this.storage.save(
      {
        title: value.title,
        youtubeUrl: value.youtubeUrl || undefined,
        script: value.script,
        notes: value.notes || undefined,
      },
      this.lessonId() ?? undefined
    );
    this.router.navigate(['/study', lesson.id]);
  }
}

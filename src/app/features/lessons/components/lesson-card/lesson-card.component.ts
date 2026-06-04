import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lesson } from '../../../../core/models/lesson.model';
import { extractYoutubeVideoId } from '../../../../core/utils/youtube.util';

@Component({
  selector: 'app-lesson-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="lesson-card">
      <div class="lesson-card__main">
        <h2>{{ lesson.title }}</h2>
        <p class="lesson-card__meta">
          @if (hasVideo) {
            <span class="badge">YouTube</span>
          }
          <span>{{ wordCount }} words</span>
          <span>Updated {{ updatedAt }}</span>
        </p>
        @if (lesson.notes) {
          <p class="lesson-card__notes">{{ lesson.notes }}</p>
        }
      </div>
      <div class="lesson-card__actions">
        <a [routerLink]="['/study', lesson.id]" class="btn btn--primary btn--sm">Study</a>
        <a [routerLink]="['/lessons', lesson.id, 'edit']" class="btn btn--ghost btn--sm">Edit</a>
        <button type="button" class="btn btn--ghost btn--sm btn--danger" (click)="deleteLesson.emit(lesson)">
          Delete
        </button>
      </div>
    </article>
  `,
  styles: `
    .lesson-card {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    h2 {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
    }

    .lesson-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 0.75rem;
      margin: 0;
      font-size: 0.8rem;
      color: var(--muted);
    }

    .lesson-card__notes {
      margin: 0.5rem 0 0;
      font-size: 0.85rem;
      color: var(--muted);
      line-height: 1.5;
    }

    .lesson-card__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .badge {
      background: color-mix(in srgb, var(--accent) 25%, transparent);
      color: var(--accent);
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .btn--danger {
      color: var(--error) !important;
    }
  `,
})
export class LessonCardComponent {
  @Input({ required: true }) lesson!: Lesson;
  @Output() deleteLesson = new EventEmitter<Lesson>();

  get hasVideo(): boolean {
    return !!this.lesson.youtubeUrl && extractYoutubeVideoId(this.lesson.youtubeUrl) !== null;
  }

  get wordCount(): number {
    const script = this.lesson.script.trim();
    return script ? script.split(/\s+/).length : 0;
  }

  get updatedAt(): string {
    return new Date(this.lesson.updatedAt).toLocaleDateString();
  }
}

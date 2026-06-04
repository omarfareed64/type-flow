import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lesson } from '../../core/models/lesson.model';
import { LessonStorageService } from '../../core/services/lesson-storage.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LessonCardComponent } from './components/lesson-card/lesson-card.component';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, EmptyStateComponent, LessonCardComponent],
  template: `
    <div class="lessons">
      <app-page-header title="My lessons">
        <a page-actions routerLink="/lessons/new" class="btn btn--primary btn--sm">+ New lesson</a>
      </app-page-header>

      @if (lessons().length === 0) {
        <app-empty-state
          title="No lessons yet"
          message="Create one with a YouTube link and transcript to start studying."
          actionLabel="Create your first lesson"
          actionLink="/lessons/new"
        />
      } @else {
        <ul class="lesson-list">
          @for (lesson of lessons(); track lesson.id) {
            <li>
              <app-lesson-card [lesson]="lesson" (deleteLesson)="remove($event)" />
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .lesson-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `,
})
export class LessonListComponent implements OnInit {
  lessons = signal<Lesson[]>([]);

  constructor(private readonly storage: LessonStorageService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.lessons.set(this.storage.getAll());
  }

  remove(lesson: Lesson): void {
    if (confirm(`Delete "${lesson.title}"?`)) {
      this.storage.delete(lesson.id);
      this.refresh();
    }
  }
}

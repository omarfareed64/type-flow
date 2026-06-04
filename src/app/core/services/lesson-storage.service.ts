import { Injectable } from '@angular/core';
import { Lesson, LessonDraft } from '../models/lesson.model';

const STORAGE_KEY = 'typeflow-lessons';

@Injectable({ providedIn: 'root' })
export class LessonStorageService {
  getAll(): Lesson[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as Lesson[];
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
    } catch {
      return [];
    }
  }

  getById(id: string): Lesson | undefined {
    return this.getAll().find((lesson) => lesson.id === id);
  }

  save(draft: LessonDraft, id?: string): Lesson {
    const now = Date.now();
    const lessons = this.getAll();
    const existing = id ? lessons.find((l) => l.id === id) : undefined;

    const lesson: Lesson = {
      id: existing?.id ?? crypto.randomUUID(),
      title: draft.title.trim() || 'Untitled lesson',
      youtubeUrl: draft.youtubeUrl?.trim() || undefined,
      script: draft.script,
      notes: draft.notes?.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const next = existing
      ? lessons.map((l) => (l.id === lesson.id ? lesson : l))
      : [lesson, ...lessons];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return lesson;
  }

  delete(id: string): void {
    const next = this.getAll().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

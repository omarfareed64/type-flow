export interface Lesson {
  id: string;
  title: string;
  youtubeUrl?: string;
  script: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LessonDraft {
  title: string;
  youtubeUrl?: string;
  script: string;
  notes?: string;
}

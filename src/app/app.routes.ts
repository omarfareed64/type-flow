import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LessonFormComponent } from './features/lessons/lesson-form.component';
import { LessonListComponent } from './features/lessons/lesson-list.component';
import { PracticeComponent } from './features/practice/practice.component';
import { StudyComponent } from './features/study/study.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'practice', component: PracticeComponent },
  { path: 'lessons', component: LessonListComponent },
  { path: 'lessons/new', component: LessonFormComponent },
  { path: 'lessons/:id/edit', component: LessonFormComponent },
  { path: 'study/:id', component: StudyComponent },
  { path: '**', redirectTo: '' },
];

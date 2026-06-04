import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <a routerLink="/" class="header__brand">
        <span class="header__logo">⌨</span>
        <span>TypeFlow</span>
      </a>
      <nav class="header__nav">
        <a routerLink="/practice" routerLinkActive="active">Practice</a>
        <a routerLink="/lessons" routerLinkActive="active">My Lessons</a>
        <a routerLink="/lessons/new" routerLinkActive="active" class="header__cta">+ New Lesson</a>
      </nav>
    </header>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0 1.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1.5rem;
    }

    .header__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--text);
      text-decoration: none;
    }

    .header__logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 8px;
      background: color-mix(in srgb, var(--accent) 20%, transparent);
      color: var(--accent);
    }

    .header__nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header__nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }

    .header__nav a:hover,
    .header__nav a.active {
      color: var(--text);
    }

    .header__cta {
      background: var(--accent) !important;
      color: var(--bg) !important;
      font-weight: 600;
      padding: 0.4rem 0.75rem !important;
    }

    .header__cta:hover {
      filter: brightness(1.08);
    }
  `,
})
export class HeaderComponent {}

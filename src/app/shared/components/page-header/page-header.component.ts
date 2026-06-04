import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        @if (backLabel && backLink) {
          <a class="page-header__back" [routerLink]="backLink">{{ backLabel }}</a>
        }
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p>{{ subtitle }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content select="[page-actions]" />
      </div>
    </header>
  `,
  styles: `
    .page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    h1 {
      margin: 0;
      font-size: 1.35rem;
      line-height: 1.2;
    }

    p {
      margin: 0.4rem 0 0;
      max-width: 44rem;
      color: var(--muted);
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .page-header__back {
      display: inline-block;
      margin-bottom: 0.35rem;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
    }

    .page-header__back:hover {
      color: var(--accent);
    }

    .page-header__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() backLabel = '';
  @Input() backLink = '';
}

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="empty-state">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      @if (actionLabel && actionLink) {
        <a [routerLink]="actionLink" class="btn btn--primary">{{ actionLabel }}</a>
      }
    </section>
  `,
  styles: `
    .empty-state {
      padding: 2rem;
      text-align: center;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px dashed var(--border);
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.05rem;
    }

    p {
      color: var(--muted);
      margin: 0 0 1rem;
      line-height: 1.5;
    }
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input({ required: true }) message = '';
  @Input() actionLabel = '';
  @Input() actionLink: string | unknown[] = '';
}

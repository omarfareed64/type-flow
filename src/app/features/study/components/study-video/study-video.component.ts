import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-study-video',
  standalone: true,
  template: `
    <section class="study-video">
      <iframe
        [src]="embedUrl"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <p>Listen while you type. Pause and rewind as needed; accuracy beats speed.</p>
    </section>
  `,
  styles: `
    iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      border: none;
      border-radius: var(--radius);
      background: #000;
    }

    p {
      font-size: 0.8rem;
      color: var(--muted);
      margin: 0.5rem 0 0;
      line-height: 1.5;
    }
  `,
})
export class StudyVideoComponent {
  @Input({ required: true }) embedUrl!: SafeResourceUrl;
}

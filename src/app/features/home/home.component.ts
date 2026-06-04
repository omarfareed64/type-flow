import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <p class="eyebrow">Type · Listen · Remember</p>
      <h1>Turn videos and scripts into active study sessions</h1>
      <p class="lead">
        TypeFlow combines classic typing practice with study mode: paste a YouTube link and
        transcript, watch while you type, and lock in what you hear.
      </p>
      <div class="hero__actions">
        <a routerLink="/practice" class="btn btn--primary">Start practice</a>
        <a routerLink="/lessons/new" class="btn btn--ghost">Create lesson with video</a>
      </div>
    </section>

    <section class="cards">
      <article class="card">
        <h2>Practice mode</h2>
        <p>Timed passages like TypeClub — WPM, accuracy, and instant feedback as you type.</p>
        <a routerLink="/practice" class="card__link">Open practice →</a>
      </article>
      <article class="card card--accent">
        <h2>Study mode</h2>
        <p>
          Add a YouTube URL plus the script or subtitles. Watch the video side-by-side while
          typing the text to understand every word.
        </p>
        <a routerLink="/lessons" class="card__link">My lessons →</a>
      </article>
      <article class="card">
        <h2>Script-only</h2>
        <p>No video? Paste lecture notes, podcast transcripts, or any text and type it through.</p>
        <a routerLink="/lessons/new" class="card__link">Paste a script →</a>
      </article>
    </section>

    <section class="tips">
      <h3>Study workflow</h3>
      <ol>
        <li>Watch the video once without typing.</li>
        <li>Copy the transcript (YouTube → ⋮ → Show transcript, or your own notes).</li>
        <li>Create a lesson, paste the link and script, then type along in study mode.</li>
        <li>Toggle blind mode to recall from memory after a first pass.</li>
      </ol>
    </section>
  `,
  styles: `
    .hero {
      max-width: 42rem;
      margin-bottom: 2.5rem;
    }

    .eyebrow {
      color: var(--accent);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      line-height: 1.2;
      margin: 0 0 1rem;
    }

    .lead {
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .card {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .card--accent {
      border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
    }

    .card h2 {
      font-size: 1.1rem;
      margin: 0 0 0.5rem;
    }

    .card p {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 1rem;
    }

    .card__link {
      color: var(--accent);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .tips {
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface) 80%, var(--bg));
      border: 1px dashed var(--border);
    }

    .tips h3 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
    }

    .tips ol {
      margin: 0;
      padding-left: 1.25rem;
      color: var(--muted);
      line-height: 1.7;
    }
  `,
})
export class HomeComponent {}

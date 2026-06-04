import { Component, Input } from '@angular/core';
import { TypingStats } from '../../../core/models/typing-stats.model';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  template: `
    <div class="stats-panel" [class.stats-panel--live]="live">
      <div class="stat">
        <span class="stat__label">WPM</span>
        <span class="stat__value">{{ stats.wpm }}</span>
      </div>
      <div class="stat">
        <span class="stat__label">Accuracy</span>
        <span class="stat__value">{{ stats.accuracy }}%</span>
      </div>
      <div class="stat">
        <span class="stat__label">Time</span>
        <span class="stat__value">{{ formattedTime }}</span>
      </div>
      <div class="stat">
        <span class="stat__label">Progress</span>
        <span class="stat__value">{{ stats.progressPercent }}%</span>
      </div>
      @if (showRaw) {
        <div class="stat">
          <span class="stat__label">Raw</span>
          <span class="stat__value">{{ stats.rawWpm }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .stats-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(5.25rem, 1fr));
      gap: 0.75rem;
      margin-bottom: 0.9rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
      padding: 0.75rem;
      border-radius: 8px;
      background: color-mix(in srgb, var(--surface) 78%, var(--bg));
      border: 1px solid var(--border);
    }

    .stat__label {
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .stat__value {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
    }

    .stats-panel--live .stat__value {
      color: var(--text);
    }
  `,
})
export class StatsPanelComponent {
  @Input({ required: true }) stats!: TypingStats;
  @Input() live = true;
  @Input() showRaw = false;

  get formattedTime(): string {
    const seconds = Math.floor(this.stats.durationMs / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

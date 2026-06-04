import { Injectable } from '@angular/core';
import { TypingProgress, TypingStats } from '../models/typing-stats.model';

@Injectable({ providedIn: 'root' })
export class TypingEngineService {
  createProgress(): TypingProgress {
    return {
      index: 0,
      errors: 0,
      correctChars: 0,
      incorrectChars: 0,
      startedAt: null,
      finishedAt: null,
    };
  }

  normalize(text: string): string {
    return text.replace(/\r\n?/g, '\n');
  }

  reset(target: string): { target: string; input: string; progress: TypingProgress } {
    return {
      target: this.normalize(target),
      input: '',
      progress: this.createProgress(),
    };
  }

  handleInput(
    target: string,
    previousInput: string,
    nextInput: string,
    progress: TypingProgress
  ): { input: string; progress: TypingProgress; completed: boolean } {
    const normalizedTarget = this.normalize(target);
    let nextProgress = { ...progress };

    const normalizedNextInput = this.normalize(nextInput);
    const normalizedPreviousInput = this.normalize(previousInput);

    if (normalizedNextInput.length < normalizedPreviousInput.length) {
      const input = normalizedNextInput.slice(0, normalizedTarget.length);
      const quality = this.countInputQuality(normalizedTarget, input);
      return {
        input,
        progress: {
          ...nextProgress,
          index: input.length,
          correctChars: quality.correctChars,
          incorrectChars: quality.incorrectChars,
          finishedAt: null,
        },
        completed: false,
      };
    }

    if (nextProgress.startedAt === null && normalizedNextInput.length > 0) {
      nextProgress = { ...nextProgress, startedAt: Date.now() };
    }

    const newChars = normalizedNextInput.slice(normalizedPreviousInput.length);
    let input = normalizedPreviousInput;

    for (const char of newChars) {
      if (input.length >= normalizedTarget.length) {
        break;
      }
      input += char;
      const pos = input.length - 1;
      if (input[pos] !== normalizedTarget[pos]) {
        nextProgress = {
          ...nextProgress,
          errors: nextProgress.errors + 1,
          incorrectChars: nextProgress.incorrectChars + 1,
        };
      } else {
        nextProgress = {
          ...nextProgress,
          correctChars: nextProgress.correctChars + 1,
        };
      }
    }

    input = input.slice(0, normalizedTarget.length);
    const completed = input.length >= normalizedTarget.length;
    if (completed && nextProgress.finishedAt === null) {
      nextProgress = { ...nextProgress, finishedAt: Date.now() };
    }

    return {
      input,
      progress: { ...nextProgress, index: input.length },
      completed,
    };
  }

  computeStats(
    target: string,
    input: string,
    progress: TypingProgress,
    extraKeystrokes = 0
  ): TypingStats {
    const normalizedTarget = this.normalize(target);
    const durationMs =
      progress.startedAt === null
        ? 0
        : (progress.finishedAt ?? Date.now()) - progress.startedAt;
    const minutes = Math.max(durationMs / 60000, 1 / 60000);

    const fallbackQuality =
      progress.correctChars === undefined || progress.incorrectChars === undefined
        ? this.countInputQuality(normalizedTarget, input)
        : null;
    const correctChars = progress.correctChars ?? fallbackQuality?.correctChars ?? 0;
    const incorrectChars = progress.incorrectChars ?? fallbackQuality?.incorrectChars ?? 0;

    const targetLength = normalizedTarget.length;
    const totalKeystrokes = input.length + extraKeystrokes;
    const accuracy =
      totalKeystrokes === 0
        ? 100
        : Math.max(0, Math.round((correctChars / totalKeystrokes) * 1000) / 10);

    const wpm = Math.round((correctChars / 5) / minutes);
    const rawWpm = Math.round((input.length / 5) / minutes);
    const progressPercent =
      targetLength === 0
        ? 0
        : Math.min(100, Math.round((input.length / targetLength) * 100));
    const remainingChars = Math.max(0, targetLength - input.length);
    const completed =
      input.length >= targetLength && progress.finishedAt !== null;

    return {
      wpm,
      rawWpm,
      accuracy,
      progressPercent,
      correctChars,
      incorrectChars,
      remainingChars,
      totalKeystrokes,
      durationMs,
      completed,
    };
  }

  getCharStates(target: string, input: string): Array<'pending' | 'correct' | 'incorrect' | 'current'> {
    const normalizedTarget = this.normalize(target);
    const states: Array<'pending' | 'correct' | 'incorrect' | 'current'> = [];

    for (let i = 0; i < normalizedTarget.length; i++) {
      if (i > input.length) {
        states.push('pending');
      } else if (i === input.length) {
        states.push('current');
      } else if (input[i] === normalizedTarget[i]) {
        states.push('correct');
      } else {
        states.push('incorrect');
      }
    }

    return states;
  }

  /** Monkeytype-style: show the character the user typed when wrong. */
  getDisplayChar(target: string, input: string, index: number): string {
    const normalizedTarget = this.normalize(target);
    if (index < input.length) {
      return input[index];
    }
    return normalizedTarget[index] ?? '';
  }

  private countInputQuality(
    normalizedTarget: string,
    input: string
  ): { correctChars: number; incorrectChars: number } {
    let correctChars = 0;
    let incorrectChars = 0;
    const len = Math.min(input.length, normalizedTarget.length);

    for (let i = 0; i < len; i++) {
      if (input[i] === normalizedTarget[i]) {
        correctChars += 1;
      } else {
        incorrectChars += 1;
      }
    }

    return { correctChars, incorrectChars };
  }
}

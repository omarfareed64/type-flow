import { TypingEngineService } from './typing-engine.service';

describe('TypingEngineService', () => {
  let service: TypingEngineService;

  beforeEach(() => {
    service = new TypingEngineService();
  });

  it('normalizes carriage returns from pasted input', () => {
    expect(service.normalize('one\r\ntwo\rthree')).toBe('one\ntwo\nthree');
  });

  it('tracks progress and remaining characters', () => {
    const progress = {
      index: 0,
      errors: 0,
      correctChars: 2,
      incorrectChars: 0,
      startedAt: Date.now() - 60000,
      finishedAt: null,
    };
    const stats = service.computeStats('hello', 'he', progress);

    expect(stats.progressPercent).toBe(40);
    expect(stats.remainingChars).toBe(3);
    expect(stats.accuracy).toBe(100);
  });

  it('marks incorrect characters and completion', () => {
    const start = service.reset('abc');
    const result = service.handleInput(start.target, start.input, 'axc', start.progress);
    const stats = service.computeStats(start.target, result.input, result.progress);

    expect(result.completed).toBeTrue();
    expect(stats.incorrectChars).toBe(1);
    expect(stats.completed).toBeTrue();
  });
});

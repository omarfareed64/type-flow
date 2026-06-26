import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface RuntimeAppConfig {
  apiBaseUrl: string;
}

const DEFAULT_CONFIG: RuntimeAppConfig = {
  apiBaseUrl: '',
};

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly config = signal<RuntimeAppConfig>(DEFAULT_CONFIG);

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<Partial<RuntimeAppConfig>>('app-config.json')
      );
      this.config.set({
        ...DEFAULT_CONFIG,
        ...config,
        apiBaseUrl: this.normalizeApiBaseUrl(config.apiBaseUrl ?? ''),
      });
    } catch {
      this.config.set(DEFAULT_CONFIG);
    }
  }

  get apiBaseUrl(): string {
    return this.config().apiBaseUrl;
  }

  private normalizeApiBaseUrl(value: string): string {
    return value.trim().replace(/\/$/, '');
  }
}

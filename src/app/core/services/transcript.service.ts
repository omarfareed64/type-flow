import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { extractYoutubeVideoId } from '../utils/youtube.util';

export interface TranscriptResponse {
  videoId: string;
  text: string;
  segmentCount: number;
  language: string;
}

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService
  ) {}

  fetchFromUrl(youtubeUrl: string, lang?: string): Observable<TranscriptResponse> {
    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      return throwError(() => new Error('Invalid YouTube URL'));
    }
    return this.fetchByVideoId(videoId, lang);
  }

  fetchByVideoId(videoId: string, lang?: string): Observable<TranscriptResponse> {
    const params: Record<string, string> = { videoId };
    if (lang?.trim()) {
      params['lang'] = lang.trim();
    }
    return this.http.get<TranscriptResponse>(this.apiUrl('/api/transcript'), { params }).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg =
          typeof err.error === 'object' && err.error && 'error' in err.error
            ? String((err.error as { error: string }).error)
            : 'Could not fetch transcript. Is the API server running?';
        return throwError(() => new Error(msg));
      })
    );
  }

  private apiUrl(path: string): string {
    return `${this.config.apiBaseUrl}${path}`;
  }
}

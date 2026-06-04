import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app">
      <app-header />
      <main class="app__main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .app {
      min-height: 100vh;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 1.25rem 2rem;
    }

    .app__main {
      min-height: 60vh;
    }
  `,
})
export class AppComponent {}

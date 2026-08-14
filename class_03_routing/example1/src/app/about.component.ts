import { Component } from '@angular/core';

// Routed to via the 'about' path — rendered inside <router-outlet> in app.component.ts.
@Component({
  selector: 'app-about',
  template: `<h1>About Page</h1>`,
})
export class AboutComponent {}

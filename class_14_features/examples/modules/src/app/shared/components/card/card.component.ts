import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: false,
  template: `
    <section class="card">
      <h3>{{ title }}</h3>
      <ng-content></ng-content>
    </section>
  `,
  styles: [`
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    h3 { margin: 0 0 8px; font-size: 1rem; }
  `],
})
export class CardComponent {
  @Input() title = '';
}

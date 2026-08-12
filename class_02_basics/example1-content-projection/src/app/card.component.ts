import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <div class="card-header"><ng-content select="[card-header]" /></div>
      <div class="card-body"><ng-content /></div>
    </div>
  `,
  styles: [``],
})
export class CardComponent {}

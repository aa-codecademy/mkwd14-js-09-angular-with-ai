import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <!-- select="[card-header]" only projects elements that have the card-header attribute -->
      <!-- this is "multi-slot" content projection - one component, several distinct insertion points. -->
      <div class="card-header"><ng-content select="[card-header]" /></div>
      <!-- A plain <ng-content /> with no select catches everything else that wasn't matched above -->
      <div class="card-body"><ng-content /></div>
    </div>
  `,
  styles: [``],
})
export class CardComponent {}

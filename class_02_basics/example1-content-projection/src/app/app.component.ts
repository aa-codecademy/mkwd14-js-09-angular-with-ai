import { Component } from '@angular/core';
import { HighlightBox } from './highligh-box.component';
import { CardComponent } from './card.component';
import { Toggle } from './toggle.component';

@Component({
  selector: 'app-root',
  template: `
    <h2>Single-slot ng-content</h2>
    <!-- Everything between the <app-highlight-component> tags becomes "projected content" -->
    <!-- it is rendered wherever <ng-content /> appears inside that component's own template. -->
    <app-highlight-component>
      <p>This paragraph is being projected to the child component</p>
    </app-highlight-component>

    <h2>Multi-slot ng-content</h2>
    <!-- card-header is a plain attribute, not a component property - the child uses it as a -->
    <!-- CSS-style selector on <ng-content select="[card-header]" /> to route this into a specific slot. -->
    <app-card>
      <span card-header>Card title</span>
      <p>This is the main content of the card, some text as descriptions.</p>
    </app-card>

    <h2>ng-template with ng-template-outlet</h2>
    <app-toggle />
  `,
  imports: [HighlightBox, CardComponent, Toggle],
})
export class App {}

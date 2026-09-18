import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardComponent } from './components/card/card.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { HighlightDirective } from './directives/highlight.directive';

// SharedModule: reusable dumb components/pipes/directives.
// It has NO providers — it can be imported by many modules, including
// lazy-loaded ones, without creating duplicate service instances.
@NgModule({
  declarations: [CardComponent, TruncatePipe, HighlightDirective],
  imports: [CommonModule, FormsModule, RouterModule],
  // Re-exporting CommonModule/FormsModule/RouterModule means a feature module
  // only has to import SharedModule to get *ngIf, ngModel and routerLink.
  exports: [
    CardComponent,
    TruncatePipe,
    HighlightDirective,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
})
export class SharedModule {}

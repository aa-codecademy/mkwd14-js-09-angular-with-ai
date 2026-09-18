import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

// A "dumb" presentational component: it knows how to LOOK like a question and how to SHOUT
// the answer, and nothing about orders, stores or HTTP. That's why it's reusable anywhere.
@Component({
  imports: [TranslatePipe, MatCardModule, MatIconModule, MatAnchor],
  selector: 'app-confirmation-dialog',
  styleUrl: './confirmation-dialog.component.css',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  // input.required() with no type argument infers `unknown`. It still renders fine, but you
  // lose autocomplete and typo-checking - prefer input.required<string>() here.
  title = input.required();
  message = input.required();
  confirmationLabel = input.required();

  // output<void>() = "something happened, no payload". The parent (here: ConfirmationService)
  // decides what it MEANS. The dialog never closes itself - it only reports the click.
  confirm = output<void>();
  cancel = output<void>();
}

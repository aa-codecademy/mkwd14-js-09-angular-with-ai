import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';

@Component({
  imports: [MatCardModule, MatIconModule, MatAnchor],
  selector: 'app-confirmation-dialog',
  styleUrl: './confirmation-dialog.component.css',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  title = input.required();
  message = input.required();
  confirmationLabel = input.required();

  confirm = output<void>();
  cancel = output<void>();
}

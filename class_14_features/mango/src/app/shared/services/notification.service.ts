import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Wrapping MatSnackBar in our own service means components never repeat snackbar config,
// and swapping the toast library later touches exactly one file.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Classic constructor injection - equivalent to inject(MatSnackBar); both styles work.
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string) {
    // Errors stay on screen longer than successes - the user has to be able to read them.
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}

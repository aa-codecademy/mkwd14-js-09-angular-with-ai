import { Injectable, Injector, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

// Wrapping MatSnackBar in our own service means components never repeat snackbar config,
// and swapping the toast library later touches exactly one file.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Classic constructor injection - equivalent to inject(MatSnackBar); both styles work.
  constructor(private snackBar: MatSnackBar) {}

  private injector = inject(Injector);

  // TranslateService is resolved LAZILY, on the first snackbar, not when this service is built.
  // Injecting it eagerly would create a cycle: authInterceptor -> AuthStore -> NotificationService
  // -> TranslateService -> TranslateHttpLoader -> HttpClient -> authInterceptor (NG0200).
  // By the time a toast is shown, the injector is fully constructed and there is no loop.
  private get translate(): TranslateService {
    return this.injector.get(TranslateService);
  }

  showSuccess(message: string) {
    this.snackBar.open(message, this.translate.instant('notification.close'), {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string) {
    // Errors stay on screen longer than successes - the user has to be able to read them.
    this.snackBar.open(message, this.translate.instant('notification.dismiss'), {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}

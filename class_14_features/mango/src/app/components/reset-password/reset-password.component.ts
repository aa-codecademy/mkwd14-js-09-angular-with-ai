import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, type NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatchPasswordDirective } from '../../shared/directives/match-password.directive';
import { AuthStore } from '../../store/auth/auth.store';
import { TranslatePipe } from '@ngx-translate/core';

// TranslatePipe must be imported per standalone component - there is no global pipe
// registry any more. Forget it and you get "The pipe 'translate' could not be found".
@Component({
  imports: [
    TranslatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatchPasswordDirective,
  ],
  selector: 'app-reset-password',
  styleUrl: './reset-password.component.css',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  // Public so the TEMPLATE can read store.passwordError() and call clearPasswordError().
  store = inject(AuthStore);

  // Template-driven form: this object is the source of truth, and [(ngModel)] keeps
  // it in sync. Reactive forms would build a FormGroup in TypeScript instead.
  model = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // NgForm comes from the #passwordForm="ngForm" template reference - it carries the
  // values AND the validity of every control inside the <form>.
  onSubmit(form: NgForm) {
    // Guard even though the button is disabled: the button is UI, this is the real gate.
    if (!form.valid) {
      return;
    }

    // An HttpClient observable is COLD - without .subscribe() the request never leaves
    // the browser. This is the single most common "my API call does nothing" bug.
    return this.store
      .resetPassword({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      })
      .subscribe();
  }
}

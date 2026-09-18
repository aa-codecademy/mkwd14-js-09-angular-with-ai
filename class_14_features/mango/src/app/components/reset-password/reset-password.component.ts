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

@Component({
  imports: [
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
  store = inject(AuthStore);

  model = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  onSubmit(form: NgForm) {
    console.log('🚀 ~ ResetPasswordComponent ~ onSubmit ~ form:', form);
    if (!form.valid) {
      return;
    }

    return this.store
      .resetPassword({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
      })
      .subscribe();
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import type { Register } from '../../../core/models/auth.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { MatchPasswordDirective } from '../../../shared/directives/match-password.directive';

@Component({
  selector: 'app-register',
  imports: [
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAnchor,
    MatButtonModule,
    RouterLink,
    MatchPasswordDirective,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  model = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  onSubmit(form: NgForm) {
    console.log('🚀 ~ RegisterComponent ~ onSubmit ~ form:', form);
    if (form.invalid) {
      return;
    }

    const body: Register = {
      firstName: this.model.firstName,
      lastName: this.model.lastName,
      email: this.model.email,
      password: this.model.password,
    };
    this.authService.register(body).subscribe({
      next: (user) => {
        this.notificationService.showSuccess(
          `User: ${user.firstName} ${user.lastName} has been successfully registered!`,
        );
        this.router.navigate(['/login']);
      },
      error: (error) =>
        this.notificationService.showError(error.error.message || 'Error while registering'),
    });
  }
}

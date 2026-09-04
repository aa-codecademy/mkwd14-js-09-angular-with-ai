import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import type { Login } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAnchor,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  model = {
    email: '',
    password: '',
  };

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const body: Login = {
      email: this.model.email,
      password: this.model.password,
    };

    this.authService.login(body).subscribe({
      next: (user) => {
        this.notificationService.showSuccess(`You are successfully logged in!`);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.notificationService.showError(error.error.message || 'Issue while logging in.');
      },
    });
  }
}

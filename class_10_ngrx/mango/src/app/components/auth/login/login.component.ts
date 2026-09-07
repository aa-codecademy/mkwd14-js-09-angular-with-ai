import { Component, inject } from '@angular/core';
// FormsModule is what makes ngModel work. NgForm is the *type* of the object
// Angular hands you from `#loginForm="ngForm"` in the template.
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
  // inject() instead of a constructor parameter - same DI, less boilerplate.
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // In a TEMPLATE-DRIVEN form this plain object IS your form state. Each
  // [(ngModel)] in the template writes straight into it as the user types.
  // Reactive forms would instead build a FormGroup here in the class.
  model = {
    email: '',
    password: '',
  };

  // The form object is passed in from the template - the component never has to
  // reach into the DOM to read the inputs.
  onSubmit(form: NgForm) {
    // Always re-check validity here. The disabled button is only a UI hint; a
    // user can still submit with Enter, and disabled state can be bypassed.
    if (form.invalid) {
      return;
    }

    const body: Login = {
      email: this.model.email,
      password: this.model.password,
    };

    // HTTP observables are cold: nothing is sent until you subscribe.
    this.authService.login(body).subscribe({
      next: (user) => {
        this.notificationService.showSuccess(`You are successfully logged in!`);
        this.router.navigate(['/']);
      },
      // Handle the error callback or a failed login throws an unhandled error
      // in the console and the user sees nothing at all.
      error: (error) => {
        this.notificationService.showError(error.error.message || 'Issue while logging in.');
      },
    });
  }
}

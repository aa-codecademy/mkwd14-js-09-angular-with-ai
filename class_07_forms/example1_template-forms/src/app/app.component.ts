import { Component } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <h2>Template-Driven Login Form</h2>
    <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
      <div>
        <label>Email</label>
        <br />
        <input type="email" name="email" ngModel required email #emailCtrl="ngModel" />

        @if (emailCtrl.invalid && emailCtrl.touched) {
          @if (emailCtrl.errors?.['required']) {
            <p class="error">Email is required</p>
          }

          @if (emailCtrl.errors?.['email']) {
            <p class="error">Email must be in valid email format</p>
          }
        }
      </div>
      <div>
        <label>Password</label>
        <br />
        <input
          type="password"
          name="password"
          ngModel
          required
          minlength="8"
          #passwordCtrl="ngModel"
        />
        @if (passwordCtrl.invalid && passwordCtrl.touched) {
          @if (passwordCtrl.errors?.['required']) {
            <p class="error">Password is required</p>
          }

          @if (passwordCtrl.errors?.['minlength']) {
            <p class="error">Password must have at least 8 characters</p>
          }
        }
      </div>
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
      <p>Form Status: {{ loginForm.status }}</p>
    </form>
  `,
  styles: [
    `
      .error {
        color: red;
        font-size: 12px;
      }
    `,
  ],
})
export class App {
  onSubmit(form: NgForm) {
    console.log(form.value);
  }
}

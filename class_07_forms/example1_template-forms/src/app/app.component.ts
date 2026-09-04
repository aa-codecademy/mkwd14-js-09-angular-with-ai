import { Component } from '@angular/core';
// FormsModule powers template-driven forms - it gives you ngModel, ngForm, and the
// validation directives (required, minlength, email...) used as plain HTML attributes below.
// Without importing FormsModule here, ngModel silently fails to bind (no compile error).
import { FormsModule, type NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <h2>Template-Driven Login Form</h2>
    <!-- #loginForm="ngForm" grabs a reference to Angular's automatically-created NgForm
         directive on this <form>. It tracks the validity/value of every ngModel inside it. -->
    <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
      <div>
        <label>Email</label>
        <br />
        <!-- name="email" is REQUIRED - template-driven forms register controls by name,
             not by a property in the class (unlike reactive forms). Forget it and ngModel throws. -->
        <!-- required/email are Angular validator directives, not just HTML5 attributes - Angular
             reads them and produces the errors object below. -->
        <!-- #emailCtrl="ngModel" exposes this control's own NgModel instance so we can check
             its validity/touched state locally in the template. -->
        <!-- Bare ngModel (no banana-in-a-box brackets) registers the control with the
             form but does NOT bind to a class property. Use [(ngModel)]="model.email"
             only when you actually need the value in a field of your own.
             Careful: never put a backtick in a comment inside an inline template -
             it ends the template literal and the whole component stops compiling. -->
        <input type="email" name="email" ngModel required email #emailCtrl="ngModel" />

        <!-- Only show errors once the user has interacted with the field (touched) -
             showing "required" before they've even typed anything is bad UX. -->
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
      <!-- loginForm.invalid reflects the combined validity of every ngModel control inside it -->
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
      <!-- status is the string version of valid/invalid: 'VALID' | 'INVALID' |
           'PENDING' (an async validator is still running) | 'DISABLED'. -->
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
  // NgForm gives you the whole form's live value/status - handy since template-driven
  // forms don't build a FormGroup by hand like reactive forms do.
  onSubmit(form: NgForm) {
    // form.value is an object keyed by the name="..." attributes:
    // { email: '...', password: '...' }. That's why the names matter.
    console.log(form.value);
  }
}

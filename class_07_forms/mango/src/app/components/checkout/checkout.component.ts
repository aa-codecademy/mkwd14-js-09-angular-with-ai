import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-checkout',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);

  // Real-world reactive form used inside a Material stepper - each mat-step can be gated on
  // a form's validity via [stepControl], so users can't advance past an invalid step.
  addressForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['', Validators.required],
    phone: ['', Validators.required],
  });
}

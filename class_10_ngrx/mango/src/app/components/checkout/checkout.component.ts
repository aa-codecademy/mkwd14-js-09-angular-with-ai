import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInput } from '@angular/material/input';
import { CartService } from '../../shared/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../shared/services/order.service';
import type { CreateOrder } from '../../core/models/order.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-checkout',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    CurrencyPipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Real-world reactive form used inside a Material stepper - each mat-step can be gated on
  // a form's validity via [stepControl], so users can't advance past an invalid step.
  addressForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['', Validators.required],
    phone: [''],
  });

  placeOrder() {
    // Debug log - remove before shipping; console.log in production leaks customer data.
    console.log('Order to be sent:', {
      items: this.cartService.items(),
      shippingAddress: this.addressForm.value,
    });

    // items() is a signal: calling it reads the current value (signals are functions, not properties).
    const cartItems = this.cartService.items();
    // Send only ids + quantities: the server looks up prices itself so the total can't be faked.
    const items = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const body: CreateOrder = {
      items,
      // addressForm.value passes straight into ShippingAddress because the control names
      // match that interface's keys exactly - that's not a coincidence, design your forms this way.
      shippingAddress: this.addressForm.value,
    };

    this.orderService.create(body).subscribe({
      next: (order) => {
        console.log(order);
        // Clear the cart only after the server confirms - never optimistically before.
        this.cartService.clear();
        this.notificationService.showSuccess('Order submitted successfully!');
        this.router.navigate(['/orders']);
      },
      // Prefer the server's message when there is one, and fall back to something human-readable.
      error: (error) =>
        this.notificationService.showError(
          error.error?.message || 'Issue while submitting the order.',
        ),
    });
  }
}

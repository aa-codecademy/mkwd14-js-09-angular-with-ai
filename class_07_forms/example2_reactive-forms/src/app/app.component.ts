import { JsonPipe } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
  type FormGroup,
  type FormArray,
  type FormControl,
} from '@angular/forms';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App implements OnInit {
  private fb = inject(FormBuilder);

  namePreview = '';

  form: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      phones: this.fb.array([this.fb.control('', { nonNullable: true })]),
    },
    { validators: passwordMatchValidator },
  );

  get f() {
    return this.form.controls;
  }

  get phones() {
    return this.form.get('phones') as FormArray<FormControl<string>>;
  }

  ngOnInit() {
    this.f['name'].valueChanges.subscribe((value: string) => {
      this.namePreview = value;
    });
  }

  addPhone() {
    this.phones.push(this.fb.control('', { nonNullable: true }));
  }

  removePhone(index: number) {
    if (this.phones.controls.length <= 1) {
      return;
    }
    this.phones.removeAt(index);
  }

  onConfirmPassFocus() {
    this.f['password'].markAsTouched();
  }

  onSubmit() {
    console.log(this.form);
  }
}

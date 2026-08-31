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

// Cross-field validators (comparing two controls, like password vs confirmPassword) can't
// live on a single FormControl - they need access to the whole group. That's why this is
// attached to the FormGroup itself, not to an individual field.
// AbstractControl is the base type for FormControl/FormGroup/FormArray, so this function
// works whether it's attached to a group or a control.
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  // Returning null means "valid". Returning an errors object (any truthy key) means "invalid" -
  // this is the contract every Angular validator function must follow.
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App implements OnInit {
  // FormBuilder is just a convenience factory over `new FormGroup(...)`/`new FormControl(...)` -
  // inject() is the modern way to grab a DI dependency without a constructor.
  private fb = inject(FormBuilder);

  namePreview = '';

  // Reactive forms: the FormGroup is built and owned entirely in the TS class, not the template.
  // This is the core philosophy difference from template-driven forms - the form model is
  // code, so it's easy to unit test, and the template just binds to it.
  // Each array entry is [initialValue, validators] - Validators.required/minLength/email are
  // Angular's built-in synchronous validator functions.
  form: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      // FormArray - a dynamic, resizable list of controls (add/remove phone numbers at runtime).
      // Use this instead of a FormGroup when the number of fields isn't fixed ahead of time.
      phones: this.fb.array([this.fb.control('', { nonNullable: true })]),
    },
    // Group-level validators run after all child controls are valid; this is where
    // passwordMatchValidator gets wired in since it needs both fields at once.
    { validators: passwordMatchValidator },
  );

  // Shorthand getter so the template can write f['name'] instead of form.get('name') everywhere.
  get f() {
    return this.form.controls;
  }

  // Cast needed because TS can't infer the array's element type through `form.get(...)`.
  get phones() {
    return this.form.get('phones') as FormArray<FormControl<string>>;
  }

  ngOnInit() {
    // valueChanges is an Observable - every reactive-forms control streams its updates,
    // which is the "reactive" part of the name. Great for live previews like this without
    // manually wiring an (input) event handler.
    this.f['name'].valueChanges.subscribe((value: string) => {
      this.namePreview = value;
    });
  }

  addPhone() {
    // nonNullable: true means this control's value type excludes null/undefined and it
    // resets to '' instead of null - avoids constant null-checks in the template.
    this.phones.push(this.fb.control('', { nonNullable: true }));
  }

  removePhone(index: number) {
    // Guard so users can't remove the last remaining phone field.
    if (this.phones.controls.length <= 1) {
      return;
    }
    this.phones.removeAt(index);
  }

  onConfirmPassFocus() {
    // Manually mark password as touched so its error styling/messages can appear even though
    // the user is focusing the OTHER field - useful for surfacing the "passwords must match"
    // context right when they start confirming.
    this.f['password'].markAsTouched();
  }

  onSubmit() {
    // In a real app you'd check `this.form.valid` before doing anything with the value,
    // and probably use `this.form.value` (or `getRawValue()` if you have disabled controls).
    console.log(this.form);
  }
}

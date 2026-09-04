# Class 7 — Angular Forms: Template-driven & Reactive Forms

Forms are how your app collects data from a human — logins, registrations, checkouts, search bars. Angular gives you two complete, first-class ways to build them: **template-driven forms**, where the form model lives mostly in your HTML via `ngModel`, and **reactive forms**, where you build the form model explicitly in your TypeScript class with `FormGroup`/`FormControl`/`FormArray`. In this class you'll build a login form the template-driven way, a registration form (with a dynamic `FormArray` of phone numbers and cross-field validation) the reactive way, and see a reactive form wired into a real Angular Material stepper in the `mango` e-commerce app's checkout flow.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Template-driven Forms & ngModel](#template-driven-forms--ngmodel)
  - [FormsModule](#formsmodule)
  - [Reactive Forms: FormGroup & FormControl](#reactive-forms-formgroup--formcontrol)
  - [FormBuilder](#formbuilder)
  - [Validators (sync)](#validators-sync)
  - [Custom & Cross-field Validators](#custom--cross-field-validators)
  - [FormArray](#formarray)
  - [Form State: valid, touched, dirty, status](#form-state-valid-touched-dirty-status)
  - [valueChanges & Reactivity](#valuechanges--reactivity)
  - [Async Validators](#async-validators)
- [The mango app: where forms show up](#the-mango-app-where-forms-show-up)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Template-driven Forms & ngModel

`ngModel` is a directive that creates and manages a hidden `FormControl` for you behind an `<input>`, and `[(ngModel)]`/`ngModel` two-way binds it to a property or to Angular's automatic `NgForm`. You write validation as HTML attributes (`required`, `minlength`, `email`) instead of code.

**Why it exists:** it's the most approachable way to wire up a form — great for simple forms where you don't need much programmatic control, and it feels close to plain HTML.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  template: `
    <input name="username" ngModel required minlength="3" />
  `,
})
export class Signup {}
```

> **Note:** every `ngModel` inside a `<form>` needs a unique `name` attribute — Angular uses it to register the control with the parent `NgForm`. Forget it and you'll get a runtime error.

### FormsModule

`FormsModule` is the Angular package that provides `ngModel`, `ngForm`, and all the built-in template-driven validator directives (`required`, `email`, `minlength`, etc).

**Why it exists:** these directives aren't available by default — you opt in explicitly so Angular doesn't ship code you don't use.

```typescript
@Component({
  selector: 'app-root',
  imports: [FormsModule], // required, or ngModel binds to nothing and fails silently
  template: `<input ngModel name="q" />`,
})
export class App {}
```

### Reactive Forms: FormGroup & FormControl

In reactive forms, you build the form model yourself in the component class: a `FormGroup` is a named collection of `FormControl`s (and/or nested `FormGroup`s/`FormArray`s). The template binds to that model with `[formGroup]` and `formControlName` instead of `ngModel`.

**Why it exists:** the form's shape, validators, and state live in testable TypeScript, not scattered across template attributes. This scales much better for complex forms and lets you unit-test form logic without rendering anything.

```typescript
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
    </form>
  `,
})
export class Login {
  form = new FormGroup({
    email: new FormControl('', Validators.required),
  });
}
```

### FormBuilder

`FormBuilder` (injected via `inject(FormBuilder)`) is a small factory service that saves you from writing `new FormGroup({...})`/`new FormControl(...)` by hand — you call `fb.group({...})` and `fb.control(...)` instead.

**Why it exists:** pure convenience and readability — it removes boilerplate `new` calls, especially in forms with many controls.

```typescript
private fb = inject(FormBuilder);

form = this.fb.group({
  name: ['', Validators.required],
  age: [0],
});
```

### Validators (sync)

`Validators.required`, `Validators.email`, `Validators.minLength(n)`, etc. are built-in synchronous validator functions. A validator takes a control and returns either `null` (valid) or an errors object like `{ required: true }` (invalid).

**Why it exists:** validation is a common, repeatable concern — Angular ships the common cases so you don't reinvent them, and lets you compose several onto one control as an array.

```typescript
email: ['', [Validators.required, Validators.email]],
```

### Custom & Cross-field Validators

When the built-ins aren't enough (e.g. "passwords must match"), you write your own validator function with the same `(control) => ValidationErrors | null` signature. A validator attached to a `FormGroup` (rather than one control) can compare sibling controls.

**Why it exists:** some rules genuinely depend on more than one field at once, and a single `FormControl` has no way to see its siblings — only the parent `FormGroup` can.

```typescript
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const a = group.get('password')?.value;
  const b = group.get('confirmPassword')?.value;
  return a === b ? null : { passwordsMismatch: true };
}

form = this.fb.group(
  { password: [''], confirmPassword: [''] },
  { validators: passwordsMatch },
);
```

### FormArray

A `FormArray` is a resizable, ordered list of controls — use it when the number of fields in a form isn't fixed ahead of time (e.g. "add another phone number").

**Why it exists:** `FormGroup` needs a fixed set of named keys; `FormArray` lets you `push()`/`removeAt()` controls at runtime and loop over `.controls` in the template.

```typescript
phones = this.fb.array([this.fb.control('')]);

addPhone() {
  this.phones.push(this.fb.control(''));
}
```

```html
<div formArrayName="phones">
  @for (ctrl of phones.controls; track ctrl) {
    <input [formControl]="ctrl" />
  }
</div>
```

### Form State: valid, touched, dirty, status

Every control (and the form as a whole) tracks state flags: `valid`/`invalid`, `touched`/`untouched` (has it been blurred?), `dirty`/`pristine` (has the value changed?), and an overall `status` string (`'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'`).

**Why it exists:** you almost never want to show "this field is required" before the user has even touched it — these flags let you build good, non-annoying validation UX.

```html
@if (emailCtrl.invalid && emailCtrl.touched) {
  <p class="error">Email is required</p>
}
```

> **Note:** `markAsTouched()` can be called manually — handy for surfacing an error on a *related* field, like flagging the password field the moment the user focuses "confirm password".

### valueChanges & Reactivity

Every `FormControl`, `FormGroup`, and `FormArray` exposes a `valueChanges` Observable that emits every time its value updates.

**Why it exists:** this is the "reactive" in reactive forms — you can `.subscribe()` to build live previews, trigger async validation, debounce a search box, or sync derived state, all without a manual `(input)` event handler.

```typescript
this.form.get('name')!.valueChanges.subscribe((value) => {
  this.namePreview = value;
});
```

### Async Validators

An async validator has the same job as a sync one — return `null` for valid, an errors object for invalid — but it returns an `Observable` or `Promise` instead of the value directly. Angular subscribes for you, and while the request is in flight the control's `status` is `'PENDING'`.

**Why it exists:** some rules can only be answered by the server ("is this SKU already used?", "is this email registered?"). You can't answer those synchronously, so Angular gives async validators their own slot and their own pending state.

```typescript
// In the FormBuilder array shorthand the slots are:
// [initialValue, syncValidators, asyncValidators]
sku: ['', Validators.required, [this.validateSku.bind(this)]],

validateSku(control: AbstractControl): Observable<{ skuTaken: boolean } | null> {
  return this.api.isSkuTaken(control.value).pipe(
    map((taken) => (taken ? { skuTaken: true } : null)),
  );
}
```

> **Note:** the single biggest `FormBuilder` gotcha lives here. `['', Validators.required, Validators.minLength(3)]` looks like "two validators" but the third slot is for **async** validators — `minLength` lands in the wrong slot and never runs. Always group sync validators into one array: `['', [Validators.required, Validators.minLength(3)]]`.

> **Note:** async validators only run once every sync validator on that control passes. That's deliberate — no point asking the server about an empty field.

## The mango app: where forms show up

The `mango` e-commerce app now has two real reactive forms, and it's worth reading them side by side.

**1. Checkout — a form gating a Material stepper** (`src/app/components/checkout/`)

`[stepControl]="addressForm"` hands the whole `FormGroup` to a `mat-step`. The step refuses to advance while the group is invalid, so you get "you can't continue until this is filled in" without writing a single condition yourself.

```html
<mat-stepper [linear]="true">
  <mat-step [stepControl]="addressForm" label="Shipping Address">
    <form [formGroup]="addressForm">…</form>
    <button matStepperNext>Continue</button>
  </mat-step>
</mat-stepper>
```

The control names in `addressForm` match the `ShippingAddress` interface key-for-key, which is why `placeOrder()` can pass `this.addressForm.value` straight into the request body. Design your forms to mirror your API models and this conversion step disappears.

**2. Admin product form — FormArray + async validation** (`src/app/components/admin/product-form/`)

This one combines almost everything from the class: sync validators, a `compose()`d pair, an async SKU check, and a `FormArray` of image URLs the user can grow and shrink.

```typescript
form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  discountPercent: [0, Validators.compose([Validators.min(0), Validators.max(100)])],
  sku: ['', Validators.required, [this.validateSku.bind(this)]], // async slot
  images: this.fb.array(['https://picsum.photos/seed/product/600/400']),
});
```

Three details in that template are easy to get wrong:

| Detail | Why it matters |
|---|---|
| `type="button"` on the delete/add buttons | Inside a `<form>`, buttons default to `type="submit"` — without it, "Add image" submits the form. |
| `track ctrl` in the `@for` | Tracking the control instance keeps rows stable; tracking `$index` makes Angular reuse the wrong DOM node after a removal. |
| `[formControl]="ctrl"` (brackets) vs `formControlName="name"` (no brackets) | Inside a `FormArray` there are no names — you bind the control **instance**, so you need the brackets. |

**Supporting pieces worth a look:** `NotificationService` wraps `MatSnackBar` so no component repeats toast config; `AdminProductService` keeps write operations separate from the read-only `ProductService`; and `CreateProduct`/`CreateOrder` are deliberately smaller than `Product`/`Order` — the client sends ids and quantities, and the **server** computes totals so a price can't be faked from the browser.

## Theory

- **Template-driven vs reactive — the real philosophical difference**: template-driven forms are *asynchronous* and *implicit* — Angular builds the `FormControl`/`NgForm` tree for you behind the scenes as it processes the template, so the model isn't fully available until change detection runs. Reactive forms are *synchronous* and *explicit* — you construct the entire `FormGroup` tree upfront in TypeScript, so it exists and is fully typed/testable before the template ever renders. Pick reactive forms once a form has real complexity (dynamic fields, cross-field rules, unit tests); template-driven forms are fine for small, simple forms.
- **The control hierarchy**: `AbstractControl` is the abstract base class for all three concrete types — `FormControl` (a single value), `FormGroup` (a fixed set of named child controls), and `FormArray` (an ordered, resizable list of child controls). Validity, value, and state (touched/dirty) all bubble up the tree — a `FormGroup` is invalid if *any* child control is invalid, which is why you can check `form.invalid` once instead of checking every field.
- **Change detection and forms**: template-driven forms rely on Angular's change detection to notice `ngModel` updates (traditionally via zone.js patching input events); reactive forms don't need change detection to update their own state at all — `valueChanges`/`statusChanges` are plain RxJS streams updated synchronously the moment `.setValue()` or a user keystroke changes a control, independent of when a re-render happens.
- **Sync vs async validators**: the validators you've seen so far (`Validators.required`, your own functions) run synchronously and block form submission immediately. Angular also supports *async validators* (return an `Observable`/`Promise` of errors) for things like "check if this username is already taken" against a server — these set the control's status to `'PENDING'` while in flight, and you generally debounce them so you're not hitting the server on every keystroke.
- **updateOn**: by default, reactive form controls validate and emit `valueChanges` on every keystroke (`updateOn: 'change'`). You can configure `updateOn: 'blur'` or `'submit'` per control or for the whole form to avoid expensive/noisy validation running constantly — especially useful for async validators.

## Useful Links

| Topic | Link |
|---|---|
| Forms overview | [angular.dev/guide/forms](https://angular.dev/guide/forms) |
| Reactive forms | [angular.dev/guide/forms/reactive-forms](https://angular.dev/guide/forms/reactive-forms) |
| Template-driven forms | [angular.dev/guide/forms/template-driven-forms](https://angular.dev/guide/forms/template-driven-forms) |
| Form validation | [angular.dev/guide/forms/form-validation](https://angular.dev/guide/forms/form-validation) |
| Dynamic forms (FormArray) | [angular.dev/guide/forms/dynamic-forms](https://angular.dev/guide/forms/dynamic-forms) |
| `FormGroup` API | [angular.dev/api/forms/FormGroup](https://angular.dev/api/forms/FormGroup) |
| `FormControl` API | [angular.dev/api/forms/FormControl](https://angular.dev/api/forms/FormControl) |
| `FormArray` API | [angular.dev/api/forms/FormArray](https://angular.dev/api/forms/FormArray) |
| `Validators` API | [angular.dev/api/forms/Validators](https://angular.dev/api/forms/Validators) |
| Angular Material form field | [material.angular.dev/components/form-field/overview](https://material.angular.dev/components/form-field/overview) |
| Angular Material stepper | [material.angular.dev/components/stepper/overview](https://material.angular.dev/components/stepper/overview) |
| `AsyncValidatorFn` API | [angular.dev/api/forms/AsyncValidatorFn](https://angular.dev/api/forms/AsyncValidatorFn) |
| `FormBuilder` API | [angular.dev/api/forms/FormBuilder](https://angular.dev/api/forms/FormBuilder) |
| Material snack bar (notifications) | [material.angular.dev/components/snack-bar/overview](https://material.angular.dev/components/snack-bar/overview) |
| Lazy loading child routes | [angular.dev/guide/routing/common-router-tasks#lazy-loading](https://angular.dev/guide/routing/common-router-tasks) |
| RxJS Observables (for `valueChanges`) | [rxjs.dev/guide/observable](https://rxjs.dev/guide/observable) |

## Mini Examples

**1. A tiny template-driven search box**

```typescript
@Component({
  selector: 'app-search',
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="query" name="query" placeholder="Search..." />
    <p>Searching for: {{ query }}</p>
  `,
})
export class Search {
  query = '';
}
```

**2. A reactive form with an async username validator**

```typescript
function uniqueUsername(usersApi: UsersApi): AsyncValidatorFn {
  return (control) =>
    usersApi.isTaken(control.value).pipe(
      map((taken) => (taken ? { usernameTaken: true } : null)),
    );
}

username = new FormControl('', {
  validators: [Validators.required],
  asyncValidators: [uniqueUsername(this.usersApi)],
  updateOn: 'blur', // don't hit the server on every keystroke
});
```

**3. Disabling a control conditionally**

```typescript
form = this.fb.group({
  hasDiscount: [false],
  discountCode: [{ value: '', disabled: true }],
});

ngOnInit() {
  this.form.get('hasDiscount')!.valueChanges.subscribe((checked) => {
    checked
      ? this.form.get('discountCode')!.enable()
      : this.form.get('discountCode')!.disable();
  });
}
```

**4. A FormArray of skill tags**

```html
<div formArrayName="skills">
  @for (skill of skills.controls; track skill) {
    <input [formControl]="skill" />
  }
</div>
<button type="button" (click)="skills.push(fb.control(''))">Add skill</button>
```

**5. A debounced async validator that doesn't hammer the API**

```typescript
sku = new FormControl('', {
  validators: [Validators.required],
  asyncValidators: [
    (ctrl) => this.api.isSkuTaken(ctrl.value).pipe(
      debounceTime(400), // wait for a pause in typing
      map((taken) => (taken ? { skuTaken: true } : null)),
      first(),           // async validators must COMPLETE, or the control stays PENDING forever
    ),
  ],
  updateOn: 'blur',
});
```

**6. Showing the pending state while an async check runs**

```html
<input matInput formControlName="sku" />
@if (form.get('sku')?.pending) {
  <mat-hint>Checking availability…</mat-hint>
} @else if (form.get('sku')?.errors?.['skuTaken']) {
  <mat-error>SKU is already taken</mat-error>
}
```

## Practice Exercises

**Beginner**
- Build a template-driven "contact me" form with `name`, `email`, and `message` fields, each `required`, and show an error message under any field the user has touched but left invalid.

**Beginner**
- Convert the reactive registration form's `password` field to also require at least one digit, using an inline custom validator function (a regex check returning `{ noDigit: true }` when it fails).

**Intermediate**
- In the admin product form, disable the "Create Product" button while the form is invalid (`[disabled]="form.invalid"`) and add an early `if (this.form.invalid) { this.form.markAllAsTouched(); return; }` guard at the top of `submitForm()`. Explain why you want **both**.

**Intermediate**
- Add a `<mat-hint>Checking availability…</mat-hint>` to the SKU field that only shows while `form.get('sku')?.pending` is true, then raise the fake delay in `validateSku` to 2000ms so you can actually see it.

**Challenge**
- Make the admin product form work for **editing** too: `products/:id/edit` already routes to the same component, so read the `id` route param, fetch the product, and `patchValue()` the form (remember to rebuild the `images` FormArray — `patchValue` won't create controls that don't exist yet).

**Challenge**
- Build a reactive "shipping addresses" form where users can add/remove multiple addresses using a `FormArray` of `FormGroup`s (each with its own `street`/`city`/`postalCode` validators), and show a form-level error if two addresses are identical.

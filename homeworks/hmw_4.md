# Homework 4 — Nestly, now hosts can list a stay

You're extending **Nestly** again — the app from Homework 1 (components), Homework 2 (routing),
and Homework 3 (real HTTP calls to `nestly-server`). This time you're adding the one thing every
listings site needs: a form so a host can add a new stay. You'll build it with **Reactive
Forms**, the same way `example2_reactive-forms` and `mango`'s checkout page did in Class 7.

## Goal

A new `/host/new` route with a form that lets a user fill in a new stay's details, validates
everything client-side before it's submittable, and — on submit — sends the data to
`nestly-server` with a `POST` request and navigates to the new stay's detail page.

## What you must use

Everything from Homework 1, 2, and 3 still applies — your components, routes, pipes, directive,
and `StaysService` should all keep working. On top of that:

| Concept | Where to use it | From |
|---|---|---|
| `ReactiveFormsModule` | Imported into your new form component | Class 7 |
| `FormBuilder` + `FormGroup` | Building the "add a stay" form | Class 7 |
| `Validators` (built-in) | `required`, `minLength`, `min`/`max`, `pattern` for the URL field | Class 7 |
| A custom validator function | See "Custom validation" below | Class 7 |
| A cross-field validator | See "Cross-field validation" below | Class 7 |
| `FormArray` | Letting a host add multiple photo URLs (or amenities) | Class 7 |
| Displaying validation errors | Only after a field is `touched` or `dirty` — don't shame the user before they've typed anything | Class 7 |
| `[formGroup]`, `formControlName`, `formArrayName` | Wiring the template to the form | Class 7 |
| Disabling the submit button while invalid or while the request is in flight | — | Class 7 |

## Form fields

Build a `FormGroup` that mirrors (a slightly extended) `Stay`:

```ts
interface NewStay {
  title: string;
  location: string;
  pricePerNight: number;
  description: string;
  superhost: boolean;
  photos: string[]; // at least 1, via FormArray
}
```

| Field | Control type | Validation |
|---|---|---|
| `title` | text input | required, minLength 5 |
| `location` | text input | required |
| `pricePerNight` | number input | required, min 10, max 5000 |
| `description` | textarea | required, minLength 20 |
| `superhost` | checkbox | none |
| `photos` | `FormArray` of text inputs | at least 1 photo, each a valid-looking URL (see custom validator) |

## Custom validation

Write a standalone validator function (not inline in the component) for the photo URL fields:

```ts
export function urlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null; // let `required` handle emptiness
  const looksLikeUrl = /^https?:\/\/.+/.test(value);
  return looksLikeUrl ? null : { invalidUrl: true };
}
```

> **Note:** this is deliberately simple — a real URL validator would be stricter, but the point
> here is writing *your own* `ValidatorFn`, not regex golf.

## Cross-field validation

Add a validator on the whole `FormGroup` (not a single control) that requires `title` and
`location` to be different strings — a host can't name a stay the same as its location (a made-up
rule, purely so you practice group-level validators like the ones in
`example2_reactive-forms`):

```ts
export function titleLocationValidator(group: AbstractControl): ValidationErrors | null {
  const title = group.get('title')?.value?.trim().toLowerCase();
  const location = group.get('location')?.value?.trim().toLowerCase();
  return title && location && title === location ? { sameAsTitle: true } : null;
}
```

Show this error near the bottom of the form, not attached to a single field, since it belongs to the group.

## Backend

`nestly-server` already supports creating a stay — check `/api/docs` (Swagger) for the exact
`POST /api/stays` request body shape and required fields before wiring up your service call. Add
a `createStay(stay: NewStay): Observable<Stay>` method to your existing `StaysService` — don't
create a second service.

## Behavior requirements

1. Add a "List your stay" link (`routerLink`) somewhere visible (navbar or listings page) that
   navigates to `/host/new`.
2. The submit button is disabled while the form is invalid, and again while the create request is
   in flight (prevent double-submits).
3. Each invalid, touched field shows a specific, human-readable error message — not just a red
   border.
4. Submitting a valid form calls `StaysService.createStay(...)`, and on success navigates to
   `stays/:id` for the newly created stay (reuse your Homework 2 route).
5. If the request fails (e.g. server down), show an error message and leave the form filled in —
   don't reset it and make the user retype everything.
6. A host can add and remove photo URL fields dynamically (at least 1 must remain).

## Self-check before submitting

- [ ] The form is built with `FormBuilder`/`FormGroup`, not `ngModel`.
- [ ] Every field has appropriate validators, and errors only show after `touched`/`dirty`.
- [ ] At least one custom `ValidatorFn` and one cross-field (group-level) validator are used.
- [ ] Photos are a `FormArray` — you can add/remove entries, with a minimum of 1.
- [ ] Submit is disabled while invalid and while submitting.
- [ ] A successful submit calls the real API and navigates to the new stay's detail page.
- [ ] A failed submit shows an error and preserves the user's input.
- [ ] Everything from Homework 1, 2, and 3 still works.

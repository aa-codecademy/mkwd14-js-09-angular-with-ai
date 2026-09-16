# Class 14 — Building Your Own Features: Directives, Dynamic Components & Confirmation Flows

Up to now you've used Angular's building blocks: components someone else declared in a template, dialogs from a library, `@if` to hide things. In this class you go one level down and **build the primitives yourself**. You'll write a structural directive that adds and removes DOM based on the logged-in user's role, create a component from scratch in TypeScript with no template tag anywhere, and wrap it in a service that hands you back a `Promise<boolean>` so "are you sure?" becomes a single `await`. Then you'll wire that flow into a real feature — cancelling an order — on both the customer page and the admin table.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Structural directives](#structural-directives)
  - [TemplateRef and ViewContainerRef](#templateref-and-viewcontainerref)
  - [Making a directive reactive with effect()](#making-a-directive-reactive-with-effect)
  - [Dynamic components with createComponent()](#dynamic-components-with-createcomponent)
  - [setInput() and why you can't just assign](#setinput-and-why-you-cant-just-assign)
  - [Wrapping a dialog in a Promise](#wrapping-a-dialog-in-a-promise)
  - [Dumb components: input() in, output() out](#dumb-components-input-in-output-out)
  - [The confirm-then-act pattern](#the-confirm-then-act-pattern)
  - [Cancelling an order end to end](#cancelling-an-order-end-to-end)
  - [takeUntilDestroyed](#takeuntildestroyed)
- [Theory](#theory)
  - [Why `*ngIf` has a star](#why-ngif-has-a-star)
  - [The three ways to put a component on screen](#the-three-ways-to-put-a-component-on-screen)
  - [Promise or Observable?](#promise-or-observable)
  - [Refetch vs. patch after a write](#refetch-vs-patch-after-a-write)
  - [Known rough edges in this code](#known-rough-edges-in-this-code)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Structural directives

A **structural** directive doesn't change how an element looks — it decides whether that element exists in the DOM at all. `*ngIf`, `*ngFor` and your own `*appPermission` are all the same kind of thing.

**Mental model:** Angular hands you a *blueprint* of some markup plus a *slot* in the page, and steps back. You decide if and when to stamp the blueprint into the slot.

```ts
@Directive({ selector: '[appPermission]' })
export class PermissionDirective {
  allowedRole = input.required<UserRole>();
}
```

> **Note:** for the `*appPermission="'ADMIN'"` shorthand to bind, the input name must match the selector. In this repo the input is called `allowedRole`, so either rename it or add `input.required<UserRole>({ alias: 'appPermission' })`.

### TemplateRef and ViewContainerRef

These two always come as a pair, and mixing them up is the number one structural-directive bug.

| | What it is | What you do with it |
|---|---|---|
| `TemplateRef` | The markup you wrapped, as an unrendered blueprint | `createEmbeddedView(tpl)` |
| `ViewContainerRef` | The position in the DOM where output goes | `clear()`, `createEmbeddedView(...)` |

```ts
templateRef = inject(TemplateRef);
viewContainerRef = inject(ViewContainerRef);

this.viewContainerRef.clear();                          // remove what's there
this.viewContainerRef.createEmbeddedView(this.templateRef); // stamp it out
```

**Why `clear()` first:** `createEmbeddedView` *adds*. Call it twice without clearing and you get two copies of the element side by side.

### Making a directive reactive with effect()

The user's role can change while the page is open — they log out, or a refresh token brings back a different user. `effect()` re-runs your logic automatically whenever a signal it read has changed.

```ts
effect(() => {
  // Reading currentUser() HERE is what subscribes us to it.
  const isAllowed = this.allowedRole() === this.authStore.currentUser()?.role;

  this.viewContainerRef.clear();
  if (isAllowed) this.viewContainerRef.createEmbeddedView(this.templateRef);
});
```

No subscription, no `ngOnDestroy` — the effect dies with the directive.

> **Note:** `effect()` must be created in an **injection context**: a field initialiser or the constructor. Call it from `ngOnInit` and you get `NG0203` unless you pass `{ injector: inject(Injector) }`. The code in this class does exactly that — fixing it is one of the exercises.

### Dynamic components with createComponent()

A confirmation dialog shouldn't require every page to add `<app-confirmation-dialog>` to its template "just in case". So you build it in code instead.

```ts
const ref = createComponent(ConfirmationDialogComponent, {
  environmentInjector: this.injector,
});

this.appRef.attachView(ref.hostView);                        // change detection ON
document.body.appendChild(ref.location.nativeElement);       // now it's visible
```

Those last two lines are both required and do different jobs. `attachView` makes the bindings live; `appendChild` puts the element on the page. Skip the first and your dialog renders once and then freezes. Skip the second and nothing appears at all.

And tearing it down matters just as much:

```ts
private destroy(ref: ComponentRef<any>) {
  this.appRef.detachView(ref.hostView);
  ref.destroy(); // runs ngOnDestroy and removes the host element
}
```

Forget this and every confirmation leaves an invisible dialog behind, still being change-detected on every tick.

### setInput() and why you can't just assign

With no template, there's no `[title]="..."` binding to write. You push values in through the component ref:

```ts
ref.setInput('title', title);
ref.setInput('message', message);
```

**Why not `ref.instance.title = title`?** Because that bypasses Angular entirely — it sets the field but never marks the view dirty, so the screen keeps showing the old value. `setInput()` sets the value *and* schedules the re-render.

> **Note:** `setInput` takes the input's name as a **string**, so TypeScript can't catch a typo. Misspell it and you get a runtime error, not a compile error.

### Wrapping a dialog in a Promise

The dialog emits events. Your calling code wants an answer. A `Promise` is the bridge.

```ts
confirm(title: string, message: string, confirmationLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    // ...create the component...
    ref.instance.confirm.subscribe(() => { this.destroy(ref); resolve(true); });
    ref.instance.cancel.subscribe(()  => { this.destroy(ref); resolve(false); });
  });
}
```

A promise settles **exactly once**, which is a free bug fix: a frantic double-click can't produce two answers.

### Dumb components: input() in, output() out

`ConfirmationDialogComponent` knows nothing about orders, stores or HTTP. It renders text and shouts when a button is clicked. That's *why* it's reusable.

```ts
title = input.required<string>();
confirm = output<void>();
cancel = output<void>();
```

The dialog never closes itself — it reports the click and lets the service decide what that means. Teach a dumb component about your feature and it stops being reusable in the next one.

> **Note:** `input.required()` with no type argument infers `unknown`. It renders fine but you lose all type safety. Always write `input.required<string>()`.

### The confirm-then-act pattern

`async/await` turns "ask, then act" into a flat, top-to-bottom read:

```ts
async handleCancellation(orderId: number) {
  const confirmation = await this.confirmationService.confirm(
    `Are you sure you want to cancel order #${orderId}?`,
    'The order will be called off and the items returned to stock. This cannot be undone.',
    'Cancel order',
  );

  if (!confirmation) return; // guard clause - bail out early on "no"

  this.store.cancelOrder(orderId);
}
```

Notice the template calls `handleCancellation(order.id)`, **not** the store directly. Templates should ask; components decide.

### Cancelling an order end to end

The store method chains three steps: flip the spinner on, send the PATCH, then refetch the list.

```ts
cancelOrder: rxMethod<number>(
  pipe(
    tap(() => patchState(store, { loading: true })),
    switchMap((orderId) =>
      orderService.cancelOrder(orderId).pipe(
        tap(() => notificationService.showSuccess('Order canceled successfully.')),
        catchError((err) => {
          patchState(store, { loading: false });
          notificationService.showError(err.error.message || 'Error while canceling order.');
          return of(null); // swallow it - see the note below
        }),
      ),
    ),
    mergeMap(() => orderService.getMyOrders().pipe(/* setAllEntities */)),
  ),
)
```

Two things worth slowing down for:

- **`catchError` returning `of(null)` keeps the `rxMethod` alive.** Let the error escape and the whole pipe completes — the *next* click silently does nothing. This is the single most common signal-store bug.
- The API call is a **PATCH**, not a DELETE. Cancelling changes one field; the order stays in history so the customer and support can still see it.

On the API side:

```ts
cancelOrder(orderId: number): Observable<Order> {
  return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, {
    status: 'CANCELLED',
  });
}
```

And the button only exists while cancelling still makes sense:

```html
@if (order.status === 'PENDING') {
  <button mat-stroked-button color="warn" (click)="handleCancellation(order.id)">
    <mat-icon>cancel</mat-icon> Cancel Order
  </button>
}
```

### takeUntilDestroyed

Checkout navigates away as soon as the order succeeds. If the request is still in flight when the component dies, the callback still runs — on a component that no longer exists.

```ts
this.orderService
  .create(body)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({ /* ... */ });
```

`takeUntilDestroyed()` with no argument only works in an injection context. Outside one — like inside a method — you must pass `inject(DestroyRef)`, which is why the component holds a `destroyRef` field.

## Theory

### Why `*ngIf` has a star

The star is pure syntax sugar. Angular rewrites this:

```html
<a *appPermission="'ADMIN'" routerLink="/admin">Admin</a>
```

into this:

```html
<ng-template appPermission [appPermission]="'ADMIN'">
  <a routerLink="/admin">Admin</a>
</ng-template>
```

Once you see the desugared form, everything about structural directives clicks: the `<ng-template>` is your `TemplateRef` (markup that exists but isn't rendered), and its position in the DOM is your `ViewContainerRef`. That's also why **two structural directives can't sit on one element** — they'd both want the same template.

### The three ways to put a component on screen

| Way | Looks like | Use it when |
|---|---|---|
| Template tag | `<app-dialog />` | The parent always knows it needs this child |
| Structural directive | `@if`, `*appPermission` | The child exists conditionally, in a known place |
| `createComponent()` | TypeScript only | A **service** needs UI, or the place/type isn't known until runtime |

The confirmation dialog is case three: any component in the app can ask a question, and none of them should have to make room for the dialog in advance.

### Promise or Observable?

Both represent "a value later". Pick by asking **how many values, and can I cancel?**

| | Promise | Observable |
|---|---|---|
| Emits | Exactly one, ever | Zero to many |
| Starts | Immediately on creation | Only when subscribed |
| Cancellable | No | Yes (unsubscribe) |
| `await`-able | Yes | Only via `firstValueFrom()` |

A dialog answer is one value that can't be un-answered — a natural `Promise`. An HTTP request you might want to abandon, or a stream of store updates, is a natural `Observable`. Don't convert one to the other out of habit; convert when the shape of the question changes.

### Refetch vs. patch after a write

After cancelling, the store throws away its list and asks the server for a fresh one. It could instead patch just that one order's status locally — one fewer request.

Refetching wins here because the server may have changed more than you asked for: stock returns to inventory, totals recalculate, a status might land as something other than `CANCELLED`. One extra GET is cheap; a UI that quietly disagrees with the database is expensive. Reach for a local patch only when the list is huge or the update is very hot.

### Known rough edges in this code

This is teaching code, and a few things in it are deliberately (or accidentally) imperfect. Spotting them is part of the class:

- **`effect()` inside `ngOnInit`** in `PermissionDirective` throws `NG0203` — it needs the constructor or an explicit injector.
- **The input name doesn't match the selector**, so `*appPermission="'ADMIN'"` won't bind `allowedRole`.
- **The refetch runs even after a failed cancel**, because `catchError` turned the failure into a successful `of(null)` before `mergeMap` ran.
- **`input.required()` is untyped** in the dialog, so every value is `unknown`.
- **Nothing closes the dialog on `Escape` or on a backdrop click** — keyboard users are stuck with the mouse.

## Useful Links

| Topic | Link |
|---|---|
| Structural directives | https://angular.dev/guide/directives/structural-directives |
| Writing custom directives | https://angular.dev/guide/directives/attribute-directives |
| `TemplateRef` | https://angular.dev/api/core/TemplateRef |
| `ViewContainerRef` | https://angular.dev/api/core/ViewContainerRef |
| `createComponent()` | https://angular.dev/api/core/createComponent |
| `ComponentRef` (incl. `setInput`) | https://angular.dev/api/core/ComponentRef |
| `ApplicationRef` | https://angular.dev/api/core/ApplicationRef |
| Signal `effect()` | https://angular.dev/guide/signals#effects |
| Signal inputs | https://angular.dev/guide/components/inputs |
| Component outputs | https://angular.dev/guide/components/outputs |
| `takeUntilDestroyed` | https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed |
| NgRx `rxMethod` | https://ngrx.io/guide/signals/rxjs-integration |
| NgRx entity helpers | https://ngrx.io/guide/signals/signal-store/entity-management |
| Angular Material Dialog (the built-in alternative) | https://material.angular.io/components/dialog |
| MDN — `Promise` | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise |
| MDN — `inset` | https://developer.mozilla.org/en-US/docs/Web/CSS/inset |

## Mini Examples

### 1. A structural directive that repeats N times

Same primitives as `PermissionDirective`, no auth involved — proof that the pattern is about DOM, not roles.

```ts
@Directive({ selector: '[appRepeat]' })
export class RepeatDirective {
  times = input.required<number>({ alias: 'appRepeat' });

  private tpl = inject(TemplateRef<{ $implicit: number }>);
  private vcr = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.vcr.clear();
      // The context object is what `let i` in the template binds to.
      for (let i = 0; i < this.times(); i++) {
        this.vcr.createEmbeddedView(this.tpl, { $implicit: i });
      }
    });
  }
}

// <span *appRepeat="3; let i">star {{ i }}</span>
```

### 2. A toast service built with createComponent()

The confirmation pattern minus the promise — fire and forget.

```ts
@Injectable({ providedIn: 'root' })
export class ToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  show(text: string) {
    const ref = createComponent(ToastComponent, { environmentInjector: this.injector });
    ref.setInput('text', text);
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);

    // Always clean up on a timer too - otherwise the node lives forever.
    setTimeout(() => { this.appRef.detachView(ref.hostView); ref.destroy(); }, 3000);
  }
}
```

### 3. Closing the dialog with the Escape key

```ts
export class ConfirmationDialogComponent {
  cancel = output<void>();

  // HostListener wires a DOM event on the HOST element. 'document:keydown.escape' listens
  // globally, so focus doesn't have to be inside the dialog for it to work.
  @HostListener('document:keydown.escape')
  onEscape() {
    this.cancel.emit();
  }
}
```

### 4. Turning the promise back into an observable

Sometimes you're already in a pipe and don't want to break out into `async/await`.

```ts
// `from()` converts a Promise into an Observable that emits once and completes.
from(this.confirmationService.confirm('Delete?', 'This is permanent.', 'Delete'))
  .pipe(
    filter(Boolean),                       // drop the "no" - nothing downstream runs
    switchMap(() => this.orderService.cancelOrder(id)),
  )
  .subscribe();
```

## Practice Exercises

### Beginner — type the dialog inputs

`ConfirmationDialogComponent` declares `input.required()` with no type argument, so every value is `unknown`.

- Give all three inputs an explicit `<string>`.
- Then try passing a number from `ConfirmationService` and watch where the error appears — and where it *doesn't*, because `setInput` takes a string key.

### Beginner — use the directive in the navbar

The navbar still guards the Admin link with `@if (store.isAdmin())`.

- Replace it with `*appPermission="'ADMIN'"`.
- It won't work at first. Fix the two reasons why (read the [rough edges](#known-rough-edges-in-this-code) section).
- Prove it's reactive: log out with the page open and watch the link vanish without a reload.

### Beginner — fix the effect

Move the `effect()` in `PermissionDirective` out of `ngOnInit` and into the constructor.

- Confirm the `NG0203` error disappears.
- Then write one sentence explaining, in your own words, what "injection context" means.

### Intermediate — make the dialog dismissible

Right now the only way out is the two buttons.

- Close on `Escape` (see mini example 3).
- Close when the user clicks the dark backdrop — but **not** when they click inside the card.
- Both should resolve the promise with `false`, exactly like Cancel.

**Hint:** for the backdrop, check `event.target === event.currentTarget` on the overlay's click handler.

### Intermediate — don't refetch after a failed cancel

In `OrdersStore.cancelOrder`, the `mergeMap` refetch runs even when the PATCH failed, because `catchError` already turned the failure into a success.

- Restructure so the refetch only runs on the success path.
- Test it by pointing `cancelOrder` at a bad URL: you should see one error toast and **no** follow-up GET in the Network tab.

### Intermediate — a reusable `appPermission` that takes many roles

`allowedRole` accepts exactly one role, so showing something to two different roles means two directives.

- Change the input to accept `UserRole | UserRole[]`.
- Keep the single-role usage working unchanged.
- Add an "unless" variant — `*appPermissionExcept="'USER'"` — and say which one you'd rather maintain, and why.

### Challenge — make the dialog accessible

Screen-reader users currently get nothing useful from this dialog.

- Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` / `aria-describedby` pointing at the title and message.
- Move focus to the confirm button when it opens, and **back to the element that opened it** when it closes.
- Trap Tab inside the dialog so focus can't wander into the page behind.
- Then open Angular Material's `MatDialog` source and compare. Write three sentences on when you'd build this yourself versus reach for the library.

### Challenge — one dialog at a time

Call `confirm()` twice in a row without awaiting and you get two stacked dialogs, both live.

- Keep a reference to the currently-open dialog in the service.
- Decide the policy — queue the second one, reject it, or replace the first — and defend your choice in a comment.
- Prove the old component ref is actually destroyed, not just hidden, using the Angular DevTools component tree.

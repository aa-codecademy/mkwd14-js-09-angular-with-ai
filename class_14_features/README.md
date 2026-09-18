# Class 14 — Building Your Own Features: Directives, Dynamic Components, Confirmation Flows & i18n

Up to now you've used Angular's building blocks: components someone else declared in a template, dialogs from a library, `@if` to hide things. In this class you go one level down and **build the primitives yourself**. You'll write a structural directive that adds and removes DOM based on the logged-in user's role, create a component from scratch in TypeScript with no template tag anywhere, and wrap it in a service that hands you back a `Promise<boolean>` so "are you sure?" becomes a single `await`. Then you'll wire that flow into a real feature — cancelling an order — on both the customer page and the admin table. In the second half you make the whole app speak two languages with **ngx-translate**, localise Material's own paginator labels, and ship a **reset-password** form that proves template-driven forms, a custom validator and translated server errors can live together comfortably.

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
  - [Internationalisation with ngx-translate](#internationalisation-with-ngx-translate)
  - [The translate pipe and parameters](#the-translate-pipe-and-parameters)
  - [Translating outside a template](#translating-outside-a-template)
  - [APP_INITIALIZER: work that must finish before the app starts](#app_initializer-work-that-must-finish-before-the-app-starts)
  - [Localising Material with MatPaginatorIntl](#localising-material-with-matpaginatorintl)
  - [The language switcher](#the-language-switcher)
  - [Reset password: a template-driven form end to end](#reset-password-a-template-driven-form-end-to-end)
  - [Custom validators with NG_VALIDATORS](#custom-validators-with-ng_validators)
- [Theory](#theory)
  - [Why `*ngIf` has a star](#why-ngif-has-a-star)
  - [The three ways to put a component on screen](#the-three-ways-to-put-a-component-on-screen)
  - [Promise or Observable?](#promise-or-observable)
  - [Refetch vs. patch after a write](#refetch-vs-patch-after-a-write)
  - [Store the key, not the sentence](#store-the-key-not-the-sentence)
  - [ngx-translate vs. Angular's built-in @angular/localize](#ngx-translate-vs-angulars-built-in-angularlocalize)
  - [Known rough edges in this code](#known-rough-edges-in-this-code)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Structural directives

A **structural** directive doesn't change how an element looks — it decides whether that element exists in the DOM at all. `*ngIf`, `*ngFor` and your own `*appPermission` are all the same kind of thing.

**Mental model:** Angular hands you a _blueprint_ of some markup plus a _slot_ in the page, and steps back. You decide if and when to stamp the blueprint into the slot.

```ts
@Directive({ selector: "[appPermission]" })
export class PermissionDirective {
  allowedRole = input.required<UserRole>();
}
```

> **Note:** for the `*appPermission="'ADMIN'"` shorthand to bind, the input name must match the selector. In this repo the input is called `allowedRole`, so either rename it or add `input.required<UserRole>({ alias: 'appPermission' })`.

### TemplateRef and ViewContainerRef

These two always come as a pair, and mixing them up is the number one structural-directive bug.

|                    | What it is                                         | What you do with it                  |
| ------------------ | -------------------------------------------------- | ------------------------------------ |
| `TemplateRef`      | The markup you wrapped, as an unrendered blueprint | `createEmbeddedView(tpl)`            |
| `ViewContainerRef` | The position in the DOM where output goes          | `clear()`, `createEmbeddedView(...)` |

```ts
templateRef = inject(TemplateRef);
viewContainerRef = inject(ViewContainerRef);

this.viewContainerRef.clear(); // remove what's there
this.viewContainerRef.createEmbeddedView(this.templateRef); // stamp it out
```

**Why `clear()` first:** `createEmbeddedView` _adds_. Call it twice without clearing and you get two copies of the element side by side.

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

this.appRef.attachView(ref.hostView); // change detection ON
document.body.appendChild(ref.location.nativeElement); // now it's visible
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
ref.setInput("title", title);
ref.setInput("message", message);
```

**Why not `ref.instance.title = title`?** Because that bypasses Angular entirely — it sets the field but never marks the view dirty, so the screen keeps showing the old value. `setInput()` sets the value _and_ schedules the re-render.

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

`ConfirmationDialogComponent` knows nothing about orders, stores or HTTP. It renders text and shouts when a button is clicked. That's _why_ it's reusable.

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
        tap(() =>
          notificationService.showSuccess("Order canceled successfully."),
        ),
        catchError((err) => {
          patchState(store, { loading: false });
          notificationService.showError(
            err.error.message || "Error while canceling order.",
          );
          return of(null); // swallow it - see the note below
        }),
      ),
    ),
    mergeMap(() => orderService.getMyOrders().pipe(/* setAllEntities */)),
  ),
);
```

Two things worth slowing down for:

- **`catchError` returning `of(null)` keeps the `rxMethod` alive.** Let the error escape and the whole pipe completes — the _next_ click silently does nothing. This is the single most common signal-store bug.
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
  .subscribe({/* ... */});
```

`takeUntilDestroyed()` with no argument only works in an injection context. Outside one — like inside a method — you must pass `inject(DestroyRef)`, which is why the component holds a `destroyRef` field.

### Internationalisation with ngx-translate

**i18n** (i, 18 letters, n) means getting every user-facing string out of your components and into data files, one per language. You register the library once and it loads `/i18n/en.json` or `/i18n/mk.json` over HTTP on demand.

**Mental model:** your templates stop containing text. They contain **keys**. A JSON file per language turns keys into text.

```ts
// app.config.ts
provideTranslateService({
  loader: provideTranslateHttpLoader({ prefix: "/i18n/", suffix: ".json" }),
  fallbackLang: "en", // used when a key is missing from the active language
  lang: "en",
});
```

```json
// public/i18n/en.json — nest freely, the key is the dotted path
{ "nav": { "myOrders": "My orders" } }
```

> **Note:** the files live in `public/`, not `src/`. Anything under `public/` is copied to the build output as-is, which is exactly what an HTTP loader needs.

### The translate pipe and parameters

`TranslatePipe` is **standalone**, so every component that uses it must list it in its own `imports`. There is no global pipe registry any more — forgetting this gives you `The pipe 'translate' could not be found`.

```html
{{ 'nav.myOrders' | translate }}

<!-- Parameters: the object's keys match {{ }} placeholders inside the JSON value -->
{{ 'paginator.range' | translate: { start: 1, end: 10, length: 42 } }}
```

```json
{ "paginator": { "range": "{{start}} - {{end}} of {{length}}" } }
```

The pipe is **impure** on purpose: it re-renders when the language changes, which a normal pure pipe would not do.

### Translating outside a template

Services have no template, so they use `TranslateService` directly. Two methods, and the difference matters:

| Method         | Returns                   | Use when                                |
| -------------- | ------------------------- | --------------------------------------- |
| `instant(key)` | the string, synchronously | the language file is **already loaded** |
| `get(key)`     | an `Observable<string>`   | you cannot be sure it has loaded yet    |

```ts
this.notificationService.showSuccess(
  this.translate.instant("resetPassword.success"),
);
```

**Why `instant()` is safe here:** `APP_INITIALIZER` finished loading the file before the app rendered. Call `instant()` before that and you get the raw key back — a bug that looks like `resetPassword.success` sitting in your UI.

### APP_INITIALIZER: work that must finish before the app starts

Some setup has to complete _before_ the first component renders. `APP_INITIALIZER` is a multi-provider of factory functions; Angular waits for every returned promise/observable before bootstrapping.

```ts
function initLanguage(language: LanguageService) {
  return () => language.init(); // return the promise/observable so Angular WAITS
}

{ provide: APP_INITIALIZER, useFactory: initLanguage, deps: [LanguageService], multi: true }
```

**Why bother:** without it the app renders in English, then snaps to Macedonian a moment later — a visible flash of the wrong language.

> **Note:** `multi: true` again. Drop it and you _replace_ every other initialiser instead of adding to the list.

### Localising Material with MatPaginatorIntl

`<mat-paginator>` has no inputs for "Items per page". Material instead puts all of its strings in an injectable service, `MatPaginatorIntl`, and expects you to swap it out.

```ts
{ provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl }
```

```ts
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private updateLabels() {
    this.itemsPerPageLabel = this.translate.instant("paginator.itemsPerPage");
    // `changes` is a Subject the paginator subscribes to. Emitting is what makes an
    // ALREADY-RENDERED paginator repaint - setting the fields alone does nothing.
    this.changes.next();
  }
}
```

`getRangeLabel` is a **property holding an arrow function**, not a method — that is why the override uses `=` and not a normal method body.

### The language switcher

```html
<button mat-button [matMenuTriggerFor]="languageMenu">
  <mat-icon>language</mat-icon> {{ languageService.currentLang() | uppercase }}
</button>
<mat-menu #languageMenu="matMenu">
  @for (lang of languageService.available; track lang) {
  <button mat-menu-item (click)="languageService.use(lang)">
    {{ lang | uppercase }}
  </button>
  }
</mat-menu>
```

`currentLang` is a **signal**, so the label updates by itself. `use()` does four things in one place: tell ngx-translate, update the signal, persist to `localStorage`, and set `<html lang>` (which screen readers and browser translation prompts read).

### Reset password: a template-driven form end to end

Three fields, three lessons.

```html
<form
  #passwordForm="ngForm"
  (ngSubmit)="onSubmit(passwordForm)"
  novalidate
></form>
```

- `#passwordForm="ngForm"` **exports** Angular's `NgForm` instance into a template variable, so you can read `.invalid` and pass the whole form to the handler.
- `novalidate` turns off the browser's native bubbles — Angular owns validation now.
- Splitting `[(ngModel)]` into `[ngModel]` + `(ngModelChange)` lets you do something extra on each keystroke, here clearing the server error:

```html
<input
  [ngModel]="model.currentPassword"
  (ngModelChange)="store.clearPasswordError()"
/>
```

The store keeps a translation **key** (`'resetPassword.incorrectCurrent'`), and the template pipes it through `| translate`. The message therefore follows a language switch.

> **Note:** `onSubmit` still checks `form.valid` even though the button is `[disabled]`. The disabled button is UI; the guard is the real gate.

### Custom validators with NG_VALIDATORS

"Do these two passwords match?" is not a built-in validator, so you write a directive that registers itself into Angular's validator list.

```ts
@Directive({
  selector: "[appMatchPassword]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MatchPasswordDirective,
      multi: true,
    },
  ],
})
export class MatchPasswordDirective implements Validator {
  @Input() matchTarget = "";

  // Contract: null means VALID. An object means invalid, and its key is what the
  // template looks up via control.errors?.['passwordMissMatch'].
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === this.matchTarget
      ? null
      : { passwordMissMatch: true };
  }
}
```

**Why `useExisting` and not `useClass`:** you want the _same instance_ Angular already created for this element, because that instance is the one holding the `matchTarget` input.

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

| Way                  | Looks like              | Use it when                                                         |
| -------------------- | ----------------------- | ------------------------------------------------------------------- |
| Template tag         | `<app-dialog />`        | The parent always knows it needs this child                         |
| Structural directive | `@if`, `*appPermission` | The child exists conditionally, in a known place                    |
| `createComponent()`  | TypeScript only         | A **service** needs UI, or the place/type isn't known until runtime |

The confirmation dialog is case three: any component in the app can ask a question, and none of them should have to make room for the dialog in advance.

### Promise or Observable?

Both represent "a value later". Pick by asking **how many values, and can I cancel?**

|              | Promise                 | Observable                  |
| ------------ | ----------------------- | --------------------------- |
| Emits        | Exactly one, ever       | Zero to many                |
| Starts       | Immediately on creation | Only when subscribed        |
| Cancellable  | No                      | Yes (unsubscribe)           |
| `await`-able | Yes                     | Only via `firstValueFrom()` |

A dialog answer is one value that can't be un-answered — a natural `Promise`. An HTTP request you might want to abandon, or a stream of store updates, is a natural `Observable`. Don't convert one to the other out of habit; convert when the shape of the question changes.

### Refetch vs. patch after a write

After cancelling, the store throws away its list and asks the server for a fresh one. It could instead patch just that one order's status locally — one fewer request.

Refetching wins here because the server may have changed more than you asked for: stock returns to inventory, totals recalculate, a status might land as something other than `CANCELLED`. One extra GET is cheap; a UI that quietly disagrees with the database is expensive. Reach for a local patch only when the list is huge or the update is very hot.

### Store the key, not the sentence

When an API call fails, it is tempting to `patchState(store, { passwordError: 'Wrong password' })`. Don't. Store `'resetPassword.incorrectCurrent'` and translate at render time.

The difference shows the moment the user flips the language switcher with the error on screen: a stored sentence is frozen in the language it was created in, a stored key re-renders. The same logic applies to anything you keep in state that a human will read.

### ngx-translate vs. Angular's built-in @angular/localize

Angular ships its own i18n (`i18n` attributes, `$localize`). It is **build-time**: you produce one compiled bundle per language and the server picks one. That is faster at runtime and it can translate attributes the compiler sees, but you cannot change language without a page load.

`ngx-translate` is **runtime**: one bundle, JSON fetched on demand, instant switching. That is why this app uses it — the switcher in the navbar simply would not work with `@angular/localize`.

|                 | `@angular/localize`    | `ngx-translate`                                  |
| --------------- | ---------------------- | ------------------------------------------------ |
| When            | Build time             | Runtime                                          |
| Switch language | Reload / different URL | Instant                                          |
| Bundles         | One per locale         | One                                              |
| Missing key     | Build error            | Falls back to `fallbackLang`, then shows the key |

### Known rough edges in this code

This is teaching code, and a few things in it are deliberately (or accidentally) imperfect. Spotting them is part of the class:

- **`effect()` inside `ngOnInit`** in `PermissionDirective` throws `NG0203` — it needs the constructor or an explicit injector.
- **The input name doesn't match the selector**, so `*appPermission="'ADMIN'"` won't bind `allowedRole`.
- **The refetch runs even after a failed cancel**, because `catchError` turned the failure into a successful `of(null)` before `mergeMap` ran.
- **`input.required()` is untyped** in the dialog, so every value is `unknown`.
- **Nothing closes the dialog on `Escape` or on a backdrop click** — keyboard users are stuck with the mouse.
- **`LanguageService.init()` returns nothing**, so `APP_INITIALIZER` does not actually wait for the JSON to load. It works today only because the file is small and cached.
- **`localStorage.getItem` is cast with `as Lang`** — a cast is a promise to TypeScript, not a check. A hand-edited `mango_language` value goes straight through.
- **Keys are strings everywhere**, so a typo is silent: you see `nav.myOders` rendered in the UI instead of a compile error.

## Useful Links

| Topic                                              | Link                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Structural directives                              | https://angular.dev/guide/directives/structural-directives                               |
| Writing custom directives                          | https://angular.dev/guide/directives/attribute-directives                                |
| `TemplateRef`                                      | https://angular.dev/api/core/TemplateRef                                                 |
| `ViewContainerRef`                                 | https://angular.dev/api/core/ViewContainerRef                                            |
| `createComponent()`                                | https://angular.dev/api/core/createComponent                                             |
| `ComponentRef` (incl. `setInput`)                  | https://angular.dev/api/core/ComponentRef                                                |
| `ApplicationRef`                                   | https://angular.dev/api/core/ApplicationRef                                              |
| Signal `effect()`                                  | https://angular.dev/guide/signals#effects                                                |
| Signal inputs                                      | https://angular.dev/guide/components/inputs                                              |
| Component outputs                                  | https://angular.dev/guide/components/outputs                                             |
| `takeUntilDestroyed`                               | https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed                             |
| NgRx `rxMethod`                                    | https://ngrx.io/guide/signals/rxjs-integration                                           |
| NgRx entity helpers                                | https://ngrx.io/guide/signals/signal-store/entity-management                             |
| Angular Material Dialog (the built-in alternative) | https://material.angular.io/components/dialog                                            |
| MDN — `Promise`                                    | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise |
| MDN — `inset`                                      | https://developer.mozilla.org/en-US/docs/Web/CSS/inset                                   |
| ngx-translate                                      | https://github.com/ngx-translate/core                                                    |
| ngx-translate HTTP loader                          | https://github.com/ngx-translate/core/tree/master/packages/http-loader                   |
| Angular's built-in i18n                            | https://angular.dev/guide/i18n                                                           |
| `APP_INITIALIZER` / app initializers               | https://angular.dev/api/core/provideAppInitializer                                       |
| `MatPaginatorIntl`                                 | https://material.angular.io/components/paginator/api#MatPaginatorIntl                    |
| Material menu                                      | https://material.angular.io/components/menu                                              |
| Template-driven forms                              | https://angular.dev/guide/forms/template-driven-forms                                    |
| Custom form validators                             | https://angular.dev/guide/forms/form-validation#defining-custom-validators               |
| `NgForm`                                           | https://angular.dev/api/forms/NgForm                                                     |
| MDN — `localStorage`                               | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage                     |
| MDN — `lang` attribute                             | https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang                 |

## Mini Examples

### 1. A structural directive that repeats N times

Same primitives as `PermissionDirective`, no auth involved — proof that the pattern is about DOM, not roles.

```ts
@Directive({ selector: "[appRepeat]" })
export class RepeatDirective {
  times = input.required<number>({ alias: "appRepeat" });

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
@Injectable({ providedIn: "root" })
export class ToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  show(text: string) {
    const ref = createComponent(ToastComponent, {
      environmentInjector: this.injector,
    });
    ref.setInput("text", text);
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);

    // Always clean up on a timer too - otherwise the node lives forever.
    setTimeout(() => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    }, 3000);
  }
}
```

### 3. Closing the dialog with the Escape key

```ts
export class ConfirmationDialogComponent {
  cancel = output<void>();

  // HostListener wires a DOM event on the HOST element. 'document:keydown.escape' listens
  // globally, so focus doesn't have to be inside the dialog for it to work.
  @HostListener("document:keydown.escape")
  onEscape() {
    this.cancel.emit();
  }
}
```

### 4. Turning the promise back into an observable

Sometimes you're already in a pipe and don't want to break out into `async/await`.

```ts
// `from()` converts a Promise into an Observable that emits once and completes.
from(
  this.confirmationService.confirm("Delete?", "This is permanent.", "Delete"),
)
  .pipe(
    filter(Boolean), // drop the "no" - nothing downstream runs
    switchMap(() => this.orderService.cancelOrder(id)),
  )
  .subscribe();
```

### 5. A translated, parameterised string

```json
// public/i18n/en.json
{ "cart": { "itemCount": "You have {{count}} item(s) in your cart" } }
```

```html
<!-- The object keys must match the {{ }} placeholders in the JSON value exactly. -->
<p>{{ 'cart.itemCount' | translate: { count: cartService.count() } }}</p>
```

```ts
// Same thing from a service, where there is no pipe available.
const msg = this.translate.instant("cart.itemCount", { count: 3 });
```

### 6. Reacting to a language change in a component

```ts
export class ReportComponent {
  private translate = inject(TranslateService);

  constructor() {
    // onLangChange is an Observable, so it needs cleaning up. takeUntilDestroyed()
    // does it for you - but only when called in an injection context like this one.
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.rebuildChartLabels());
  }
}
```

### 7. A validator that checks a value is in the future

```ts
@Directive({
  selector: "[appFutureDate]",
  providers: [
    { provide: NG_VALIDATORS, useExisting: FutureDateDirective, multi: true },
  ],
})
export class FutureDateDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // let `required` own the empty case - one job each
    return new Date(control.value) > new Date() ? null : { notFuture: true };
  }
}
```

## Practice Exercises

### Beginner — add a third language

Copy `public/i18n/en.json` to `de.json`, translate a handful of keys, and add `'de'` to `LanguageService.available` and the `Lang` type.

- Leave some keys out of `de.json` on purpose. Watch `fallbackLang` fill them in with English.
- Then delete `fallbackLang` from `app.config.ts` and see what renders instead.

### Beginner — find the untranslated strings

Some strings in the app are still hard-coded English.

- Grep the templates for text that is not inside a `| translate`.
- Move three of them into both JSON files.
- Write down why a `<mat-icon>lock</mat-icon>` should **not** be translated.

### Intermediate — make APP_INITIALIZER actually wait

`LanguageService.init()` returns `void`, so Angular does not wait for the language file.

- Change `init()` to return the observable from `translate.use(lang)` and confirm the initialiser blocks on it.
- Throttle your network to Slow 3G in DevTools and compare the first paint before and after.

### Intermediate — validate the saved language

Replace the `as Lang` cast in `init()` with a real runtime check against `this.available`.

- Set `mango_language` to `"fr"` by hand in DevTools and reload.
- Your version should fall back to `'en'` instead of asking for a file that does not exist.

### Challenge — typed translation keys

String keys mean typos are silent.

- Generate a TypeScript type from `en.json` (a union of its dotted paths) and write a small wrapper around `TranslateService` that only accepts that type.
- Explain in two sentences what you gave up to get that safety.

### Beginner — type the dialog inputs

`ConfirmationDialogComponent` declares `input.required()` with no type argument, so every value is `unknown`.

- Give all three inputs an explicit `<string>`.
- Then try passing a number from `ConfirmationService` and watch where the error appears — and where it _doesn't_, because `setInput` takes a string key.

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

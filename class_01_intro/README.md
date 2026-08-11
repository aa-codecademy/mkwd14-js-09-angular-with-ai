# Class 1 — Introduction to Angular

Welcome to your first Angular class! In this session you'll get hands-on with the building block of every Angular app — the **component** — and learn how to get data onto the screen, react to user clicks, render lists and conditions, and pass data between parent and child components. By the end you'll understand both the modern signal-based APIs and the classic directive-based ones you'll still see in the wild.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Standalone Components](#standalone-components)
  - [Templates & Interpolation](#templates--interpolation)
  - [Event Binding](#event-binding)
  - [Property Binding](#property-binding)
  - [Signal-based Inputs & Outputs](#signal-based-inputs--outputs)
  - [Control Flow (@if / @for)](#control-flow-if--for)
  - [Structural Directives (*ngIf / *ngFor)](#structural-directives-ngif--ngfor)
  - [Pipes](#pipes)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Standalone Components

A component is a TypeScript class decorated with `@Component`, paired with an HTML template and (optionally) styles. "Standalone" means the component declares exactly what it needs — other components, directives, pipes — via its own `imports` array, instead of relying on an `NgModule`.

**Why it exists:** modules used to be mandatory glue code that added indirection without much benefit for most apps. Standalone components let you understand a component's dependencies just by reading its decorator.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-greeting',
  template: `<p>Hello, {{ name }}!</p>`,
})
export class Greeting {
  name = 'student';
}
```

### Templates & Interpolation

A template is the HTML that describes what a component renders. `{{ expression }}` is **interpolation** — it evaluates a JavaScript-like expression and inserts the result as text.

**Why it exists:** you need a declarative way to bind data from your class into the DOM without manually calling `document.querySelector` and updating text yourself. Angular keeps the DOM in sync with your component's state automatically.

```ts
@Component({
  selector: 'app-clock',
  template: `<p>The time is {{ time }}</p>`,
})
export class Clock {
  time = new Date().toLocaleTimeString();
}
```

> **Note:** Interpolation only works with expressions, not statements — `{{ if (x) {...} }}` is invalid, but `{{ x ? 'yes' : 'no' }}` works fine.

### Event Binding

Wrapping a DOM event name in parentheses — `(click)="handler()"` — tells Angular to call `handler()` whenever that event fires.

**Why it exists:** this is how your component reacts to user interaction (clicks, input, keypresses) instead of passively displaying data.

```ts
@Component({
  selector: 'app-toggle',
  template: `
    <button (click)="toggle()">Toggle</button>
    @if (isOn) { <p>ON</p> }
  `,
})
export class Toggle {
  isOn = false;
  toggle() {
    this.isOn = !this.isOn;
  }
}
```

> **Note:** Pass the method reference without `()` in the binding target name would be a mistake for *properties* (e.g. `[prop]="method"` vs `[prop]="method()"`) — but for `(event)="..."` bindings, you always call it with `()`, since Angular executes that expression on the event.

### Property Binding

Wrapping an HTML/DOM property in square brackets — `[value]="expression"` — pushes data from your component down into that element or child component.

**Why it exists:** it's how a parent component passes data into a child (via the child's `input()`), or sets a native DOM property dynamically (like `[disabled]="isLoading"`).

```html
<app-counter [count]="score" />
```

### Signal-based Inputs & Outputs

Modern Angular components declare inputs and outputs as class fields using the `input()` and `output()` functions, instead of the older `@Input()`/`@Output()` decorators.

**Why it exists:** signals integrate with Angular's new reactivity model — reading an input is just calling it as a function (`count()`), and Angular can track exactly which parts of the template depend on it, enabling more precise, faster updates.

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ count() }}</p>
    <button (click)="changed.emit(count() + 1)">+1</button>
  `,
})
export class Counter {
  count = input(0);
  changed = output<number>();
}
```

The classic "data down, events up" pattern: the parent binds `[count]` down into the child, and listens for `(countChanged)` events coming back up.

```html
<app-counter [count]="score" (countChanged)="score = $event" />
```

### Control Flow (@if / @for)

`@if`, `@else`, and `@for` are Angular's built-in template control-flow blocks. They read like plain JavaScript control flow and require no imports.

**Why it exists:** this is the modern, more readable replacement for the older `*ngIf`/`*ngFor` structural directives — no `CommonModule` import needed, and the syntax more closely matches how you already think about branching and looping.

```html
@if (items.length) {
  <ul>
    @for (item of items; track item.id) {
      <li>{{ item.name }}</li>
    }
  </ul>
} @else {
  <p>No items yet.</p>
}
```

> **Note:** `@for` requires a `track` expression. Always track by a stable unique identifier (like an `id`), never the array index — tracking by index causes Angular to misidentify items when the list is reordered or filtered, leading to bugs like inputs jumping to the wrong row.

### Structural Directives (*ngIf / *ngFor)

Before `@if`/`@for` existed, conditional rendering and loops were done with the `*ngIf` and `*ngFor` structural directives, which require importing `CommonModule`.

**Why it exists (and why it's still worth knowing):** you'll encounter this syntax in older codebases, tutorials, and Stack Overflow answers for years to come. Functionally it does the same job as `@if`/`@for`.

```html
<li *ngFor="let link of navLinks">{{ link }}</li>
<div *ngIf="isLoggedIn">Welcome back!</div>
```

### Pipes

A pipe transforms a value for display using the `|` syntax, e.g. `{{ price | currency }}`.

**Why it exists:** formatting logic (currency, dates, uppercase, etc.) is common and reusable — pipes let you apply it declaratively in the template instead of writing formatting code in your component class.

```html
<p>{{ 999 | currency }}</p>
<!-- renders: $999.00 -->
```

## Theory

- **Change detection**: Angular doesn't re-render your whole page on every update. It runs a change-detection pass that walks the component tree and checks which bindings (`{{ }}`, `[prop]`, `(event)`) may have changed, then patches only the affected DOM nodes. Historically this was triggered by `NgZone` patching async APIs (timers, events, promises); newer Angular is moving toward signal-based, fully fine-grained reactivity where only the exact bindings that depend on a changed signal are re-evaluated.
- **Standalone vs NgModule**: for years, every component had to be declared in exactly one `NgModule`, and modules controlled what was available to templates. Standalone components remove that requirement — a component lists its own dependencies, which makes dependency graphs easier to trace and makes lazy-loading simpler.
- **Signals**: a signal is a wrapped value (`signal(0)`) that notifies Angular when it changes. `input()` and `output()` are built on top of this system. Reading a signal (`mySignal()`) inside a template registers that binding as "dependent" on the signal, so Angular knows precisely what to re-check when it updates — a more efficient model than the "check everything" default of zone-based change detection.
- **One-way data flow**: bindings in Angular templates flow one direction — `[prop]` pushes data down, `(event)` pushes data up. There's no automatic two-way sync unless you explicitly opt into it (e.g. `[(ngModel)]`), which keeps data flow predictable and easy to trace.

## Useful Links

| Topic | Link |
|---|---|
| Components overview | [angular.dev/guide/components](https://angular.dev/guide/components) |
| Template syntax | [angular.dev/guide/templates](https://angular.dev/guide/templates) |
| `@if` / `@for` control flow | [angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow) |
| Signal inputs | [angular.dev/guide/signals/inputs](https://angular.dev/guide/signals/inputs) |
| Signal outputs | [angular.dev/guide/signals/outputs](https://angular.dev/guide/signals/outputs) |
| Built-in pipes | [angular.dev/guide/templates/pipes](https://angular.dev/guide/templates/pipes) |
| Angular CLI reference | [angular.dev/tools/cli](https://angular.dev/tools/cli) |
| TypeScript handbook (types, classes) | [typescriptlang.org/docs/handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |

## Mini Examples

**1. A simple todo toggle (event binding + @if)**

```ts
@Component({
  selector: 'app-todo',
  template: `
    <li (click)="done = !done" [class.done]="done">
      {{ text }}
    </li>
  `,
})
export class Todo {
  text = 'Learn Angular';
  done = false;
}
```

**2. Filtering a list with @for and a computed count**

```ts
@Component({
  selector: 'app-fruit-list',
  template: `
    <p>{{ fruits.length }} fruits</p>
    @for (fruit of fruits; track fruit) {
      <span>{{ fruit }}</span>
    }
  `,
})
export class FruitList {
  fruits = ['apple', 'banana', 'cherry'];
}
```

**3. Parent/child communication with signal input & output**

```ts
// child
@Component({
  selector: 'app-rating',
  template: `<button (click)="rated.emit(stars() + 1)">★ {{ stars() }}</button>`,
})
export class Rating {
  stars = input(0);
  rated = output<number>();
}
```

```html
<!-- parent -->
<app-rating [stars]="movieRating" (rated)="movieRating = $event" />
```

**4. Formatting with a pipe**

```html
<p>Published: {{ publishedAt | date: 'longDate' }}</p>
<p>Title: {{ title | uppercase }}</p>
```

## Practice Exercises

**Beginner**
- Create a component with a button that shows/hides a paragraph using `@if` and a boolean class property, similar to the `greet()` example in `example1`.

**Beginner**
- Build a component that renders a hardcoded array of your favorite movies using `@for`, making sure to `track` by a unique property.

**Intermediate**
- Create a parent component and a child `RatingStars` component. The child should expose a signal `input()` for the current rating and an `output()` that emits a new rating when a star is clicked. Wire them together in the parent so clicking a star updates the parent's state.

**Intermediate**
- Take the `ControlFlow` product list example and add a button that filters the list to show only in-stock products, toggling between "all" and "in stock only" views.

**Challenge**
- Refactor the `Header` component's `*ngFor`/`*ngIf` template to use the modern `@for`/`@if` syntax instead, and remove the now-unnecessary `CommonModule` import. Confirm the app still behaves the same.

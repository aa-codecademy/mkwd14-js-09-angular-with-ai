# Class 2 — Content Projection, Directives & Pipes

In this class you'll go beyond basic components and learn three tools that make Angular components genuinely reusable: **content projection** (letting a parent inject arbitrary markup into a child's layout), **custom attribute directives** (adding behavior to existing elements), and **pipes** (transforming values for display, both built-in and your own). You'll finish by seeing all three ideas combined in a small real-world-style project, Mango.

## Table of Contents

- [Core Concepts covered in this class](#core-concepts-covered-in-this-class)
  - [Content Projection with ng-content](#content-projection-with-ng-content)
  - [Multi-slot Projection](#multi-slot-projection)
  - [ng-template & ngTemplateOutlet](#ng-template--ngtemplateoutlet)
  - [Attribute Directives](#attribute-directives)
  - [HostBinding & HostListener](#hostbinding--hostlistener)
  - [Built-in Pipes](#built-in-pipes)
  - [Custom Pipes](#custom-pipes)
- [Theory](#theory)
- [Useful Links](#useful-links)
- [Mini Examples](#mini-examples)
- [Practice Exercises](#practice-exercises)

## Core Concepts covered in this class

### Content Projection with ng-content

`<ng-content />` is a placeholder inside a child component's template. Whatever markup a parent puts between that child's opening and closing tags gets rendered exactly where `<ng-content />` sits.

**Why it exists:** without it, a component can only render what its own template hardcodes. Content projection lets you build generic wrapper components (cards, modals, boxes) where the *structure* is fixed but the *content* is supplied by whoever uses the component — the same idea as `children` in other frameworks, or a `<slot>` in native web components.

```ts
@Component({
  selector: 'app-panel',
  template: `<div class="panel"><ng-content /></div>`,
})
export class Panel {}
```

```html
<app-panel>
  <p>This paragraph is projected into the panel.</p>
</app-panel>
```

### Multi-slot Projection

A component can declare more than one `<ng-content>`, each with a `select` attribute that acts like a CSS selector. Angular routes projected elements into the first slot whose selector matches.

**Why it exists:** a card, for example, usually needs a distinct header, body, and action area — a single catch-all slot can't express that. `select="[card-header]"` matches any projected element carrying that attribute; a plain `<ng-content />` with no `select` catches everything left over.

```html
<!-- child template -->
<div class="card-header"><ng-content select="[card-header]" /></div>
<div class="card-body"><ng-content /></div>
```

```html
<!-- parent usage -->
<app-card>
  <span card-header>Title</span>
  <p>Body content goes here.</p>
</app-card>
```

> **Note:** the attribute used for matching (e.g. `card-header`) is not a real Angular API — it's just a plain HTML attribute you invent and then reference in `select="[...]"`. It has no behavior on its own.

### ng-template & ngTemplateOutlet

`<ng-template>` defines a block of markup that Angular does **not** render immediately — it just registers it, tagged with a reference variable (`#first`). `*ngTemplateOutlet` then decides, based on an expression, which registered template to actually stamp into the DOM.

**Why it exists:** sometimes you need to switch between two or more chunks of markup based on state, without physically duplicating `@if`/`@else` blocks everywhere, or you want to pass a "template" as data (e.g. into a reusable component that renders whatever template it's given).

```html
<button (click)="showFirst = !showFirst">Toggle</button>

<ng-container *ngTemplateOutlet="showFirst ? first : second" />

<ng-template #first><p>First template</p></ng-template>
<ng-template #second><p>Second template</p></ng-template>
```

> **Note:** `*ngTemplateOutlet` requires importing `CommonModule` (or the standalone `NgTemplateOutlet` directive) in the component's `imports` array.

### Attribute Directives

A directive that has **no template of its own** — it attaches to an existing element (matched by its selector, e.g. `[appHighlight]`) and modifies its behavior or appearance.

**Why it exists:** sometimes you want to reuse a piece of *behavior* (highlight on hover, auto-focus, click-outside detection) across many different elements, without wrapping each one in an extra component.

```ts
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  appHighlight = input('yellow');
}
```

```html
<p appHighlight="green">Hover me</p>
```

> **Note:** naming the `input()` the same as the directive's selector lets you set the value directly on the attribute (`appHighlight="green"`) instead of needing a separate property binding.

### HostBinding & HostListener

`@HostBinding` binds a property/style/class of the **host element** (the element the directive is attached to) to a class field. `@HostListener` subscribes to a DOM event on that same host element.

**Why it exists:** a directive has no DOM of its own to bind to or listen on — these decorators are how it reaches out and affects (or reacts to) the element it's attached to.

```ts
@HostBinding('style.backgroundColor') bg = '';

@HostListener('mouseenter') onEnter() {
  this.bg = 'yellow';
}
```

### Built-in Pipes

A pipe transforms a value for display using the `|` syntax. Angular ships several ready to use: `currency`, `date`, `number`, `uppercase`, `slice`, and more.

**Why it exists:** formatting is common and repetitive — you'd otherwise write the same `Intl.NumberFormat`/`Intl.DateTimeFormat` boilerplate in every component that shows a price or a date. Pipes let you apply that formatting declaratively, right in the template.

```html
<p>{{ 1250.50 | currency: 'EUR' : 'symbol' : '1.2-2' }}</p>
<!-- renders: €1,250.50 -->
<p>{{ today | date: 'shortDate' }}</p>
```

### Custom Pipes

You can write your own pipe by implementing `PipeTransform` and decorating the class with `@Pipe`. It's just a class with a `transform()` method — the first argument is the value being piped, and anything after `:` in the template becomes additional arguments.

**Why it exists:** built-in pipes cover generic formatting, but your app will have its own display rules (truncating long text, pluralizing a word, formatting a domain-specific status) — a custom pipe keeps that logic out of your component classes and reusable across templates.

```ts
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 80, ellipsis = '...') {
    return value.length <= limit ? value : value.slice(0, limit) + ellipsis;
  }
}
```

```html
<p>{{ description | truncate: 50 }}</p>
```

> **Note:** pipes are `pure` by default, meaning Angular only re-runs `transform()` when the input *reference* changes. Mutating an array or object in place (instead of replacing it) won't trigger the pipe to re-run.

## Theory

- **Content projection vs component composition**: projection doesn't create a parent-child *data* relationship — the projected content still belongs to (and reads state from) the parent's component class, even though it visually renders inside the child. Think of it as moving DOM, not moving ownership.
- **Directives vs components**: every component is technically a directive with a template attached. A "plain" directive (declared with `@Directive`) is the same underlying mechanism minus the template — it exists purely to attach behavior to a host element that already has its own markup.
- **Why pipes exist as their own concept instead of just calling a method in the template**: Angular pipes are memoized by default (`pure: true`), so `{{ value | myPipe }}` only re-computes when `value` actually changes reference. Calling `{{ myMethod(value) }}` directly re-runs the method on every single change-detection cycle, even if nothing relevant changed — a real performance difference in larger templates.
- **Template reference variables** (`#first`, `#myInput`) are scoped to the template they're declared in (and its children) — you can't reach into a `<ng-template>` reference from a completely separate component without explicitly passing it in.

## Useful Links

| Topic | Link |
|---|---|
| Content projection guide | [angular.dev/guide/components/content-projection](https://angular.dev/guide/components/content-projection) |
| Attribute directives | [angular.dev/guide/directives](https://angular.dev/guide/directives) |
| `ng-template` / `NgTemplateOutlet` | [angular.dev/api/common/NgTemplateOutlet](https://angular.dev/api/common/NgTemplateOutlet) |
| Pipes guide | [angular.dev/guide/templates/pipes](https://angular.dev/guide/templates/pipes) |
| Built-in pipes API reference | [angular.dev/api/common#pipes](https://angular.dev/api/common) |
| Angular Material components (used in Mango) | [material.angular.dev/components/categories](https://material.angular.dev/components/categories) |
| MDN: Web Components `<slot>` (conceptually similar) | [developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots) |

## Mini Examples

**1. A modal shell using single-slot projection**

```ts
@Component({
  selector: 'app-modal',
  template: `
    <div class="overlay">
      <div class="modal"><ng-content /></div>
    </div>
  `,
})
export class Modal {}
```

**2. A "tooltip" attribute directive with HostBinding/HostListener**

```ts
@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective {
  appTooltip = input('');
  @HostBinding('title') get title() { return this.appTooltip(); }
}
```

**3. Switching layouts with ngTemplateOutlet**

```html
<ng-container *ngTemplateOutlet="isGrid ? gridView : listView" />
<ng-template #gridView><app-grid /></ng-template>
<ng-template #listView><app-list /></ng-template>
```

**4. A custom "pluralize" pipe**

```ts
@Pipe({ name: 'pluralize', standalone: true })
export class PluralizePipe implements PipeTransform {
  transform(count: number, word: string) {
    return `${count} ${count === 1 ? word : word + 's'}`;
  }
}
```
```html
<p>{{ cartItems.length | pluralize: 'item' }}</p>
<!-- "3 items" or "1 item" -->
```

## Practice Exercises

**Beginner**
- Build a `Callout` component that projects a single message, styled with a colored left border, similar to `HighlightBox` in `example1`.

**Beginner**
- Write a custom pipe called `shout` that uppercases a string and appends `!!!`. Use it in a template on a few different strings.

**Intermediate**
- Extend the `CardComponent` (multi-slot) to add a third slot, `card-footer`, matched by a `[card-footer]` attribute, and use it in `app.component.ts` alongside the existing header/body slots.

**Intermediate**
- Create an `appAutoFocus` attribute directive that focuses its host input element as soon as it's attached, using `@HostBinding`/lifecycle hooks (hint: look up `ngAfterViewInit` or `ElementRef`).

**Challenge**
- In the Mango project, replace the commented-out `<pre>{{ products | json }}</pre>` debug block with a real, styled product grid: loop over `products` with `@for`, show name/price/description, and pipe the price through `currency` and the description through the custom `truncate` pipe from `example3`.

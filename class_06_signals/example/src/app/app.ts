// signal/computed/effect/untracked are the core Angular Signals APIs.
// Unlike a plain class property, a signal is a reactive wrapper: reading it
// (calling it as a function) inside a template or a computed()/effect() tells
// Angular "this consumer depends on this value", so change detection can update
// only what actually depends on it - no manual subscriptions, unlike RxJS Observables.
import { Component, computed, effect, signal, untracked } from '@angular/core';
import { single } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <h2>Angular Signals Demo</h2>
    <div>
      <h3>signal()</h3>
      <p>
        <!-- Gotcha: signals must be READ by calling them like a function - count, not count() -
             would print the signal object itself, not its value. -->
        Count: <strong>{{ count() }}</strong>
      </p>
      <!-- update() derives the next value from the current one; set() replaces it outright.
           Both are the correct way to change a signal - never mutate it directly
           (there's no `count.value = x`), that's what keeps signals trackable. -->
      <button (click)="count.update((value) => value - 1)">-</button>
      <button (click)="count.update((value) => value + 1)">+</button>
      <button (click)="count.set(0)">Reset</button>
    </div>
    <div>
      <!-- computed() vs a plain getter: both look similar, but computed() caches its
           result and only recalculates when a signal it read (count) actually changes.
           A getter re-runs every time Angular checks the template, even if nothing changed. -->
      <h3>computed()</h3>
      <p>
        Doubled: <strong>{{ doubled() }}</strong>
      </p>
      <p>
        Is even: <strong>{{ isEven() }}</strong>
      </p>
      <p>
        Label: <strong>{{ label() }}</strong>
      </p>
    </div>

    <div>
      <!-- untracked() lets a computed()/effect() read a signal WITHOUT registering it as a
           dependency, so changes to that signal alone won't trigger a recompute/rerun. -->
      <h3>computed & untracked</h3>
      <p>
        Views (ignored by computed): <strong> {{ views() }} </strong>
      </p>
      <button (click)="views.update((value) => value + 1)">Bump views (no recompute)</button>
      <p>Summary: {{ summary() }}</p>
      <p>
        <small>
          <code>summary</code> reads <code>views</code> through <code>untracked()</code>, so bumping
          "Views" does <em>not</em> recompute it &mdash; only changing <code>count</code> does.
          Check the recompute counter below.
        </small>
      </p>
      <p>
        Times <code>summary</code> recomputed: <strong>{{ summaryRecomputes }}</strong>
      </p>
    </div>
  `,
})
export class App {
  // signal(0) creates a writable reactive value starting at 0. Angular tracks every
  // place count() is read, so it knows exactly what to re-render when it changes.
  count = signal(0);

  // Each computed() derives a new signal from count(). They re-run lazily and only
  // when count() actually changes - not on every change-detection pass.
  doubled = computed(() => this.count() * 2);
  isEven = computed(() => this.count() % 2 === 0);
  label = computed(() => (this.count() > 0 ? 'positive' : this.count() < 0 ? 'negative' : 'zero'));

  views = signal(0);
  // Plain field, not a signal - used purely to demonstrate how many times the
  // computed below actually recomputes (a signal here would create a feedback loop).
  summaryRecomputes = 0;
  summary = computed(() => {
    this.summaryRecomputes++;
    // count() IS tracked -> changing it recomputes summary.
    const c = this.count();
    // views() read through untracked() is NOT tracked -> bumping "views" alone
    // will not cause this computed() to recompute.
    const v = untracked(() => this.views());
    return `Count is ${c} (viewed ${v} times so far).`;
  });

  constructor() {
    // effect() runs a side effect whenever any signal it reads (untracked ones excluded)
    // changes - here, whenever count() changes. Effects are for side effects like
    // localStorage/logging, not for deriving values (use computed() for that instead).
    // Angular disposes/cleans up effects automatically when the component is destroyed.
    effect(() => {
      localStorage.setItem('count', String(this.count()));
      console.log(
        'views:',
        untracked(() => this.views()),
      );
    });
  }
}

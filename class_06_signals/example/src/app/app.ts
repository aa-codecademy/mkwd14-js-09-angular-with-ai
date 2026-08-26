import { Component, computed, effect, signal, untracked } from '@angular/core';
import { single } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <h2>Angular Signals Demo</h2>
    <div>
      <h3>signal()</h3>
      <p>
        Count: <strong>{{ count() }}</strong>
      </p>
      <button (click)="count.update((value) => value - 1)">-</button>
      <button (click)="count.update((value) => value + 1)">+</button>
      <button (click)="count.set(0)">Reset</button>
    </div>
    <div>
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
  count = signal(0);

  doubled = computed(() => this.count() * 2);
  isEven = computed(() => this.count() % 2 === 0);
  label = computed(() => (this.count() > 0 ? 'positive' : this.count() < 0 ? 'negative' : 'zero'));

  views = signal(0);
  summaryRecomputes = 0;
  summary = computed(() => {
    this.summaryRecomputes++;
    const c = this.count();
    const v = untracked(() => this.views());
    return `Count is ${c} (viewed ${v} times so far).`;
  });

  constructor() {
    effect(() => {
      localStorage.setItem('count', String(this.count()));
      console.log(
        'views:',
        untracked(() => this.views()),
      );
    });
  }
}

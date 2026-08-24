import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, type OnInit } from '@angular/core';
import { of, tap, type Observable } from 'rxjs';

// A plain interface describing the shape of a JSONPlaceholder post - gives autocomplete/type-checking
// for every `post.x` used below without any runtime cost.
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-root',
  // AsyncPipe must be imported because it's used in the template (`| async`) below -
  // standalone components declare every pipe/directive/component they use.
  imports: [AsyncPipe],
  template: `
    <h2>HTTP GET - JSONPlaceholder</h2>

    <!-- The AsyncPipe subscribes to the "posts" Observable for you and auto-unsubscribes when this -->
    <!-- component is destroyed - the recommended way to consume Observables in templates, so you never -->
    <!-- have to remember to call .unsubscribe() yourself. -->
    @for (post of posts | async; track post.id) {
      <div>
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
      </div>
    } @empty {
      @if (isLoading) {
        <h3>Posts are loading...</h3>
      } @else {
        <p>No posts available.</p>
      }
    }
  `,
})
export class App implements OnInit {
  // inject() is Angular's functional DI - reads HttpClient from the injector without a constructor param.
  private http = inject(HttpClient);
  // Typed as an Observable (not an array) because it's bound with `| async` in the template rather
  // than manually subscribed to. Starts as `of([])` - an Observable that immediately emits an empty array.
  posts: Observable<Post[]> = of([]);
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    // HttpClient.get<T>() returns a "cold" Observable - the actual HTTP request is only sent once
    // something subscribes (here, the AsyncPipe in the template does that for us).
    this.posts = this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5').pipe(
      // tap() is an RxJS side-effect operator - it doesn't transform the emitted value, it just lets
      // you run code (like flipping isLoading off) when the response arrives.
      tap(() => {
        this.isLoading = false;
      }),
    );
    // this.isLoading = false;
    // .subscribe((posts) => {
    //   this.posts = posts;

    //   console.log('Posts inside of the http call', this.posts, Date.now());
    // });

    // Gotcha: this logs BEFORE the HTTP response arrives, because .get() is asynchronous - `posts`
    // here still refers to the Observable itself, not resolved data. That's the whole point of
    // Observables: nothing happens synchronously until something subscribes.
    console.log('Posts outside of the http call', this.posts, Date.now());
  }
}

import { Component, inject, signal, type OnInit } from '@angular/core';
import type { Post } from './post.type';
import { PostService } from './post.service';

// Unlike example1 (raw HttpClient + AsyncPipe), this version delegates the HTTP call to a
// dedicated PostService and stores the result in signals - the more idiomatic modern Angular setup.
@Component({
  selector: 'app-root',
  template: `
    <h2>HTTP GET - JSONPlaceholder</h2>

    <!-- posts() / isLoading() are function calls, not properties - signals are read by invoking them, -->
    <!-- and the template automatically re-renders whenever the signal's value changes. -->
    @for (post of posts(); track post.id) {
      <div>
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
      </div>
    } @empty {
      @if (isLoading()) {
        <h3>Posts are loading...</h3>
      } @else {
        <p>No posts available.</p>
      }
    }
  `,
})
export class App implements OnInit {
  // inject() is Angular's functional DI - the modern alternative to a constructor parameter.
  private postService = inject(PostService);
  // signal() creates reactive state - writing via .set()/.update() automatically notifies the
  // template to re-render, no manual change detection or Zone.js triggers needed.
  posts = signal<Post[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.isLoading.set(true);
    // Nothing happens until .subscribe() is called - this is what actually fires the HTTP GET
    // request; the Observable returned by getPosts() is "cold" and inert on its own.
    this.postService.getPosts().subscribe((posts) => {
      this.posts.set(posts);
      this.isLoading.set(false);
      console.log('Posts inside of the http call', this.posts, Date.now());
    });

    // Gotcha: this runs synchronously, before the HTTP response comes back, since .subscribe()'s
    // callback above is asynchronous - `this.posts` here is still the empty initial signal value.
    console.log('Posts outside of the http call', this.posts, Date.now());
  }
}

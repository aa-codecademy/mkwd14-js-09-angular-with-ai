import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, type OnInit } from '@angular/core';
import { of, tap, type Observable } from 'rxjs';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  template: `
    <h2>HTTP GET - JSONPlaceholder</h2>

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
  private http = inject(HttpClient);
  posts: Observable<Post[]> = of([]);
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    this.posts = this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5').pipe(
      tap(() => {
        this.isLoading = false;
      }),
    );
    // this.isLoading = false;
    // .subscribe((posts) => {
    //   this.posts = posts;

    //   console.log('Posts inside of the http call', this.posts, Date.now());
    // });

    console.log('Posts outside of the http call', this.posts, Date.now());
  }
}

import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Post } from './post.type';
import { HttpClient } from '@angular/common/http';

// providedIn: 'root' registers this service as a single app-wide singleton via Angular's DI system -
// any component that injects PostService gets the exact same instance (and shared HttpClient).
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  // Returning the Observable (not subscribing here) keeps the service "dumb" about when/how the
  // data is consumed - the component decides whether to subscribe manually or use the async pipe.
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5');
  }
}

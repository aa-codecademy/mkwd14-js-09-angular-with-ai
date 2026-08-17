import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Post } from './post.type';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5');
  }
}

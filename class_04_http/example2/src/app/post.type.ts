// Describes the exact shape returned by JSONPlaceholder's /posts endpoint - HttpClient.get<Post[]>()
// uses this generic to type-check every `post.x` access at compile time, with zero runtime validation.
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

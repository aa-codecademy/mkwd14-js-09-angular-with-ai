// Plain data shape returned by CategoryService.getAll() - matches the JSON the API sends back.
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

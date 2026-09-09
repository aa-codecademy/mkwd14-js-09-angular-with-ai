// A union of string literals, not `string`. Now `sortDir = 'ascending'` is a compile error
// instead of a bug you find when the API returns nothing useful. Shared in its own file so
// the store, the service and the filter component all agree on the exact same two values.
export type SortDirection = 'asc' | 'desc';

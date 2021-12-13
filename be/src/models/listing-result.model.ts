export interface ListingResult<T> {
  offset: number
  next: number
  totalItems: number
  items: T[]
}

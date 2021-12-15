export interface ListingResult<T> {
  offset: number
  rows: number
  totalItems: number
  items: T[]
}

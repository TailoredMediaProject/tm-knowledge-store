export default interface ListQueryModel {
  text?: string;
  createdSince?: string;
  modifiedSince?: string;
  sort?: string;
  offset?: number;
  rows?: number
}

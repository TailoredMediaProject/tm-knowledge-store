export default interface ListQueryModel {
  text?: string;
  createdSince?: Date;
  modifiedSince?: Date;
  sort?: string;
  offset?: number;
  rows?: number
}

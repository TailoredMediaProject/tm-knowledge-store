import {DateTime} from '../generated';

export default interface ListQueryModel {
  text?: string;
  createdSince?: DateTime;
  modifiedSince?: DateTime;
  sort?: string;
  offset?: number;
  rows?: number
}

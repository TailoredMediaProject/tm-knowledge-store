import {Vocabulary} from '../generated';

export interface KnowledgeResponse {
  offset: number;
  rows: number;
  totalItems: number;
  items: Vocabulary | Vocabulary[];
}

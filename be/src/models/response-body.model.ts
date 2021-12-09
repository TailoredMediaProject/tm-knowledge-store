import {Vocabulary} from '../generated/model/vocabulary';

export interface KnowledgeResponse {
  offset: number;
  rows: number;
  totalItems: number;
  items: Vocabulary | Vocabulary[];
}

import {Pageable, Vocabulary} from '@/openapi';

export interface VocabList {
  pageable: Pageable;
  vocabs: Vocabulary[];
}

export const extractVocabList = (object: any): VocabList => {
  const pageable: Pageable = {
    offset: object.offset,
    rows: object.rows,
    totalItems: object.totalItems
  };
  const vocabs: Vocabulary[] = object.items;
  return { pageable, vocabs };
};

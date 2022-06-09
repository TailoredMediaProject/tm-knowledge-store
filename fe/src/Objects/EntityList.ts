import {Entity, Pageable} from '@/openapi';

export interface EntityList {
  pageable: Pageable;
  entities: Entity[];
}

export const extractEntityList = (object: any): EntityList => {
  const pageable: Pageable = {
    offset: object.offset,
    totalItems: object.totalItems,
    rows: object.rows
  };
  const entities: Entity[] = object.items;
  return {pageable, entities};
};

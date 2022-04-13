import {ObjectId} from 'mongodb';
import {EntityData} from './resolve-service.interface';

export interface Vocabulary {
  _id: ObjectId;
  slug: string;
  label: string;
  description: string;
  created: Date;
  lastModified: Date;
  entityCount: number;
}

export interface Entity {
  _id: ObjectId;
  vocabulary: ObjectId;
  type: string;
  label: string;
  description: string;
  created: Date;
  lastModified: Date;
  externalResources: string[];
  sameAs: string[];
  data: EntityData;
}

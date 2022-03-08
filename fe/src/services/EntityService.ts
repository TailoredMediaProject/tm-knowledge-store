import {Configuration, EntitesApi, Entity, Pageable, TagType} from '@/openapi';
import {ISO8601toUTC} from '@/Utility/DateUtility';
import {EntityList, extractEntityList} from '@/Objects/EntityList';
import {AxiosResponse} from 'axios';

export class EntityService {
  private readonly basePath: string;
  private readonly apiPath: string;
  private apiFn = new EntitesApi();

  constructor(basePath: string) {
    this.basePath = basePath;
    this.apiPath = basePath + '/vocab';
    this.apiFn = new EntitesApi(new Configuration({basePath: this.basePath}));
  }

  getEntities(vocabID: string, text?: string, tagType?: Array<TagType>, page = 0, rowCount = 10): Promise<EntityList | undefined> {
    return this.apiFn.listEntities(vocabID, text, tagType, undefined, undefined, undefined, page, rowCount).then((resp) => {
      if (this.noStatusError(resp.status, resp)) {
        const data = resp.data as Pageable & [Entity];
        return extractEntityList(data);
      }
    });
  }

  getEntity(vocabID: string, entityID: string): Promise<Entity | undefined> {
    return this.apiFn.vocabVocabularyIdEntitiesEntityIdGet(vocabID, entityID).then((resp) => {
      if (this.noStatusError(resp.status, resp)) {
        return resp.data;
      }
    });
  }

  createEntity(vocabID: string, entity: Entity): Promise<Entity | undefined> {
    return this.apiFn.createEntity(vocabID, entity).then((resp) => {
      if (this.noStatusError(resp.status, resp)) {
        return resp.data;
      }
    });
  }

  updateEntity(entity: Entity): Promise<Entity | undefined> {
    const lastModified = ISO8601toUTC(entity.lastModified);
    if (!lastModified) {
      return Promise.reject('Date format invalid!');
    }
    return this.apiFn.vocabVocabularyIdEntitiesEntityIdPut(entity.vocabulary, entity.id, lastModified, entity).then((resp) => {
      if (this.noStatusError(resp.status, resp)) {
        return resp.data;
      }
    });
  }

  deleteEntity(entity: Entity): Promise<Entity | undefined> {
    const lastModified = ISO8601toUTC(entity.lastModified);
    if (!lastModified) {
      return Promise.reject('Date format invalid!');
    }
    return this.apiFn.vocabVocabularyIdEntitiesEntityIdDelete(entity.vocabulary, entity.id, lastModified).then((resp) => {
      if (this.noStatusError(resp.status, resp)) {
        return resp.data;
      }
    });
  }

  private readonly noStatusError = (statusCode: number, resp: AxiosResponse<unknown>): boolean => {
    if (statusCode >= 400) {
      console.error(resp);
      return false;
    }
    return true;
  };
}

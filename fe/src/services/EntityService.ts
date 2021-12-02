import {
  Configuration,
  EntitesApiFp,
  Entity,
  Pageable,
  TagType,
} from "../openapi";
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";
import { ISO8601toUTC } from "@/Utility/DateUtility";

export class EntityService {
  private readonly basePath: string;
  private readonly apiPath: string;
  private readonly apiFn: {
    createEntity(
      vocabularyId: string,
      entity?: Entity,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Entity>
    >;
    vocabVocabularyIdEntitiesEntityIdDelete(
      vocabularyId: string,
      entityId: string,
      ifUnmodifiedSince: string,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Entity>
    >;
    vocabVocabularyIdEntitiesEntityIdGet(
      vocabularyId: string,
      entityId: string,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Entity>
    >;
    listEntities(
      vocabularyId: string,
      text?: string,
      type?: Array<TagType>,
      createdSince?: string,
      modifiedSince?: string,
      sort?: "created asc" | "created desc" | "modified asc" | "modified desc",
      offset?: number,
      rows?: number,
      options?: AxiosRequestConfig
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string
        // eslint-disable-next-line @typescript-eslint/ban-types
      ) => AxiosPromise<Pageable & object>
    >;
    vocabVocabularyIdEntitiesEntityIdPut(
      vocabularyId: string,
      entityId: string,
      ifUnmodifiedSince: string,
      entity?: Entity,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Entity>
    >;
  };
  constructor(basePath: string) {
    this.basePath = basePath;
    this.apiPath = basePath + "/vocab";
    this.apiFn = EntitesApiFp(new Configuration({ basePath }));
  }

  getEntities(vocabID: string): Promise<Entity[] | undefined> {
    return this.apiFn.listEntities(vocabID).then((req) =>
      req().then((resp) => {
        if (resp.status !== 200) {
          console.error(resp);
          return;
        }
        const data = resp.data as Pageable & [Entity];
        console.log(data);
        return data;
      })
    );
  }

  getEntity(vocabID: string, entityID: string): Promise<Entity | undefined> {
    return this.apiFn
      .vocabVocabularyIdEntitiesEntityIdGet(vocabID, entityID)
      .then((req) =>
        req().then((resp) => {
          if (resp.status !== 200) {
            console.error(resp);
          }
          console.log(resp.data);
          return resp.data;
        })
      );
  }

  createEntity(vocabID: string, entity: Entity): Promise<Entity | undefined> {
    return this.apiFn.createEntity(vocabID, entity).then((req) =>
      req().then((resp) => {
        if (resp.status !== 200) {
          console.error(resp);
          return;
        }
        console.log(resp.data);
        return resp.data;
      })
    );
  }

  updateEntity(vocabID: string, entity: Entity): Promise<Entity | undefined> {
    const lastModified = ISO8601toUTC(entity.lastModified);
    if (lastModified === null) {
      return Promise.reject("Date format not valid!");
    }
    return this.apiFn
      .vocabVocabularyIdEntitiesEntityIdPut(
        vocabID,
        entity.id,
        lastModified,
        entity
      )
      .then((req) =>
        req().then((resp) => {
          if (resp.status !== 200) {
            console.error(resp);
            return;
          }
          console.log(resp.data);
          return resp.data;
        })
      );
  }

  deleteEntity(entity: Entity): Promise<Entity | undefined> {
    const lastModified = ISO8601toUTC(entity.lastModified);
    if (lastModified === null) {
      return Promise.reject("Date format not valid!");
    }
    return this.apiFn
      .vocabVocabularyIdEntitiesEntityIdDelete(
        entity.vocabulary,
        entity.id,
        lastModified
      )
      .then((req) =>
        req().then((resp) => {
          if (resp.status !== 200) {
            console.error(resp);
            return;
          }
          console.log(resp.data);
          return resp.data;
        })
      );
  }
}

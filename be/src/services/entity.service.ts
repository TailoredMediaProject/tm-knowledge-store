import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, FindOptions, InsertOneResult, ModifyResult, ObjectId, UpdateFilter, WithId} from 'mongodb';
import {Entity, Vocabulary} from '../models/dbo.models';
import {VocabularyService, vocabularyService} from './vocabulary.service';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';
import {TagType} from '../generated';
import {UtilService} from './util.service';
import {ServiceError, ServiceErrorFactory} from '../models/service-error.model';
import {DB_COLLECTION_ENTITIES} from '../models/constants';

export class EntityService {
  private static collection(): Collection {
    return persistenceService.db().collection(DB_COLLECTION_ENTITIES);
  }

  private static countCollectionItems(filter: Filter<Entity>): Promise<number> {
    // @ts-ignore
    return this.collection().countDocuments(filter);
  }

  public static countVocabEntities(vocabID: string | ObjectId): Promise<number> {
    return this.countCollectionItems({vocabulary: new ObjectId(vocabID)});
  }

  public createEntity(entity: Entity, useId = false): Promise<Entity> {
    return vocabularyService.getVocabular(entity.vocabulary).then(() =>
      EntityService.collection()
        .insertOne({
          ...entity,
          _id: useId ? entity?._id : undefined,
          created: new Date(),
          lastModified: new Date()
        })
        .then((result: InsertOneResult) => this.getEntity(entity.vocabulary, result.insertedId))
    );
  }

  public getEntity(vocabID: string | ObjectId, entityID: string | ObjectId): Promise<Entity> {
    return vocabularyService.getVocabular(vocabID).then((v: Vocabulary) =>
      EntityService.collection()
        .findOne({
          _id: entityID,
          vocabulary: v._id
        })
        // @ts-ignore
        .then((result) => {
          if (!!result?._id) {
            return result as Entity;
          }
          return ServiceErrorFactory.notFound(`Target entity with id '${entityID}' in vocabulary '${vocabID}' not found`);
        })
    );
  }

  public getEntityWithoutVocab(entityID: string | ObjectId): Promise<Entity> {
    // @ts-ignore
    return (
      EntityService.collection()
        .findOne({_id: entityID})
        // @ts-ignore
        .then((result: Document<WithId<Entity>>) => {
          if (!!result?._id) {
            return result as Entity;
          }
          return ServiceErrorFactory.notFound(`Target entity with id '${entityID}' not found`);
        })
        .catch((err) => {
          console.error(err);
          return ServiceErrorFactory.notFound(`Target entity with id '${entityID}' not found`);
        })
    );
  }

  public getEntities(vocabID: string | ObjectId): Promise<Entity[]> {
    // @ts-ignore
    return (
      vocabularyService
        .getVocabular(vocabID)
        // @ts-ignore
        .then((vocab: Vocabulary) => {
          if (!!vocab?._id) {
            return EntityService.collection()
              .find({vocabulary: new ObjectId(vocabID)})
              .toArray()
              .then((e) => e as Entity[]);
          }
          return ServiceErrorFactory.notFound(`Target vocabulary '${vocabID}' not found`);
        })
        .catch(() => ServiceErrorFactory.notFound(`Target vocabulary '${vocabID}' not found`))
    );
  }

  /**Sets the argument entity in the DB without any modified checks and only not already set values, called internally by an resolve
   * service.*/
  public readonly updateResolvedEntity = (entity: Partial<Entity>): Promise<Entity> =>
    // @ts-ignore
    this.getEntityWithoutVocab(entity._id).then((dbEntity: Entity) => {
      const $set = this.deepNestedCoalescence(dbEntity, entity);

      if (!!$set && Object.keys($set).length > 0) {
        const filter: Filter<Entity> = {
          _id: entity._id,
          lastModified: {
            // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
            $eq: dbEntity.lastModified
          }
        };
        const update: UpdateFilter<Entity> = {
          $set,
          $currentDate: {
            lastModified: true
          }
        };

        return (
          EntityService.collection()
            // @ts-ignore
            .findOneAndUpdate(filter, update, {returnDocument: 'after'})
            // @ts-ignore
            .then((result: ModifyResult<Entity>) => {
              if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
                return this.getEntityWithoutVocab(entity._id).then((modifiedEntity: Entity): Promise<Entity | ServiceError> => {
                  // Check if an atomic updated failed, if so retry
                  if (!!modifiedEntity?.lastModified &&
                    new Date(modifiedEntity.lastModified).getTime() > new Date(dbEntity.lastModified).getTime()) {
                    return this.updateResolvedEntity(entity);
                  }
                  return ServiceErrorFactory.notFound(`Vocab with id '${entity._id}' not found`);
                });
              } else {
                return result.value;
              }
            })
        );
      }
      return dbEntity;
    });

  private readonly deepNestedCoalescence = <T>(base: T, feature: Partial<T>): T => {
    let keys: string[] = !!base ? Object.keys(base) : [];

    if(!!feature) {
      keys = keys.concat(Object.keys(feature)
        .filter((key: string) => !keys.find((bKey: string) => bKey === key))
      );
    }

    const coalescence: T = {} as T;

    keys.forEach((key: string) => {
      // @ts-ignore
      if (!base[key] && !!feature[key]) {
        // @ts-ignore
        coalescence[key] = feature[key];
      }

      // @ts-ignore
      if(key === 'data') {
        // @ts-ignore
        coalescence[key] = this.deepNestedCoalescence(base[key], feature[key]);
      }
    });

    return coalescence;
  };

  /**Sets the argument entity in the DB, called by a controller or client.*/
  public updateEntity(vocabID: string, entityID: string, ifUnmodifiedSince: Date, entity: Entity): Promise<Entity> {
    const filter: Filter<Entity> = {
      _id: new ObjectId(entityID),
      lastModified: {
        // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
        $eq: ifUnmodifiedSince
      }
    };

    const update: UpdateFilter<Entity> = {
      $set: {
        label: entity.label,
        description: entity.description,
        externalResources: entity.externalResources,
        type: entity.type,
        sameAs: entity.sameAs
      },
      $currentDate: {
        lastModified: true
      }
    };

    // @ts-ignore
    return (
      EntityService.collection()
        // @ts-ignore
        .findOneAndUpdate(filter, update, {returnDocument: 'after'})
        // @ts-ignore
        .then(async (result: ModifyResult<Entity>) => {
          if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
            await VocabularyService.countCollectionItems({_id: new ObjectId(vocabID)}).then((count: number) => {
              if (count < 1) {
                return ServiceErrorFactory.notFound(`Vocab with id '${vocabID}' not found`);
              }
            });
            await this.getEntity(vocabID, entityID).then((dbo: Entity) => {
              if (!!dbo && new Date(dbo.lastModified).getTime() > ifUnmodifiedSince.getTime()) {
                return ServiceErrorFactory.preconditionFailed(
                  'Target has been modified since last retrieval, the modified target is returned',
                  dbo
                );
              }
              return ServiceErrorFactory.notFound(`Entity with id '${vocabID}/${entityID}' not found`);
            });
          } else {
            return result.value;
          }
        })
    );
  }

  public deleteEntity = (vocabID: string, entityID: string, lastModified: Date): Promise<boolean> =>
    EntityService.collection()
      .deleteOne({_id: new ObjectId(entityID), vocabulary: new ObjectId(vocabID), lastModified: lastModified})
      // @ts-ignore
      .then((r) => {
        if (r.deletedCount === 1) {
          return true;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          if (!!this.getEntity(vocabID, entityID)) {
            return ServiceErrorFactory.preconditionFailed('Entity has been modified since last refresh');
          } else {
            return ServiceErrorFactory.notFound(`No entity found for ID '${vocabID}/${entityID}'`);
          }
        }
      });

  public async removeEntitiesFromVocabWithId(id: string | ObjectId): Promise<number> {
    return EntityService.collection()
      .deleteMany({vocabulary: new ObjectId(id)})
      .then((r) => r.deletedCount);
  }

  public async listEntities(query: ListQueryModel, id?: string | ObjectId): Promise<ListingResult<Entity>> {
    const {options, filter} = this.transformToMongoDBFilterOption(query, id);

    if (options instanceof Promise) {
      return options;
    }

    if (filter instanceof Promise) {
      return filter;
    }

    return (
      EntityService.collection()
        // @ts-ignore
        .find(filter, options)
        .toArray()
        .then(async (dbos) => {
          const totalItems: number = await EntityService.countCollectionItems(filter);
          return {
            offset: query.offset,
            rows: dbos.length,
            totalItems,
            items: dbos as Entity[]
          };
        })
        .catch(async (e) => {
          console.error(e);
          const totalItems: number = await EntityService.countCollectionItems(filter);
          return {
            offset: query.offset,
            rows: 0,
            totalItems,
            items: []
          };
        })
    );
  }

  // eslint-disable-next-line max-len
  private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string | ObjectId): {options: FindOptions; filter: Filter<Entity>} {
    const options: FindOptions = {};
    const filter: Filter<Entity> = {};

    if (!!id) {
      // @ts-ignore
      filter.vocabulary = new ObjectId(id);
    }

    if (!!query) {
      if (!!query?.type) {
        /* eslint-disable */
        const capitalType: TagType = query.type.toUpperCase() as TagType;

        if (Object.keys(TagType).includes(capitalType)) {
          filter.type = capitalType;
        } else {
          return {
            // @ts-ignore
            options: ServiceErrorFactory.invalidQueryValue('Invalid Parameter of type \'type\'!'),
            // @ts-ignore
            filter: ServiceErrorFactory.invalidQueryValue('Invalid Parameter of type \'type\'!')
          };
        }
        /* eslint-enable */
      }
      if (!!query?.text) {
        // @ts-ignore
        filter.$or = [
          {
            label: {
              $regex: UtilService.escapeRegExp(query.text),
              $options: 'gi'
            }
          },
          {
            description: {
              $regex: UtilService.escapeRegExp(query.text),
              $options: 'gi'
            }
          }
        ];
      }

      if (!!query?.vocabId) {
        filter.vocabulary = new ObjectId(query.vocabId);
      }

      if (!!query?.includesSameAs && query.includesSameAs.length > 0) {
        filter.sameAs = {$in: query.includesSameAs};
      }

      if (!!query?.createdSince) {
        // @ts-ignore
        filter.created = {
          // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query?.createdSince)
          // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
        };
      }

      if (!!query?.modifiedSince) {
        // @ts-ignore
        filter.lastModified = {
          // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query.modifiedSince)
        };
      }

      if (!!query?.sort) {
        // @ts-ignore
        options.sort = this.mapToMongoSort(query?.sort);
      }

      if (!!query?.offset) {
        options.skip = Number(query?.offset); // Without the cast, it won't work!
      }

      if (!!query?.rows) {
        options.limit = Number(query?.rows); // Without the cast, it won't work!
      }
    }

    return {
      options,
      filter
    };
  }

  private mapToMongoSort(sort: string): unknown {
    if (!!sort && sort.includes(' ')) {
      if (sort.toLowerCase().includes('created')) {
        return {
          created: sort.toLowerCase().includes('asc') ? 1 : -1
        };
      } else {
        return {
          lastModified: sort.toLowerCase().includes('asc') ? 1 : -1
        };
      }
    }
    return {};
  }
}

export const entityServiceInstance: EntityService = new EntityService();

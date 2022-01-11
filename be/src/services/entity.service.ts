import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, FindOptions, InsertOneResult, ModifyResult, ObjectId, UpdateFilter} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity} from '../models/dbo.models';
import {vocabularyService} from './vocabulary.service';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';
import {TagType} from '../generated';

export class EntityService {
  private static collection(): Collection {
    return persistenceService.db().collection('entities');
  }

  private static countCollectionItems(filter: Filter<Entity>): Promise<number> {
    // @ts-ignore
    return this.collection().countDocuments(filter);
  }

  public createEntity(entity: Entity): Promise<Entity> {
    return vocabularyService.getVocabular(entity.vocabulary).then(() =>
      EntityService.collection()
        .insertOne({
          ...entity,
          _id: undefined,
          created: new Date(),
          lastModified: new Date()
        })
        .then((result: InsertOneResult) => this.getEntity(entity.vocabulary, result.insertedId)));
  }

  public getEntity(vocabID: string | ObjectId, entityID: string | ObjectId): Promise<Entity> {
    return vocabularyService.getVocabular(vocabID)
      .then(() => EntityService.collection()
        .findOne({
          _id: new ObjectId(entityID),
          vocabulary: new ObjectId(vocabID)
        })
        .then(result => {
          if (!!result?._id) {
            return result as Entity;
          }
          throw new KnowledgeError(404,
            'Not found',
            `Target entity with id '${entityID}' in vocabulary '${vocabID}' not found`);
        }));
  }

  updateEntity(vocabID: string, entityID: string, ifUnmodifiedSince: Date, entity: Entity): Promise<Entity> {
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

    return EntityService.collection()
      // @ts-ignore
      .findOneAndUpdate(filter, update, { returnDocument: 'after' })
      // @ts-ignore
      .then(async (result: ModifyResult<Entity>) => {
        if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
          // TODO use vocab count in the future
          await vocabularyService.getVocabular(vocabID); // Throws appropiate error if not found
          await this.getEntity(vocabID, entityID)
            .then((dbo: Entity) => {
              if (!!dbo && new Date(dbo.lastModified).getTime() > ifUnmodifiedSince.getTime()) {
                throw new KnowledgeError(412, 'Precondition Failed',
                  'Target has been modified since last retrieval, the modified target is returned', dbo);
              }
              throw new KnowledgeError(404, 'Not Found', `Entity with id '${vocabID}/${entityID}' not found`);
            });
        } else {
          return result.value;
        }
      });
  }

  public deleteEntity = (vocabID: string, entityID: string, lastModified: Date): Promise<boolean> => EntityService.collection()
    .deleteOne({ _id: new ObjectId(entityID), vocabulary: new ObjectId(vocabID), lastModified: lastModified })
    .then(r => {
      if (r.deletedCount === 1) {
        return true;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!!this.getEntity(vocabID, entityID)) {
          throw new KnowledgeError(412, 'Header', 'Entity has been modified since last refresh');
        } else {
          throw new KnowledgeError(404, 'Entity', `No entity found for ID '${vocabID}/${entityID}'.`);
        }
      }
    });

  public async listEntities(query: ListQueryModel, id?: string | ObjectId): Promise<ListingResult<Entity>> {
    const { options, filter } = this.transformToMongoDBFilterOption(query, id);
    return EntityService.collection()
      // @ts-ignore
      .find(filter, options)
      .toArray()
      .then(dbos => {
        const totalItems: number = await EntityService.countCollectionItems(filter);
        return {
          offset: query.offset,
          rows: dbos.length,
          totalItems,
          items: dbos as Entity[]
        };
      });
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '');
  }

  // eslint-disable-next-line max-len
  private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string | ObjectId): { options: FindOptions; filter: Filter<Entity> } {
    const options: FindOptions = {};
    const filter: Filter<Entity> = {};

    if (!!id) {
      // @ts-ignore
      filter.vocabulary = new ObjectId(id);
    }

    if (!!query?.type) {
      /* eslint-disable */
      const capitalType: TagType = query.type.toUpperCase() as TagType;

      if (Object.keys(TagType).includes(capitalType)) {
        filter.type = capitalType;
      } else {
        throw new KnowledgeError(404, 'Bad Request', 'Invalid Parameter of type \'type\'!');
      }
      /* eslint-enable */
    }

    if (!!query) {
      if (!!query?.text) {
        filter.$or = [
          {
            label: {
              $regex: this.escapeRegExp(query.text),
              $options: 'gi'
            }
          },
          {
            description: {
              $regex: this.escapeRegExp(query.text),
              $options: 'gi'
            }
          }
        ];
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

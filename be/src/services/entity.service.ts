import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, InsertOneResult, UpdateFilter, UpdateResult, ObjectId, FindOptions} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity, Vocabulary} from '../models/dbo.models';
import {vocabularyService} from './vocabulary.service';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';

export class EntityService {
  private static collection(): Collection {
    return persistenceService.db().collection('entities');
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

  public getEntities(vocabID: string | ObjectId): Promise<Entity[]> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const vocabNotFound = () => {
      throw new KnowledgeError(404,
        'Not found',
        `Target vocabulary '${vocabID}' not found`);
    };

    return vocabularyService.getVocabular(vocabID)
      .then((vocab: Vocabulary) => {
        if (!!vocab?._id) {
          return EntityService.collection()
            .find({ vocabulary: new ObjectId(vocabID) })
            .toArray()
            .then(e => e as Entity[]);
        }
        vocabNotFound();
      })
      .catch(vocabNotFound);
  }

  updateEntity(vocabID: string, entityID: string, ifUnmodifiedSince: Date, entity: Entity): Promise<Entity> {
    // get Entity throws errors if vocab or entity cannot be found
    return this.getEntity(vocabID, entityID).then((dbo: Entity) => {
      if (dbo.lastModified.getTime() > ifUnmodifiedSince.getTime()) {
        throw new KnowledgeError(
          412,
          'Precondition Failed',
          'Target has been modified since last retrieval, the modified target is returned',
          dbo
        );
      }

      const filter: Filter<Entity> = {
        _id: dbo._id,
        lastModified: {
          // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
          $lte: ifUnmodifiedSince
        }
      };

      const updateValue = {
        _id: entity._id,
        label: entity.label,
        description: entity.description,
        externalResources: entity.externalResources,
        sameAs: entity.sameAs,
        lastModified: new Date()
      };

      const update: UpdateFilter<Entity> = { $set: updateValue };

      // @ts-ignore
      return EntityService.collection().updateOne(filter, update, { upsert: false }).then((result: UpdateResult) => {
        if (result.modifiedCount === 1) {
          return {
            ...updateValue,
            type: dbo.type,
            created: dbo.created,
            data: dbo.data,
            vocabulary: dbo.vocabulary
          };
        } else {
          throw new KnowledgeError(404, 'Not found', `Target entity with id '${entityID}' not found`);
        }
      });
    });
  }

    public async deleteEntity(vocabID: string, entityID: string, lastModified: Date): Promise<boolean> {

        if (!await vocabularyService.getVocabular(vocabID)) {
            throw new KnowledgeError(404, 'Vocabulary', `No vocabulary matches the provided ID '${vocabID}'.`)
        }

        if (!await this.getEntity(vocabID, entityID)) {
            throw new KnowledgeError(404, 'Entity', `No entity matches the provided ID '${vocabID}'.`)
        }

        return EntityService.collection().deleteOne({_id: new ObjectId(entityID), lastModified: lastModified})
            .then(r => {
                if (r.deletedCount === 1) {
                    return true
                } else {
                    throw new KnowledgeError(412, 'Header', 'Header does not match!')
                }
            })
    }

    public async listEntities(query: ListQueryModel, id?: string | ObjectId): Promise<ListingResult<Entity>> {
        const {options, filter} = this.transformToMongoDBFilterOption(query, id);
        // @ts-ignore
        const dbos: Entity[] = (await EntityService.collection().find(filter, options).toArray()) as Entity[];
        return {
            offset: query.offset,
            rows: dbos.length,
            totalItems: 0, // TODO
            items: dbos
        };
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '');
    }

    // eslint-disable-next-line max-len
    private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string | ObjectId): {options: FindOptions; filter: Filter<Entity>} {
        const options: FindOptions = {};
        const filter: Filter<Entity> = {};

        if (!!id) {
            // @ts-ignore
            filter.vocabulary = new ObjectId(id);
        }

        if (!!query?.type){
            filter.type = query.type
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

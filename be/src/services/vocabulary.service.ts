import {Collection, DeleteResult, Document, Filter, FindOptions, ModifyResult, ObjectId, UpdateFilter} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance as persistenceService} from './persistence.service';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';
import {entityServiceInstance} from './entity.service';
import {UtilService} from './util.service';
import {ServiceError, ServiceErrorFactory} from '../models/service-error.model';

export class VocabularyService {
  private static collection(): Collection {
    return persistenceService.db().collection('vocabularies');
  }

  public static countCollectionItems(filter: Filter<Vocabulary>): Promise<number> {
    // @ts-ignore
    return this.collection().countDocuments(filter);
  }

  public createVocab(newVocab: Vocabulary): Promise<Vocabulary> {
    return VocabularyService.collection()
      .insertOne({
        ...newVocab,
        _id: null,
        created: new Date(),
        lastModified: new Date()
      })
      .then((result) => result.insertedId)
      .then((id) => this.getVocabular(id));
  }

  public getVocabular(id: string | ObjectId): Promise<Vocabulary> {
    const pipeline = VocabularyService.createMongoAggregationPipeline(new ObjectId(id));
    return VocabularyService.collection()
      .aggregate(pipeline)
      .next()
    // @ts-ignore
      .then(result => {
        if (!!result?._id) {
          return result as Vocabulary;
        }
        return ServiceErrorFactory.notFound('Vocabulary not found!');
      })
  }

  public deleteVocab = (id: string | ObjectId, date: Date): Promise<boolean> => VocabularyService.collection()
    .deleteOne({ _id: new ObjectId(id), lastModified: date })
    .then(async (r: DeleteResult) => {
      if (r.deletedCount === 1) {
        return entityServiceInstance.removeEntitiesFromVocabWithId(id).then(() => true);
      } else {
        await VocabularyService.collection()
          .findOne({ _id: new ObjectId(id) })
          .then(result => {
            if (!!result?._id) {
              return ServiceErrorFactory.preconditionFailed('If-Unmodified-Since has changed in the meantime!');
            }
            return ServiceErrorFactory.notFound('Vocabulary not found');
          });
      }
    });

  public updateVocab(id: string, ifUnmodifiedSince: Date, newVocab: Vocabulary): Promise<Vocabulary> {
    const query: Filter<Vocabulary> = {
      _id: new ObjectId(id),
      lastModified: {
        // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
        $eq: ifUnmodifiedSince
      }
    };

    const update: UpdateFilter<Vocabulary> = {
      $set: {
        _id: new ObjectId(id),
        label: newVocab.label,
        description: newVocab.description
      },
      $currentDate: {
        lastModified: true
      }
    };

    // @ts-ignore
    return VocabularyService.collection()
      // @ts-ignore
      .findOneAndUpdate(query, update, { returnDocument: 'after' })
      // @ts-ignore
      .then((result: ModifyResult<Vocabulary>) => {
        // @ts-ignore
        if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
          return this.updateVocabNotFoundError(query);
        } else {
          return result.value;
        }
      });
  }

  private updateVocabNotFoundError(filter: Filter<Vocabulary>): Promise<ServiceError> {
    delete filter.lastModified;
    return VocabularyService.collection()
      // @ts-ignore
      .findOne(filter)
      // @ts-ignore
      .then((v: Vocabulary) =>
        v._id.toHexString() === filter._id.toHexString() ?
          ServiceErrorFactory.preconditionFailed('Target has been modified since last retrieval, the modified target is returned') :
          ServiceErrorFactory.notFound('Target vocabulary with id \'$ {id}\' not found')
      );
  }

  // eslint-disable-rows-line @typescript-eslint/explicit-module-boundary-types
  public async listVocab(query: ListQueryModel): Promise<ListingResult<Vocabulary>> {
    const { options, filter } = VocabularyService.transformToMongoDBFilterOption(query);
    const pipeline = VocabularyService.createMongoAggregationPipeline(null, filter, options);
    const itemPromise = VocabularyService.collection().aggregate(pipeline).toArray();
    const totalItemsPromise = VocabularyService.countCollectionItems(filter);
    return Promise.all([itemPromise, totalItemsPromise])
      .then(result => {
        console.log(result[0]);
        return {
          offset: query.offset,
          rows: result[0].length,
          totalItems: result[1],
          items: result[0] as Vocabulary[]
        }
      })
  }

  // eslint-disable-next-line max-len
  private static transformToMongoDBFilterOption(query?: ListQueryModel): { options: FindOptions; filter: Filter<Vocabulary> } {
    const options: FindOptions = {};
    const filter: Filter<Vocabulary> = {};

    if (!!query) {
      if (!!query?.text) {
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
        options.sort = VocabularyService.mapToMongoSort(query?.sort);
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

  private static mapToMongoSort(sort: string): unknown {
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

  private static createMongoAggregationPipeline(
    matchIds?: string|ObjectId,
    filter?: Filter<Vocabulary>,
    options?: FindOptions): Document[] {
    const pipeline = [];

    if (matchIds) {
      const matchData = {'$match': {
        '_id': matchIds
      }
      };
      pipeline.push(matchData);
    }

    if (filter && Object.keys(filter).length > 0) {
      pipeline.push(filter);
    }

    if (options && Object.keys(options).length > 0) {
      pipeline.push(options);
    }

    const lookupData = {
      $lookup:
          {
            from: 'entities',
            let:{vocabId: '$_id'},
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$vocabulary','$$vocabId']
                  }
                }
              },
              {
                $count: 'count'
              }
            ],
            as: 'entityCount'
          }
    };
    const unwindData = {
      $unwind: {
        path: '$entityCount',
        preserveNullAndEmptyArrays: true
      }
    };
    const addFields = {
      $addFields: {
        entityCount: {
          $ifNull: ['$entityCount.count', 0]
        }
      }
    };
    pipeline.push(lookupData, unwindData, addFields);

    return pipeline;
  }
}

export const vocabularyService: VocabularyService = new VocabularyService();

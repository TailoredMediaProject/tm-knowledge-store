import {Collection, DeleteResult, Document, Filter, ModifyResult, ObjectId, UpdateFilter} from 'mongodb';
import {Entity, Vocabulary} from '../models/dbo.models';
import {instance as persistenceService} from './persistence.service';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';
import {DB_COLLECTION_VOCABULARIES, HEADER_IF_UNMODIFIED_SINCE} from '../models/constants';
import {entityServiceInstance} from './entity.service';
import {UtilService} from './util.service';
import {ServiceError, ServiceErrorFactory} from '../models/service-error.model';

export class VocabularyService {
  private static collection(): Collection {
    return persistenceService.db().collection(DB_COLLECTION_VOCABULARIES);
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
      });
  }

  public getVocabularyWithSlug(slug: string): Promise<Vocabulary> {
    const pipeline = VocabularyService.createMongoAggregationPipeline(null, {slug});
    return VocabularyService.collection()
      .aggregate(pipeline)
      .next()
      .then(result => {
        if (!!result?._id) {
          return result as Vocabulary;
        }
      })
  }

  public deleteVocab = (id: string | ObjectId, date: Date): Promise<boolean> => VocabularyService.collection()
    .deleteOne({_id: new ObjectId(id), lastModified: date})
    .then(async (r: DeleteResult) => {
      if (r.deletedCount === 1) {
        return entityServiceInstance.removeEntitiesFromVocabWithId(id).then(() => true);
      } else {
        await VocabularyService.collection()
          .findOne({_id: new ObjectId(id)})
          .then(result => {
            if (!!result?._id) {
              return ServiceErrorFactory.preconditionFailed(`${HEADER_IF_UNMODIFIED_SINCE} has changed in the meantime!`);
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
      .findOneAndUpdate(query, update, {returnDocument: 'after'})
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
    const pipeline = VocabularyService.createMongoAggregationPipeline(undefined, query);
    const itemPromise = VocabularyService.collection().aggregate(pipeline).toArray();
    // @ts-ignore
    const totalItemsPromise = VocabularyService.countCollectionItems(pipeline?.$matchData as Filter<Vocabulary>);
    return Promise.all([itemPromise, totalItemsPromise])
      .then(result => ({
        offset: query.offset,
        rows: result[0].length,
        totalItems: result[1],
        items: result[0] as Vocabulary[]
      }));
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

  private static createMongoAggregationPipeline(id: string | ObjectId, query?: ListQueryModel): Document[] {
    const pipeline = [];
    const matchData: Partial<Entity> = {};

    if (ObjectId.isValid(id)) {
      matchData._id = new ObjectId(id);
    }

    if (!!query?.slug) {
      // @ts-ignore
      matchData.slug = query.slug;
    }

    if (!!query?.text) {
      // @ts-ignore
      matchData.$or = [
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
      matchData.created = {
        // @ts-ignore
        $gte: new Date(query?.createdSince)
        // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
      };
    }

    if (!!query?.modifiedSince) {
      matchData.lastModified = {
        // @ts-ignore
        $gte: new Date(query.modifiedSince)
      };
    }

    // @ts-ignore
    if(!!matchData?._id || !!matchData?.$or || !!matchData?.created || !!matchData?.lastModified || !!matchData?.slug) {
      pipeline.push({$match: matchData});
    }

    if (!!query?.sort) {
      // https://docs.mongodb.com/manual/reference/operator/aggregation/sort/#-sort-operator-and-performance
      pipeline.push({$sort: VocabularyService.mapToMongoSort(query?.sort)});
    }

    const lookupData = {
      $lookup:
        {
          from: 'entities',
          let: {vocabId: '$_id'},
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$vocabulary', '$$vocabId']
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

    if (!!query?.offset) {
      pipeline.push({$skip: Number(query?.offset)});
    }

    if (!!query?.rows) {
      pipeline.push({$limit: Number(query?.rows)});
    }

    return pipeline;
  }
}

export const vocabularyService: VocabularyService = new VocabularyService();

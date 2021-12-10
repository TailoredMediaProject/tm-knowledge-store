import {Collection, Filter, FindOptions, ObjectId} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance, PersistenceService} from './persistence.service';
import ListQueryModel from '../models/list-query.model';

export class VocabularyService {
  private readonly persistence: PersistenceService = instance;
  private readonly vocabCollection: string = 'vocabularies';
  private readonly collection = (): Collection => this.persistence.db().collection(this.vocabCollection);

  public createVocab(newVocab: Vocabulary): Promise<Vocabulary> {

    return this.collection().insertOne({
      ...newVocab,
      _id: null,
      created: new Date(),
      lastModified: new Date()
    })
      .then((result) => result.insertedId)
      .then(id => this.getVocabulary(id));
  }

  public getVocabulary(id: string | ObjectId): Promise<Vocabulary> {
    return this.listVocab(undefined, id)
      .then(vocabs => vocabs.find(v => !!v));
  }

  public async listVocab(query: ListQueryModel, id?: string | ObjectId): Promise<Vocabulary[]> {
    const { options, filter } = this.transformToMongoDBFilterOption(query, id);
    // @ts-ignore
    return await this.collection().find(filter, options).toArray() as Vocabulary[];
  }

  private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string | ObjectId):
    { options: FindOptions, filter: Filter<Vocabulary> } {
    const options: FindOptions = {};
    const filter: Filter<Vocabulary> = {};

    if (!!id) {
      // @ts-ignore
      filter._id = new ObjectId(id);
    }

    if (!!query) {
      if (!!query?.text) {
        filter.$or = [
          {
            label: {
              $regex: `${query.text}`,
              $options: 'gi'
            }
          },
          {
            description: {
              $regex: `${query.text}`,
              $options: 'gi'
            }
          }
        ];
      }

      if (!!query?.createdSince) {
        // @ts-ignore
        filter.created = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query?.createdSince)
          // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
        };
      }

      if (!!query?.modifiedSince) {
        // @ts-ignore
        filter.lastModified = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query.modifiedSince)
        };
      }

      if (!!query?.sort) {
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

  private mapToMongoSort(sort: string): any {
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

export const vocabularyService: VocabularyService = new VocabularyService();

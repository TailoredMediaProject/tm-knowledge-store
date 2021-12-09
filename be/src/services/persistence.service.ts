import {Collection, Db, DeleteResult, Document, Filter, FindOptions, MongoClient, WithId} from 'mongodb';
import {KnowledgeResponse} from '../models/response-body.model';
import ListQueryModel from '../models/list-query.model';
import {Vocabulary} from '../generated/model/vocabulary';

class PersistenceService {
  private client: MongoClient;
  private db: Db;
  private readonly MONGO_DATABASE: string;
  private readonly COLLECTION_VOCABULARY = 'vocabulary';

  constructor() {
    this.initClient();
    this.pingDB().catch(error => console.error(error));
    void this.test();
  }

  private initClient(): void {
    const MONGO_URL: string = PersistenceService.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
    const MONGO_DATABASE: string = PersistenceService.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

    this.client = new MongoClient(MONGO_URL, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });

    this.client.connect(err => {
      if (err) {
        console.log('Initial connection to MongoDB failed', err);
      } else {
        console.log('Initial connection to MongoDB successful');
      }
    });

    this.db = this.client.db(MONGO_DATABASE);
  }

  private static errorWhenFalsy(varName: string, value: string): string {
    if (!value) {
      throw new Error(`${varName} "${value}" falsy!`);
    }
    return value;
  }

  public async pingDB(): Promise<boolean> {
    try {
      const res = await this.db.command({ ping: 1 });

      return res.ok === 1;
    } catch (err) {
      console.error(err);
    }
    return false;
  }

  create(): void {
    console.log('create');
  }

  async list(query?: ListQueryModel, id?: string): Promise<KnowledgeResponse> {
    const {options, filter} = this.transformToMongoDBFilterOption(query, id);

    // @ts-ignore
    const result: WithId<Document>[] = await this.db.collection(this.COLLECTION_VOCABULARY).find(filter, options).toArray();
    const items: Vocabulary[] = result.map(r => {
      delete r._id;
      return r as unknown as Vocabulary;
    });

    return {
      offset: options.skip ?? 0,
      rows: items.length,
      totalItems: 0, // TODO
      items
    };
  }

  private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string): {options: FindOptions, filter: Filter<Vocabulary>} {
    const options: FindOptions = {};
    const filter: Filter<Vocabulary> = {};

    if(!!id) {
      // @ts-ignore
      filter.id = id;
    }

    if(!!query) {
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

      if(!!query?.createdSince) {
        // @ts-ignore
        filter.created = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query?.createdSince)
          // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
        };
      }

      if(!!query?.modifiedSince) {
        // @ts-ignore
        filter.lastModified = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query.modifiedSince)
        };
      }

      if(!!query?.sort) {
        options.sort = PersistenceService.mapToMongoSort(query?.sort);
      }

      if(!!query?.offset) {
        options.skip = Number(query?.offset); // Without the cast, it won't work!
      }

      if(!!query?.rows) {
        options.limit = Number(query?.rows); // Without the cast, it won't work!
      }
    }

    return {
      options,
      filter
    };
  }

  private static mapToMongoSort(sort: string): any {
    if(!!sort && sort.includes(' ')) {
      if(sort.toLowerCase().includes('created')) {
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

  private async deleteAllVocabularies(): Promise<void> {
    const v: Collection = this.db.collection(this.COLLECTION_VOCABULARY);
    const dr: DeleteResult = await v.deleteMany({});

    console.log(dr);
  }

  private async test(): Promise<void> {
    const v: Collection = this.db.collection(this.COLLECTION_VOCABULARY);
    // @ts-ignore
    const vocabs: Vocabulary[] = Array.from({length: 10}, (x, i) => ({
        id: `${Date.now() + i}`,
        created: new Date(Date.now()),
        lastModified: new Date(Date.now()),
        label: `Schneelandschaft ${i}`,
        description: `Eine Landschaft die mit Schnee bedeckt ist ${i}`,
        entityCount: 0
      }));

    await v.insertMany(vocabs);
  }
}

export default new PersistenceService();

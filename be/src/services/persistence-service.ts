import {Collection, Db, Filter, FindOptions, MongoClient, WithId} from 'mongodb';
import {KnowledgeResponse} from '../models/response-body.model';
import ListQueryModel from '../models/list-query.model';
import {Vocabulary} from '../generated';

class PersistenceService {
  private client: MongoClient;
  private db: Db;
  private MONGO_DATABASE: string;
  private COLLECTION_VOCABULARY = 'vocabulary';

  constructor() {
    this.initClient();
    this.pingDB().catch(error => console.error(error));
    void this.test();
  }

  private initClient() {
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
  };

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

  async list(query?: ListQueryModel): Promise<KnowledgeResponse> {
    const options: FindOptions = {};
    const filter: Filter<Vocabulary> = {};

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

      // if(!!query?.createdSince) {
      //   filter.created = {
      //     $gte: new Date(query.createdSince)
      //   };
      // }
      //
      // if(!!query?.modifiedSince) {
      //   filter.lastModified = {
      //     $gte: new Date(query.modifiedSince)
      //   };
      // }

      options.sort = PersistenceService.map2MongoSort(query?.sort);
      options.skip = query?.offset;
      options.limit = query?.rows;
    }

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
    } as KnowledgeResponse;
  }

  public static map2MongoSort(sort: string): any {
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

  private async test(): Promise<void> {
    const v: Collection = await this.db.collection(this.COLLECTION_VOCABULARY);

    // @ts-ignore
    await v.insertOne(
      {
        id: '2783954',
        created: new Date(Date.now()).toISOString(),
        lastModified: new Date(Date.now()).toISOString(),
        label: 'Schneelandschaft',
        description: 'Eine Landschaft die mit Schnee bedeckt ist',
        entityCount: 0
      });
  }
}

export default new PersistenceService();

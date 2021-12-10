import {Collection, Db, DeleteResult, Filter, FindOptions, MongoClient} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';

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

  list(options: FindOptions, filter: Filter<Vocabulary>): Promise<Vocabulary[]> {
    // @ts-ignore
    return this.db.collection(this.COLLECTION_VOCABULARY).find(filter, options).toArray() as Vocabulary[];
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

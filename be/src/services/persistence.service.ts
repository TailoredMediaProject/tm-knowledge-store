import {Db, MongoClient} from 'mongodb';

export class PersistenceService {
  private client: MongoClient;
  private _db: Db;
  private readonly MONGO_DATABASE: string

  constructor() {
    this.initClient();
    this.pingDB().catch(error => console.error(error));
  }

  public db(): Db {
    return this._db;
  }

  private initClient(): void {
    const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
    const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

    console.log(`Trying to connect to MONGO_DATABSE=${MONGO_DATABASE} with MONGO_URL=${MONGO_URL}`)
    this.client = new MongoClient(MONGO_URL, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    })

    this.client.connect(err => {
      if (err) {
        console.log('Initial connection to MongoDB failed', err);
      } else {
        console.log('Initial connection to MongoDB successful');
      }
    });

    this._db = this.client.db(MONGO_DATABASE);
  }

  private errorWhenFalsy(varName: string, value: string): string {
    if(!value) {
      throw new Error(`${varName} "${value}" falsy!`);
    }
    return value;
  }

  public async pingDB(): Promise<boolean> {
    try {
      const res = await this._db.command({ping: 1});
      return res.ok === 1;
    }
    catch (err){
      console.error(err)
    }
    return false;
  }
}

export const instance =  new PersistenceService();

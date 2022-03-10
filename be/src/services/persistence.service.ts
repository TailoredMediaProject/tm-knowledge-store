import {Db, MongoClient, MongoClientOptions, MongoError} from 'mongodb';

export class PersistenceService {
  private client: MongoClient;
  private _db: Db;

  constructor() {
    this.initClient();
    this.pingDB().catch((error) => console.error(error));
  }

  db(): Db {
    return this._db;
  }

  /* eslint-disable no-undef */
  private initClient(): void {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const authPathParams = !!username && !!password ? `${username}:${password}@` : '';
    const dbHost = process.env.MONGO_HOST || 'localhost';
    const dbPort = +(process.env.MONGO_PORT || 27018);
    const dbName = process.env.MONGO_DATABASE || 'knowledge';
    const mongoUrl: string = process.env.MONGO_URL || `mongodb://${authPathParams}${dbHost}:${dbPort}/${dbName}`;

    const mongoClientOptions: MongoClientOptions = {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    } as MongoClientOptions;

    this.client = new MongoClient(mongoUrl, mongoClientOptions);

    this.client.connect((error: MongoError | Error) => {
      if (error) {
        console.error('Connection to MongoDB failed!');
      } else {
        console.log('Initial connection to MongoDB successful');
      }
    });

    this._db = this.client.db(dbName);
  }

  public async pingDB(): Promise<boolean> {
    try {
      const res = await this._db.command({ ping: 1 });
      return res.ok === 1;
    } catch (err) {
      console.error(err);
    }
    return false;
  }

  create(): void {
    console.log('create');
  }
}

export const instance = new PersistenceService();

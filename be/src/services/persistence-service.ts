import {Db, MongoClient} from 'mongodb';

export class PersistenceService {
    private client: MongoClient;
    private _db: Db;
    private readonly MONGO_DATABASE: string

    constructor() {
        this.initClient();
        this.pingDB().catch(error => console.error(error));
    }

    get db(): Db {
        return this._db;
    }

    private initClient(): void {
        const username = process.env.MONGO_USERNAME;
        const password = process.env.MONGO_PASSWORD;
        const authPathParams = !!username && !!password ? `${username}:${password}@`: '';
        const dbHost = process.env.MONGO_HOST || 'localhost';
        const dbPort = +(process.env.MONGO_PORT || 27017);
        const dbName = process.env.MONGO_DATABASE || 'knowledge';
        const mongoUrl: string = process.env.MONGO_URL || `mongodb://${authPathParams}${dbHost}:${dbPort}`;

        this.client = new MongoClient(mongoUrl, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        })

        this.client.connect(() => {
            console.log('Initial connection to MongoDB successful')
        });

        this._db = this.client.db(dbName);
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

    create(): void {
        console.log("create");
    }
}

export const instance =  new PersistenceService();

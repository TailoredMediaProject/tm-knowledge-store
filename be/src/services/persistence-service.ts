import {Db, MongoClient} from 'mongodb';

export class PersistenceService {
    private client: MongoClient;
    private _db: Db;
    private MONGO_DATABASE: string

    constructor() {
        this.initClient();
        this.pingDB().catch(error => console.error(error));
    }


    get db(): Db {
        return this._db;
    }

    private initClient() {
        const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

        this.client = new MongoClient(MONGO_URL, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        })

        this.client.connect(err => {
            console.log('Initial connection to MongoDB successful')
        });

        this._db = this.client.db(MONGO_DATABASE);
    };

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

    create(): void {
        console.log("create");
    }
}

export const instance =  new PersistenceService();

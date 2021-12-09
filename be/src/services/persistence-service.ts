import {Db, MongoClient} from 'mongodb';

class PersistenceService {
    private client: MongoClient;
    private db: Db;
    private readonly MONGO_DATABASE: string

    constructor() {
        this.initClient();
        this.pingDB().catch(error => console.error(error));
    }


    private initClient(): void {
        const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

        this.client = new MongoClient(MONGO_URL, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        })

        this.client.connect(() => {
            console.log('Initial connection to MongoDB successful')
        });

        this.db = this.client.db(MONGO_DATABASE);
    }

    private errorWhenFalsy(varName: string, value: string): string {
        if(!value) {
            throw new Error(`${varName} "${value}" falsy!`);
        }
        return value;
    }

    public async pingDB(): Promise<boolean> {
        try {
            const res = await this.db.command({ping: 1});
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

export default new PersistenceService();

import {Db, MongoClient} from 'mongodb';

class PersistenceService {
    private client: MongoClient;
    private db: Db;
    private MONGO_DATABASE: string


    constructor() {
        console.log("----------------PersistenceService")
        this.initClient();
        this.pingDB().then(r => console.log(r));
    }


    private initClient() {
        const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

        this.client = new MongoClient(MONGO_URL, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        })

        this.client.connect(err => {
            console.log('Connected to MongoDB')
        });

        this.db = this.client.db(MONGO_DATABASE);
    };

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

// interface Entity {
//     id: string
//     vocabulary: Vocabulary
//     canonicalLink: string
//     created: Date
//     lastModified: Date
//     label: string
//     description: string
//     externalResources: Array<any>
//     sameAs: Array<any>
//     data: Array<any>}
//
//
// interface Vocabulary {
//     id: string
//     created: Date
//     lastModified: Date
//     label: string
//     description: string
//     entityCount: number
// }
//
// function create(entity: Entity): Entity {
//     // check required properties to be valid
//     // add new entry for entity variable in DB
//     // Return new id (or whole entity object)
//     mongo.add(entity)
//
//
//     return entity
// }
//
// console.log("hello world")

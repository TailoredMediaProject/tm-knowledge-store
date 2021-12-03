import {Db, MongoClient} from 'mongodb';

class PersistenceService {
    private client: MongoClient;
    private db: Db;

    constructor() {
        console.log("----------------PersistenceService")
        this.initClient();
        void this.check().catch(console.error);
    }


    private initClient() {
        const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

        this.client = new MongoClient(MONGO_URL);
        this.db = this.client.db(MONGO_DATABASE);
    };

    private errorWhenFalsy(varName: string, value: string): string {
        if(!value) {
            throw new Error(`${varName} "${value}" falsy!`);
        }
        return value;
    }

    public pingDB(): boolean {
        // this.db.command();
        return false;
    }

    private async check() {
        try {
            console.log("11-------!!!!!!---------------!!!!!!---------------!!!!!!--------");

            await this.client.connect();
            console.log("22-------!!!!!!---------------!!!!!!---------------!!!!!!--------");

            const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);
            console.log("33-------!!!!!!---------------!!!!!!---------------!!!!!!--------");

            await this.client.db(MONGO_DATABASE).command({ ping: 1 });
            console.log("44-------!!!!!!---------------!!!!!!---------------!!!!!!--------");

        }
        catch (err){
            console.log("55-------!!!!!!---------------!!!!!!---------------!!!!!!--------");
            console.error(err)
        }
        finally {
            console.log("66-------!!!!!!---------------!!!!!!---------------!!!!!!--------");
            await this.client.close();
        }
    };

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

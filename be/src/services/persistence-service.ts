import {MongoClient} from 'mongodb';

export default class PersistenceService {
    private client: MongoClient;

    constructor() {
        console.log("MONGO DB");
        this.initClient();
        void this.check();
    }

    private initClient() {
        const MONGO_URL: string = this.errorWhenFalsy('MONGO_URL', process.env.MONGO_URL);
        const MONGO_USERNAME: string = this.errorWhenFalsy('MONGO_USERNAME', process.env.MONGO_USERNAME);
        const MONGO_PASSWORD: string = this.errorWhenFalsy('MONGO_PASSWORD', process.env.MONGO_PASSWORD);
        const dashIndex = MONGO_URL.indexOf('//');

        if(dashIndex < 0) {
            throw new Error(`MONGO_URL "${MONGO_URL}" invalid!`);
        }

        const URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URL.substring(dashIndex + 2)}?retryWrites=true&w=majority`;

        console.log(URI);

        // this.client = new MongoClient(URI);
    };

    private errorWhenFalsy(varName: string, value: string): string {
        if(!value) {
            throw new Error(`${varName} "${value}" falsy!`);
        }
        return value;
    }

    private async check() {
        try {
            await this.client.connect();

            const MONGO_DATABASE: string = this.errorWhenFalsy('MONGO_DATABASE', process.env.MONGO_DATABASE);

            await this.client.db(MONGO_DATABASE).command({ ping: 1 });

            console.log("Connected successfully to server");
        } finally {
            await this.client.close();
        }
    };

    create(): void {
        console.log("create");
    }
}

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

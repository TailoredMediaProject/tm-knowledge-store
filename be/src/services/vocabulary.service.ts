import {Collection, Db, FindCursor, MongoClient, ObjectId, WithId} from 'mongodb';
import {Vocabulary} from "../models/dbo.models";
import {instance, PersistenceService} from "./persistence-service";

// class Vocabulary { //implements VocabularyI {
//     private _id: ObjectId;
//     private created: Date;
//     private lastModified: Date;
//     private label: string;
//     private description: string;
//     private entityCounter: number;
//
//
//     constructor(_id: ObjectId, created: Date, lastModified: Date, label: string, description: string, entityCounter: number) {
//         this._id = _id;
//         this.created = created;
//         this.lastModified = lastModified;
//         this.label = label;
//         this.description = description;
//         this.entityCounter = entityCounter;
//     }
// }

export class VocabularyService {
    private persistence: PersistenceService = instance

    readonly vocabCollection: string = "vocabularies"

    private get collection(): Collection {
        return this.persistence.db.collection(this.vocabCollection);
    }

    public async createVocab(newVocab: Vocabulary): Promise<Vocabulary> {

        return await this.collection.insertOne({
            label: newVocab.label,
            description: newVocab.description
        }).then((result) => {
            return result.insertedId
        }).then(id => {
            return this.getVocabular(id)
        });
    }

    public getVocabular(id: string | ObjectId): Vocabulary {
        // TODO: How should you do this check?
        // if (typeof id !== typeof ObjectId) {
        //     id = new ObjectId(id)
        // }
        let x = this.collection.find({_id: new ObjectId(id)})

        const vocab: Vocabulary = new class implements Vocabulary {
            _id: ObjectId;
            created: Date;
            description: string;
            label: string;
            lastModified: Date;
        }

        return vocab
    }

    public readVocab(): void {

    }
}

export const vocabularyService: VocabularyService = new VocabularyService()

import {Collection, Db, FindCursor, MongoClient, ObjectId, WithId} from 'mongodb';
import {Vocabulary} from "../models/dbo.models";
import {instance, PersistenceService} from "./persistence.service";

export class VocabularyService {
    private persistence: PersistenceService = instance
    readonly vocabCollection: string = "vocabularies"

    private get collection(): Collection {
        return this.persistence.db.collection(this.vocabCollection);
    }

    public createVocab(newVocab: Vocabulary): Promise<Vocabulary> {

        return this.collection.insertOne({
            ...newVocab,
            _id: null,
            created: new Date(),
            lastModified: new Date()
        }).then((result) => {
            return result.insertedId
        }).then(id => {
            return this.getVocabular(id)
        });
    }

    public getVocabular(id: string | ObjectId): Promise<Vocabulary> {
        return this.collection.findOne({_id: new ObjectId(id)}).then(x => <Vocabulary>x);
    }

    public readVocab(): void {
        // TODO
    }
}

export const vocabularyService: VocabularyService = new VocabularyService()

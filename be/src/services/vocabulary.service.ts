import {Collection, ObjectId} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance, PersistenceService} from './persistence.service';

export class VocabularyService {
    private readonly persistence: PersistenceService = instance

    private get collection(): Collection {
        return this.persistence.db.collection('vocabularies');
    }

    public createVocab(newVocab: Vocabulary): Promise<Vocabulary> {

        return this.collection.insertOne({
            ...newVocab,
            _id: null,
            created: new Date(),
            lastModified: new Date()
        }).then((result) => result.insertedId)
          .then(id => this.getVocabular(id));
    }

    public getVocabular(id: string | ObjectId): Promise<Vocabulary> {
        return this.collection.findOne({_id: new ObjectId(id)}).then(x => <Vocabulary>x);
    }

    public readVocab(): void {
        // TODO
    }
}

export const vocabularyService: VocabularyService = new VocabularyService()

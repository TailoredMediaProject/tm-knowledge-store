import {Collection, Filter, ObjectId, UpdateFilter, UpdateResult} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance, PersistenceService} from './persistence.service';
import {Error} from '../generated';

export class VocabularyService {
    private readonly persistence: PersistenceService = instance
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
        }).then((result) => result.insertedId)
          .then(id => this.getVocabular(id));
    }

    public updateVocab(id: string, ifUnmodifiedSince: Date, newVocab: Vocabulary): Promise<Vocabulary> {
        // @ts-ignore
        return this.getVocabular(id)
          .then((dbo: Vocabulary) => {
              if(!!dbo) {
                  if(dbo.lastModified.getTime() <= ifUnmodifiedSince.getTime()) {
                      const filter: Filter<Vocabulary> = {
                          _id: new ObjectId(id),
                          lastModified: {
                              // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                              $lte: ifUnmodifiedSince
                          }
                      };

                      const update: UpdateFilter<Vocabulary> = {
                          $set: {
                              _id: new ObjectId(id),
                              label: newVocab.label,
                              description: newVocab.description,
                              lastModified: new Date()
                          }
                      };

                      // @ts-ignore
                      return this.collection.updateOne(filter, update, {upsert: false})
                        .then((result: UpdateResult) => {
                            if(result.modifiedCount === 1) {
                                return {
                                    ...update.$set,
                                    created: dbo.created
                                };
                            } else {
                                throw new Error('Target not found'); // 404
                            }
                        });
                  } else {
                      // throw new Error('Target has been modified since last retrieval, the modified target is returned'); // 412
                      return dbo;
                  }
              } else {
                  throw new Error('Target not found'); // 404
              }
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

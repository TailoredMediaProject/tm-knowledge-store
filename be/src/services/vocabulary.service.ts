import {Collection, Filter, FindOptions, ObjectId} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance, PersistenceService} from './persistence.service';
import ListQueryModel from '../models/query-list.model';
import {ListingResult} from '../models/listing-result.model';
import {KnowledgeError} from "../models/knowledge-error.model";

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
        })
            .then((result) => result.insertedId)
            .then(id => this.getVocabular(id));
    }

    public getVocabular(id: string | ObjectId): Promise<Vocabulary> {
        return this.collection.findOne({_id: new ObjectId(id)}).then(x => <Vocabulary>x);
    }

    // public deleteVocab(id: string | ObjectId, date: Date): Promise<boolean> {
    //
    //     try {
    //         if (isNaN(date.getDate())) {
    //             console.log("Date is not valid")
    //             return Promise.resolve(false)
    //         }
    //
    //         this.collection().findOne({_id: new ObjectId(id)}).then(result => {
    //             if (result) {
    //                 console.log(`Successfully found document: ${result}.`);
    //             } else {
    //                 console.log("No document matches the provided ID.");
    //                 return false
    //             }
    //         })
    //             .catch(err => console.error(`Failed to find document: ${err}`))
    //
    //         return this.collection().deleteOne({_id: new ObjectId(id), lastModified: date})
    //             .then(r => {
    //                 if (r.deletedCount == 1) {
    //                     console.log(`Successfully deleted Vocabulary.`)
    //                     return true
    //                 } else {
    //                     console.log(`Vocabulary with matching params not found.`)
    //                     return false
    //                 }
    //             })
    //     } catch (e) {
    //         console.log('=============ERROR=============')
    //         console.log(`Failed to delete Vocabulary: ${e}`)
    //         return Promise.resolve(false)
    //     }
    // }

    public async deleteVocab(id: string | ObjectId, date: Date): Promise<boolean> {

        if (isNaN(date.getDate())) {
            console.log("Date is not valid")
            throw new KnowledgeError(404, "Date", "Date is not valid")
        }

        if (!ObjectId.isValid(id)) {
            console.log("Provided id is not valid")
            throw new KnowledgeError(404, "ID", "ID is not valid")
        }

        this.collection.findOne({_id: new ObjectId(id)}).then(result => {
            if (result) {
                console.log(`Successfully found document: ${result}.`);
            } else {
                console.log("No document matches the provided ID.");
                throw new KnowledgeError(404, "Document", "No document matches the provided ID.")
            }
        })

        return this.collection.deleteOne({_id: new ObjectId(id), lastModified: date})
            .then(r => {
                if (r.deletedCount == 1) {
                    console.log(`Successfully deleted Vocabulary.`)
                    return true
                } else {
                    console.log(`Vocabulary with matching params not found.`)
                    throw new KnowledgeError(404, "Vocabulary", "Vocabulary with matching params not found. Failed to delete Vocabulary.")
                }
            })
    }


    // eslint-disable-rows-line @typescript-eslint/explicit-module-boundary-types
    public async listVocab(query: ListQueryModel, id?: string | ObjectId): Promise<ListingResult<Vocabulary>> {
        const {options, filter} = this.transformToMongoDBFilterOption(query, id);
        // @ts-ignore
        const dbos: Vocabulary[] = await this.collection.find(filter, options).toArray() as Vocabulary[];
        return {
            offset: query.offset,
            rows: dbos.length,
            totalItems: 0, // TODO
            items: dbos
        };
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '');
    }

    private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string | ObjectId):
        { options: FindOptions, filter: Filter<Vocabulary> } {
        const options: FindOptions = {};
        const filter: Filter<Vocabulary> = {};

        if (!!id) {
            // @ts-ignore
            filter._id = new ObjectId(id);
        }

        if (!!query) {
            if (!!query?.text) {
                filter.$or = [
                    {
                        label: {
                            $regex: this.escapeRegExp(query.text),
                            $options: 'gi'
                        }
                    },
                    {
                        description: {
                            $regex: this.escapeRegExp(query.text),
                            $options: 'gi'
                        }
                    }
                ];
            }

            if (!!query?.createdSince) {
                // @ts-ignore
                filter.created = {
                    // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                    $gte: new Date(query?.createdSince)
                    // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
                };
            }

            if (!!query?.modifiedSince) {
                // @ts-ignore
                filter.lastModified = {
                    // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                    $gte: new Date(query.modifiedSince)
                };
            }

            if (!!query?.sort) {
                // @ts-ignore
                options.sort = this.mapToMongoSort(query?.sort);
            }

            if (!!query?.offset) {
                options.skip = Number(query?.offset); // Without the cast, it won't work!
            }

            if (!!query?.rows) {
                options.limit = Number(query?.rows); // Without the cast, it won't work!
            }
        }

        return {
            options,
            filter
        };
    }

    private mapToMongoSort(sort: string): unknown {
        if (!!sort && sort.includes(' ')) {
            if (sort.toLowerCase().includes('created')) {
                return {
                    created: sort.toLowerCase().includes('asc') ? 1 : -1
                };
            } else {
                return {
                    lastModified: sort.toLowerCase().includes('asc') ? 1 : -1
                };
            }
        }
        return {};
    }
}

export const vocabularyService: VocabularyService = new VocabularyService();

import {Collection, Filter, FindOptions, ModifyResult, ObjectId, UpdateFilter} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {instance as persistenceService} from './persistence.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import ListQueryModel from '../models/list-query.model';
import {ListingResult} from '../models/listing-result.model';

export class VocabularyService {
    private static collection(): Collection {
        return persistenceService.db().collection('vocabularies');
    }

    public createVocab(newVocab: Vocabulary): Promise<Vocabulary> {
        return VocabularyService.collection()
            .insertOne({
                ...newVocab,
                _id: null,
                created: new Date(),
                lastModified: new Date()
            })
            .then((result) => result.insertedId)
            .then((id) => this.getVocabular(id));
    }

    public getVocabular(id: string | ObjectId): Promise<Vocabulary> {
        return VocabularyService.collection()
            .findOne({_id: new ObjectId(id)})
            .then((x) => <Vocabulary>x);
    }

    public async deleteVocab(id: string | ObjectId, date: Date): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            throw new KnowledgeError(400, 'ID', 'ID is not valid');
        }

        const result = await VocabularyService.collection().findOne({_id: new ObjectId(id)});

        if (!result) {
            throw new KnowledgeError(404, 'Document', 'No document matches the provided ID.');
        }

        return VocabularyService.collection()
            .deleteOne({_id: new ObjectId(id), lastModified: date})
            .then((r) => {
                if (r.deletedCount == 1) {
                    return true;
                } else {
                    throw new KnowledgeError(412, 'Header', 'Header does not match!');
                }
            });
    }

    public updateVocab(id: string, ifUnmodifiedSince: Date, newVocab: Vocabulary): Promise<Vocabulary> {
        const filter: Filter<Vocabulary> = {
            _id: new ObjectId(id),
            lastModified: {
                // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                $eq: ifUnmodifiedSince
            }
        };

        const update: UpdateFilter<Vocabulary> = {
            $set: {
                _id: new ObjectId(id),
                label: newVocab.label,
                description: newVocab.description
            },
            $currentDate: {
                lastModified: true
            }
        };

        return VocabularyService.collection()
                // @ts-ignore
                .findOneAndUpdate(filter, update, {new: true})
                // @ts-ignore
                .then((result: ModifyResult<Vocabulary>) => {
                    console.log(result);
                    // @ts-ignore
                    if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
                        return this.updateVocabNotFoundError(filter);
                    } else {
                        return result.value;
                    }
                });
    }

    private updateVocabNotFoundError(filter: Filter<Vocabulary>): Promise<Vocabulary> {
        delete filter.lastModified;
        return VocabularyService.collection()
            // @ts-ignore
            .findOne(filter)
            // @ts-ignore
            .then((v: Vocabulary) => {
                if (v._id.toHexString() === filter._id.toHexString()) {
                    throw new KnowledgeError(
                        412,
                        'Precondition Failed',
                        'Target has been modified since last retrieval, the modified target is returned',
                        v
                    );
                } else {
                    throw new KnowledgeError(404, 'Not found', "Target vocabulary with id '$ {id}' not found");
                }
            });
    }

    // eslint-disable-rows-line @typescript-eslint/explicit-module-boundary-types
    public async listVocab(query: ListQueryModel, id?: string | ObjectId): Promise<ListingResult<Vocabulary>> {
        const {options, filter} = this.transformToMongoDBFilterOption(query, id);
        // @ts-ignore
        const dbos: Vocabulary[] = (await VocabularyService.collection().find(filter, options).toArray()) as Vocabulary[];
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

    private transformToMongoDBFilterOption(
        query?: ListQueryModel,
        id?: string | ObjectId
    ): {options: FindOptions; filter: Filter<Vocabulary>} {
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

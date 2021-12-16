import {instance} from './persistence.service';
import {Collection, Filter, FindOptions, ObjectId} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity} from '../models/dbo.models';
import ListQueryModel from '../models/query-list.model';
import {ListingResult} from '../models/listing-result.model';

export class EntityService {
    private readonly persistenceService = instance;
    private readonly entityCollection: string = 'entities';

    private get collection(): Collection {
        return this.persistenceService.db.collection(this.entityCollection);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createEntity(vocabID: string, entity: Entity): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEntities(vocabID: string | ObjectId, query: ListQueryModel, entityID?: string | ObjectId): Promise<ListingResult<Entity>> {
        const {options, filter} = this.transformToMongoDBFilterOption(vocabID, query, entityID);
        // @ts-ignore
        const entities: Entity[] = await this.collection.find(filter, options).toArray() as Entity[];
        return {
            offset: query.offset,
            rows: entities.length,
            totalItems: 0, //TODO
            items: entities
        }
    }

    getEntity(vocabID: string | ObjectId, entityID: string | ObjectId): Promise<Entity> {
        return this.collection.findOne({_id: new ObjectId(entityID), vocabulary: new ObjectId(vocabID)}).then(x => <Entity>x);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateEntity(vocabID: string, entityID: string, lastModified: string, entity: Entity): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteEntity(vocabID: string, entityID: string, lastModified: string): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '');
    }

    private transformToMongoDBFilterOption(vocabID: string | ObjectId, query?: ListQueryModel, entityID?: string | ObjectId):
        { options: FindOptions, filter: Filter<Entity> } {
        const options: FindOptions = {};
        const filter: Filter<Entity> = {};
        filter.vocabulary = new ObjectId(vocabID);

        if (entityID) {
            filter._id = new ObjectId(entityID)
        }

        if (query) {
            if (query.text) {
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

            if (query.type) {
                filter.type = {
                    $regex: this.escapeRegExp(query.type),
                    $options: 'gi'
                }
            }

            if (query.createdSince) {
                // @ts-ignore
                filter.created = {
                    // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                    $gte: new Date(query.createdSince)
                    // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
                };
            }

            if (query.modifiedSince) {
                filter.lastModified = {
                    $gte: new Date(query.modifiedSince)
                };
            }

            if (query.sort) {
                // @ts-ignore
                options.sort = this.mapToMongoSort(query.sort);
            }

            if (query.offset) {
                options.skip = Number(query.offset); // Without the cast, it won't work!
            }

            if (query.rows) {
                options.limit = Number(query.rows); // Without the cast, it won't work!
            }
        }

        return {
            options,
            filter
        };
    }

    private mapToMongoSort(sort: string): unknown {
        if (sort && sort.includes(' ')) {
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

export const entityServiceInstance =  new EntityService();

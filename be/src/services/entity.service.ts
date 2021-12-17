import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, ObjectId, UpdateFilter, UpdateResult} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity} from '../models/dbo.models';
import {vocabularyService} from './vocabulary.service';

export class EntityService {
    private static collection(): Collection {
        return persistenceService.db().collection('entities');
    }

    public async createEntity(vocabID: string, entity: Entity): Promise<Entity> {

        await vocabularyService.getVocabular(vocabID).then(r => console.log(r))

        // @ts-ignore
        return EntityService.collection()
            .insertOne({
                ...entity,
                _id: null,
                vocabulary: new ObjectId(vocabID),
                created: new Date(),
                lastModified: new Date()
            })
            .then((result) => result.insertedId)
            .then((id) => this.getEntity(vocabID, id))
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEntities(vocabID: string, filter: unknown): Promise<unknown> {
        return Promise.resolve(null);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async getEntity(vocabID: string | ObjectId, entityID: string | ObjectId): Promise<Entity> {

        const entity = <Entity>await EntityService.collection().findOne({_id: new ObjectId(entityID)})

        if (!entity) {
            throw new KnowledgeError(404, 'Entity', 'Entity not found!')
        }

        return EntityService.collection()
            .findOne({_id: new ObjectId(entityID)})
            .then((x) => <Entity>x);
    }

    updateEntity(vocabID: string, entityID: string, ifUnmodifiedSince: Date, entity: Entity): Promise<Entity> {
        // get Entity throws errors if vocab or entity cannot be found
        return this.getEntity(vocabID, entityID).then((dbo: Entity) => {
            if (dbo.lastModified.getTime() > ifUnmodifiedSince.getTime()) {
                throw new KnowledgeError(
                    412,
                    'Precondition Failed',
                    'Target has been modified since last retrieval, the modified target is returned',
                    dbo
                );
            }

            const filter: Filter<Entity> = {
                _id: dbo._id,
                lastModified: {
                    // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
                    $lte: ifUnmodifiedSince
                }
            };

            const updateValue = {
                _id: entity._id,
                label: entity.label,
                description: entity.description,
                externalResources: entity.externalResources,
                sameAs: entity.sameAs,
                lastModified: new Date()
            };

            const update: UpdateFilter<Entity> = {$set: updateValue};

            // @ts-ignore
            return EntityService.collection().updateOne(filter, update, {upsert: false}).then((result: UpdateResult) => {
                if (result.modifiedCount === 1) {
                    return {
                        ...updateValue,
                        type: dbo.type,
                        created: dbo.created,
                        data: dbo.data,
                        vocabulary: dbo.vocabulary
                    };
                } else {
                    throw new KnowledgeError(404, 'Not found', `Target entity with id '${entityID}' not found`);
                }
            });
        });
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteEntity(vocabID: string, entityID: string, lastModified: string): Promise<unknown> {
        return Promise.resolve(null);
    }
}

export const entityServiceInstance: EntityService = new EntityService();

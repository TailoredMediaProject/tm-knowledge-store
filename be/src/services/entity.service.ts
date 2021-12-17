import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, UpdateFilter, UpdateResult, ObjectId} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity} from '../models/dbo.models';
import {vocabularyService} from './vocabulary.service';

export class EntityService {
    private static collection(): Collection {
        return persistenceService.db().collection('entities');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createEntity(vocabID: string, entity: Entity): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getEntities(vocabID: string, filter: unknown): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getEntity(vocabID: string, entityID: string): Promise<Entity> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented', {id: 'dummyEntityErrorPayload'});
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
            return EntityService.collection.updateOne(filter, update, {upsert: false}).then((result: UpdateResult) => {
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
    public async deleteEntity(vocabID: string, entityID: string, lastModified: Date): Promise<boolean> {

        if (!ObjectId.isValid(vocabID)) {
            throw new KnowledgeError(400, 'VocabID', 'VocabID is not valid')
        }

        if (!ObjectId.isValid(vocabID)) {
            throw new KnowledgeError(400, 'EntityID', 'EntityID is not valid')
        }

        if (!await vocabularyService.getVocabular(vocabID)) {
            throw new KnowledgeError(404, 'Vocabulary', 'No vocabulary matches the provided ID.')
        }

        if (!await this.getEntity(vocabID, entityID)) {
            throw new KnowledgeError(404, 'Entity', 'No entity matches the provided ID.')
        }

        return EntityService.collection().deleteOne({_id: new ObjectId(entityID), lastModified: lastModified})
            .then(r => {
                if (r.deletedCount == 1) {
                    return true
                } else {
                    throw new KnowledgeError(412, 'Header', 'Header does not match!')
                }
            })
    }
}

export const entityServiceInstance: EntityService = new EntityService();

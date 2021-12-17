import {instance} from './persistence.service';
import {Entity} from '../generated';
import {Collection, ObjectId} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {vocabularyService} from './vocabulary.service';

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
    getEntities(vocabID: string, filter: unknown): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getEntity(vocabID: string, entityID: string): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented',
            {id: 'dummyEntityErrorPayload'}
        );
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateEntity(vocabID: string, entityID: string, lastModified: string, entity: Entity): Promise<unknown> {
        throw new KnowledgeError(501, 'Not Implemented', 'Operation not implemented');
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

        return this.collection.deleteOne({_id: new ObjectId(entityID), lastModified: lastModified})
            .then(r => {
                if (r.deletedCount == 1) {
                    return true
                } else {
                    throw new KnowledgeError(412, 'Header', 'Header does not match!')
                }
            })
    }
}

export const entityServiceInstance = new EntityService();

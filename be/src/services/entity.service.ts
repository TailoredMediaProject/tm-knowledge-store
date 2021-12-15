import {instance} from './persistence.service';
import {Entity} from '../generated';
import {Collection} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';

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
          {id:'dummyEntityErrorPayload'}
        );
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
}

export const entityServiceInstance =  new EntityService();

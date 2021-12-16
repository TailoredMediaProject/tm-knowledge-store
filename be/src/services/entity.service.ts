import {instance} from "./persistence.service";
import {Collection} from "mongodb";
import {Entity} from "../models/dbo.models";

export default class EntityService {
    private readonly persistenceService = instance;
    private readonly entityCollection: string = "entities";

    private get collection(): Collection {
        return this.persistenceService.db.collection(this.entityCollection);
    }

    async createEntity(vocabID: string, entity: Entity): Promise<Entity> {
        // @ts-ignore
        return this.collection.insertOne(entity)
            .then(entityID => this.getEntity(vocabID, entityID.insertedId.toString()));
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEntities(vocabID: string, filter: unknown): Promise<unknown> {
        return Promise.resolve(null);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEntity(vocabID: string, entityID: string): Promise<unknown> {
        return Promise.resolve(null);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateEntity(vocabID: string, entityID: string, lastModified: string, entity: Entity): Promise<unknown> {
        return Promise.resolve(null);
    }

    // TODO remove rule when implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteEntity(vocabID: string, entityID: string, lastModified: string): Promise<unknown> {
        return Promise.resolve(null);
    }
}

export const entityServiceInstance =  new EntityService();
/* es-lint-disable file */
import {instance} from "./persistence.service";
import {Collection} from "mongodb";
import {Entity} from "../models/dbo.models";

class EntityService {
    private readonly persistenceService = instance;
    private readonly entityCollection: string = "entities";

    // @ts-ignore
    private get collection(): Collection {
        return this.persistenceService.db.collection(this.entityCollection);
    }

    async createEntity(vocabID: string, entity: Entity): Promise<Entity> {
        return this.collection.insertOne(entity)
            .then(entityID => this.getEntity(vocabID, entityID.insertedId.toString()));
    }

    async getEntities(vocabID: string, filter: unknown): Promise<any> {
        return Promise.resolve(null);
    }

    async getEntity(vocabID: string, entityID: string): Promise<any> {
        return Promise.resolve(null);
    }

    async updateEntity(vocabID: string, entityID: string, lastModified: string, entity: Entity): Promise<any> {
        return Promise.resolve(null);
    }

    async deleteEntity(vocabID: string, entityID: string, lastModified: string): Promise<any> {
        return Promise.resolve(null);
    }
}

export const entityService: EntityService = new EntityService();
import {instance} from "./persistence-service";
import {Entity} from "../generated";
import {Collection} from "mongodb";

export default class EntityService {
    private readonly persistenceService = instance;
    private readonly entityCollection: string = "entities";

    private get collection(): Collection {
        return this.persistenceService.db.collection(this.entityCollection);
    }

    async createEntity(vocabID: string, entity: Entity): Promise<any> {
        return Promise.resolve(null);
    }

    async getEntities(vocabID: string, filter: any): Promise<any> {
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
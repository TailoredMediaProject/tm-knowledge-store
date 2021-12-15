/* es-lint-disable file */
import {instance} from "./persistence.service";
import {Entity} from "../generated";
import {Collection} from "mongodb";

class EntityService {
    private readonly persistenceService = instance;
    private readonly entityCollection: string = "entities";

    private get collection(): Collection {
        return this.persistenceService.db.collection(this.entityCollection);
    }

    private createNewDBO(vocabID: string, entity: Entity): Entity {
        return {
            id: null,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            vocabulary: vocabID,
            label: entity.label,
            description: entity.description,
            externalResources: entity.externalResources,
            type: entity.type,
            canonicalLink: entity.canonicalLink,
            sameAs: entity.sameAs,
            data: entity.data
        };
    }

    async createEntity(vocabID: string, entity: Entity): Promise<Entity> {
        return this.collection.insertOne(this.createNewDBO(vocabID, entity))
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
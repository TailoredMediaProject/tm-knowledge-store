import {instance as persistenceService} from './persistence.service';
import {Collection, Filter, InsertOneResult, ModifyResult, ObjectId, UpdateFilter} from 'mongodb';
import {KnowledgeError} from '../models/knowledge-error.model';
import {Entity, Vocabulary} from '../models/dbo.models';
import {vocabularyService} from './vocabulary.service';

export class EntityService {
  private static collection(): Collection {
    return persistenceService.db().collection('entities');
  }

  public createEntity(entity: Entity): Promise<Entity> {
    return vocabularyService.getVocabular(entity.vocabulary).then(() =>
      EntityService.collection()
        .insertOne({
          ...entity,
          _id: undefined,
          created: new Date(),
          lastModified: new Date()
        })
        .then((result: InsertOneResult) => this.getEntity(entity.vocabulary, result.insertedId)));
  }

  public getEntity(vocabID: string | ObjectId, entityID: string | ObjectId): Promise<Entity> {
    return vocabularyService.getVocabular(vocabID)
      .then(() => EntityService.collection()
        .findOne({
          _id: new ObjectId(entityID),
          vocabulary: new ObjectId(vocabID)
        })
        .then(result => {
          if (!!result?._id) {
            return result as Entity;
          }
          throw new KnowledgeError(404,
            'Not found',
            `Target entity with id '${entityID}' in vocabulary '${vocabID}' not found`);
        }));
  }

  public getEntities(vocabID: string | ObjectId): Promise<Entity[]> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const vocabNotFound = () => {
      throw new KnowledgeError(404,
        'Not found',
        `Target vocabulary '${vocabID}' not found`);
    };

    return vocabularyService.getVocabular(vocabID)
      .then((vocab: Vocabulary) => {
        if (!!vocab?._id) {
          return EntityService.collection()
            .find({ vocabulary: new ObjectId(vocabID) })
            .toArray()
            .then(e => e as Entity[]);
        }
        vocabNotFound();
      })
      .catch(vocabNotFound);
  }

  updateEntity(vocabID: string, entityID: string, ifUnmodifiedSince: Date, entity: Entity): Promise<Entity> {
    // get Entity throws errors if vocab or entity cannot be found
    return this.getEntity(vocabID, entityID).then((dbo: Entity) => {
      const filter: Filter<Entity> = {
        _id: dbo._id,
        lastModified: {
          // eslint-disable-rows-line @typescript-eslint/no-unsafe-argument
          $eq: ifUnmodifiedSince
        }
      };

      const update: UpdateFilter<Entity> = {
        $set: {
          label: entity.label,
          description: entity.description,
          externalResources: entity.externalResources,
          sameAs: entity.sameAs
        },
        $currentDate: {
          lastModified: true
        }
      };

      // @ts-ignore
      return EntityService.collection()
        // @ts-ignore
        .findOneAndUpdate(filter, update, { returnDocument: 'after' })
        // @ts-ignore
        .then((result: ModifyResult<Entity>) => {
          if (result?.lastErrorObject?.updatedExisting === false || !result.value) {
            throw new KnowledgeError(
              412,
              'Precondition Failed',
              'Target has been modified since last retrieval, the modified target is returned',
              dbo
            );
          } else {
            return result.value;
          }
        });
    });
  }

  public async deleteEntity(vocabID: string, entityID: string, lastModified: Date): Promise<boolean> {

    if (!await vocabularyService.getVocabular(vocabID)) {
      throw new KnowledgeError(404, 'Vocabulary', `No vocabulary matches the provided ID '${vocabID}'.`);
    }

    if (!await this.getEntity(vocabID, entityID)) {
      throw new KnowledgeError(404, 'Entity', `No entity matches the provided ID '${vocabID}'.`);
    }

    return EntityService.collection().deleteOne({ _id: new ObjectId(entityID), lastModified: lastModified })
      .then(r => {
        if (r.deletedCount === 1) {
          return true;
        } else {
          throw new KnowledgeError(412, 'Header', 'Header does not match!');
        }
      });
  }
}

export const entityServiceInstance: EntityService = new EntityService();

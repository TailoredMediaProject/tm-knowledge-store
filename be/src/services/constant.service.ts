'use strict';
/* eslint-disable no-undef */
import path = require('path');
import fs = require('fs');
import {AutomaticAnalysisModel} from '../models/automatic-analysis.model';
import {entityServiceInstance} from './entity.service';
import {vocabularyService} from './vocabulary.service';
import {UtilService} from './util.service';
import {Entity, Vocabulary} from '../models/dbo.models';
import {instance as persistenceService} from './persistence.service';
import {DB_COLLECTION_ENTITIES, DB_COLLECTION_VOCABULARIES} from '../models/constants';
import {ObjectId} from 'mongodb';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvToJson = require('convert-csv-to-json');

/** Checks and manages the automatic analysis entities. <br/><br/>
 * See if automatic analysis (AA) vocab exists on DB, if so: do nothing, else: check if backup.json file of AA voacab exists. If so:
 * upload it to DB, else: read assets/CSV, insert it into DB, create backup.json.*/
class ConstantService {
  private readonly AUTOMATIC_ANALYSIS_FILE = '../assets/Johanneum_Shot-Classes_mapped_v2.csv';
  private readonly AUTOMATIC_ANALYSIS_VOCABULARY = 'automatic-analysis';
  private readonly AUTOMATIC_ANALYSIS_BACKUP = '../assets/Johanneum_Shot-Classes_backup.json';
  private readonly AUTOMATIC_ANALYSIS_ID_LIST = '../assets/Johanneum_Shot-Classes_Id_List.json';
  private readonly LOG_TAG = 'Automatic Analysis:';

  public readonly init = (): void => {
    this.initVocab()
      .then((vocab: Vocabulary): void => {
        if (!!vocab) {
          this.initEntities(vocab);
        }
      })
      .catch(console.error);
  };

  private readonly initVocab = (): Promise<Vocabulary> =>
    vocabularyService.getVocabularyWithSlug(this.AUTOMATIC_ANALYSIS_VOCABULARY)
      .then((vocab: Vocabulary): Promise<Vocabulary> => {
        if (!!vocab && vocab?.entityCount > 0) {
          console.log(`${this.LOG_TAG} Vocab ${vocab._id.toHexString()} exits with ${vocab.entityCount} entities`);
          return Promise.resolve(undefined);
        } else {
          return this.insertVocabWithId();
        }
      });

  private readonly initEntities = (vocab: Vocabulary): void => {
    if (this.backupFileNonExistent()) {
      this.createEntries(vocab);
    } else {
      this.loadEntries(vocab);
    }
  };

  // @ts-ignore
  private readonly readBackupFile = (): Entity[] => JSON.parse(fs.readFileSync(path.join(__dirname, this.AUTOMATIC_ANALYSIS_BACKUP)));

  private readonly loadEntries = (vocab: Vocabulary): void => {
    const entities: Entity[] = this.readBackupFile();
    const collection = persistenceService.db().collection(DB_COLLECTION_ENTITIES);

    Promise.all(
      entities.map((e: Entity) => {
        e.vocabulary = vocab._id;
        // @ts-ignore
        e.created = new Date(e.created);
        // @ts-ignore
        e.lastModified = new Date(e.lastModified);

        return collection.insertOne(e)
          .catch(console.error);
      })
    ).then(() => console.log(`${this.LOG_TAG} Backup exists, AA entities were restored`))
      .catch(console.error);
  };

  private readonly createEntries = (vocab: Vocabulary): void => {
    const entries: AutomaticAnalysisModel[] = csvToJson
      .fieldDelimiter(';')
      .getJsonFromCsv(path.join(__dirname, this.AUTOMATIC_ANALYSIS_FILE))
      .map((rawElement: unknown): AutomaticAnalysisModel => ({
        // @ts-ignore
        eId: rawElement['ExternalID(Johenneum)'],
        // @ts-ignore
        label: rawElement['Label(DE)'],
        // @ts-ignore
        entityType: rawElement.EntityType,
        // @ts-ignore
        tagTree: rawElement['Tag-TreeType'],
        // @ts-ignore
        canonicalLink: rawElement['Tag-TreeType']
      }));

    Promise.all(entries.map((aam: AutomaticAnalysisModel) =>
      entityServiceInstance.createEntity(UtilService.aam2EntityDbo(aam, vocab._id)))
    ).then((savedEntities: Entity[]): void => {
      // Save backup
      fs.writeFileSync(path.join(__dirname, this.AUTOMATIC_ANALYSIS_BACKUP), JSON.stringify(savedEntities, null, 2));
      // Save id / link list
      fs.writeFileSync(path.join(__dirname, this.AUTOMATIC_ANALYSIS_ID_LIST), JSON.stringify(
        savedEntities.map((e: Entity) => ({
          label: e.externalResources[0],
          canonicalLink: UtilService.createCanonicalLink(e?._id?.toHexString())
        })), null, 2));
      console.log(`${this.LOG_TAG} Generated backup and ID list successfully`);
    })
      .catch(console.error);
  };

  private readonly backupFileNonExistent = (): boolean => {
    try {
      return !fs.existsSync(path.join(__dirname, this.AUTOMATIC_ANALYSIS_BACKUP));
    } catch (e) {
      return false;
    }
  };

  private readonly insertVocabWithId = (): Promise<Vocabulary> => {
    console.log(`${this.LOG_TAG} New AA vocab will be created`);

    const vocab: Vocabulary = {
      created: new Date(),
      lastModified: new Date(),
      slug: this.AUTOMATIC_ANALYSIS_VOCABULARY,
      label: this.AUTOMATIC_ANALYSIS_VOCABULARY,
      description: this.AUTOMATIC_ANALYSIS_VOCABULARY
    } as Vocabulary;

    if (!this.backupFileNonExistent()) {
      let entities: Entity[] = this.readBackupFile();
      vocab._id = entities.find((e: Entity): boolean => ObjectId.isValid(e?.vocabulary))?.vocabulary;
      entities = undefined;

      if (!!vocab._id) {
        vocab._id = new ObjectId(vocab._id);
      }
    }

    const collection = persistenceService.db().collection(DB_COLLECTION_VOCABULARIES);

    return collection.insertOne(vocab)
      .then((result) => {
        // @ts-ignore
        if (result.insertedId.toHexString() === vocab._id.toHexString()) {
          return vocab;
        } else {
          console.error(`${this.LOG_TAG} Could not create AA vocab ${vocab._id.toHexString()}`);
        }
      });
  };
}

export const instance: ConstantService = new ConstantService();

'use strict';
/* eslint-disable no-undef */
import path = require('path');
import fs = require('fs');
import {AutomaticAnalysisLogos, AutomaticAnalysisModel, AutomaticAnalysisPerson} from '../models/automatic-analysis.model';
import {entityServiceInstance} from './entity.service';
import {vocabularyService} from './vocabulary.service';
import {UtilService} from './util.service';
import {Entity, Vocabulary} from '../models/dbo.models';
import {instance as persistenceService} from './persistence.service';
import {
  AUTOMATIC_ANALYSIS_LOGOS_BACKUP,
  AUTOMATIC_ANALYSIS_LOGOS_FILE,
  AUTOMATIC_ANALYSIS_LOGOS_ID_LIST,
  AUTOMATIC_ANALYSIS_PERSONS_BACKUP,
  AUTOMATIC_ANALYSIS_PERSONS_FILE,
  AUTOMATIC_ANALYSIS_PERSONS_ID_LIST,
  AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP,
  AUTOMATIC_ANALYSIS_SHOT_CLASSES_FILE,
  AUTOMATIC_ANALYSIS_SHOT_CLASSES_ID_LIST,
  AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY,
  DB_COLLECTION_ENTITIES,
  DB_COLLECTION_VOCABULARIES
} from '../models/constants';
import {ObjectId} from 'mongodb';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvToJson = require('convert-csv-to-json');

/** Checks and manages the automatic analysis entities. <br/><br/>
 * See if automatic analysis (AA) vocab exists on DB, if so: do nothing, else: check if backup.json file of AA voacab exists. If so:
 * upload it to DB, else: read assets/CSV, insert it into DB, create backup.json.*/
class ConstantService {
  private readonly LOG_TAG = 'Automatic Analysis:';

  public readonly init = (): void => {
    this.initVocab()
      .then((vocab: Vocabulary): void => {
        if (!!vocab) {
          this.initEntities(vocab, AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP);
          this.initEntities(vocab, AUTOMATIC_ANALYSIS_PERSONS_BACKUP);
          this.initEntities(vocab, AUTOMATIC_ANALYSIS_LOGOS_BACKUP);
        }
      })
      .catch(console.error);
  };

  private readonly initVocab = (): Promise<Vocabulary> =>
    vocabularyService.getVocabularyWithSlug(AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY)
      .then((vocab: Vocabulary): Promise<Vocabulary> => {
        if (!!vocab && vocab?.entityCount > 0) {
          console.log(`${this.LOG_TAG} Vocab ${vocab._id.toHexString()} exits with ${vocab.entityCount} entities`);
          return Promise.resolve(undefined);
        } else {
          return this.insertVocabWithId();
        }
      });

  private readonly initEntities = (vocab: Vocabulary, pathFilename: string): void => {
    if (this.backupFileNonExistent(pathFilename)) {
      if(pathFilename === AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP) {
        this.createShotClasses(vocab);
      } else if(pathFilename === AUTOMATIC_ANALYSIS_PERSONS_BACKUP) {
        this.createPersons(vocab);
      } else if(pathFilename === AUTOMATIC_ANALYSIS_LOGOS_BACKUP) {
        this.createLogos(vocab);
      }
      else {
        console.error(`${this.LOG_TAG} Unknown backup path and file ${pathFilename}`);
      }
    } else {
      this.loadBackup(vocab, pathFilename);
    }
  };

  private readonly readBackupFile = (pathFilename: string): Entity[] =>
    // @ts-ignore
    JSON.parse(fs.readFileSync(path.join(__dirname, pathFilename)));

  private readonly loadBackup = (vocab: Vocabulary, pathFilename: string): void => {
    const entities: Entity[] = this.readBackupFile(pathFilename);
    const entityCollection = persistenceService.db().collection(DB_COLLECTION_ENTITIES);

    entityCollection.insertMany(entities.map((e: Entity) => {
      e.vocabulary = vocab._id;
      // @ts-ignore
      e.created = new Date(e.created);
      // @ts-ignore
      e.lastModified = new Date(e.lastModified);

      return e;
    })).then(() => console.log(`${this.LOG_TAG} Backup exists, AA ${pathFilename} entities were restored`))
      .catch(console.error);
  };

  private readonly createShotClasses = (vocab: Vocabulary): void => {
    const entries: AutomaticAnalysisModel[] = csvToJson
      .fieldDelimiter(';')
      .getJsonFromCsv(path.join(__dirname, AUTOMATIC_ANALYSIS_SHOT_CLASSES_FILE))
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
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP), JSON.stringify(savedEntities, null, 2));
      // Save id / link list
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_SHOT_CLASSES_ID_LIST), JSON.stringify(
        savedEntities.map((e: Entity) => ({
          label: e.externalResources[0],
          canonicalLink: UtilService.createCanonicalLink(e?._id?.toHexString())
        })), null, 2));
      console.log(`${this.LOG_TAG} Generated backup and ID list of shot classes successfully`);
    })
      .catch(console.error);
  };

  private readonly createPersons = (vocab: Vocabulary): void => {
    const entries: AutomaticAnalysisPerson[] = csvToJson
      .fieldDelimiter(';')
      .getJsonFromCsv(path.join(__dirname, AUTOMATIC_ANALYSIS_PERSONS_FILE))
      .map((rawElement: unknown): AutomaticAnalysisPerson => ({
        // @ts-ignore
        person: rawElement['Personen'],
        // @ts-ignore
        uuid: rawElement['UUID']
      }));

    Promise.all(entries.map((aam: AutomaticAnalysisPerson) =>
      entityServiceInstance.createEntity(UtilService.aamPerson2EntityDbo(aam, vocab._id)))
    ).then((savedEntities: Entity[]): void => {
      // Save backup
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_PERSONS_BACKUP), JSON.stringify(savedEntities, null, 2));
      // Save id / link list
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_PERSONS_ID_LIST), JSON.stringify(
        savedEntities.map((e: Entity) => ({
          label: e.externalResources[0].replaceAll('AA-ID: ', ''),
          canonicalLink: UtilService.createCanonicalLink(e?._id?.toHexString())
        })), null, 2));
      console.log(`${this.LOG_TAG} Generated backup and ID list of persons successfully`);
    })
      .catch(console.error);
  };

  private readonly createLogos = (vocab: Vocabulary): void => {
    const entries: AutomaticAnalysisLogos[] = csvToJson
      .fieldDelimiter(';')
      .getJsonFromCsv(path.join(__dirname, AUTOMATIC_ANALYSIS_LOGOS_FILE))
      .map((rawElement: unknown): AutomaticAnalysisLogos => ({
        // @ts-ignore
        label: rawElement['Logos'],
      }));

    Promise.all(entries.map((aam: AutomaticAnalysisLogos) =>
      entityServiceInstance.createEntity(UtilService.aamLogo2EntityDbo(aam, vocab._id)))
    ).then((savedEntities: Entity[]): void => {
      // Save backup
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_LOGOS_BACKUP), JSON.stringify(savedEntities, null, 2));
      // Save id / link list
      fs.writeFileSync(path.join(__dirname, AUTOMATIC_ANALYSIS_LOGOS_ID_LIST), JSON.stringify(
        savedEntities.map((e: Entity) => ({
          label: e.label,
          canonicalLink: UtilService.createCanonicalLink(e?._id?.toHexString())
        })), null, 2));
      console.log(`${this.LOG_TAG} Generated backup and ID list of logos successfully`);
    })
      .catch(console.error);
  };

  private readonly backupFileNonExistent = (pathFilename: string): boolean => {
    try {
      return !fs.existsSync(path.join(__dirname, pathFilename));
    } catch (e) {
      return false;
    }
  };

  private readonly insertVocabWithId = (): Promise<Vocabulary> => {
    console.log(`${this.LOG_TAG} New AA vocab will be created`);

    const vocab: Vocabulary = {
      created: new Date(),
      lastModified: new Date(),
      slug: AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY,
      label: AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY,
      description: AUTOMATIC_ANALYSIS_SHOT_CLASSES_VOCABULARY
    } as Vocabulary;

    if (!this.backupFileNonExistent(AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP)) {
      vocab._id = this.readBackupFile(AUTOMATIC_ANALYSIS_SHOT_CLASSES_BACKUP)
        .find((e: Entity): boolean => ObjectId.isValid(e?.vocabulary))?.vocabulary;

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

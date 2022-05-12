'use strict';
/* eslint-disable no-undef */
import path = require('path');
import fs = require('fs');
import {AutomaticAnalysisModel} from '../models/automatic-analysis.model';
import {entityServiceInstance} from './entity.service';
import {vocabularyService} from './vocabulary.service';
import {UtilService} from './util.service';
import {Entity, Vocabulary} from '../models/dbo.models';
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
      .then((vocab: Vocabulary): void => this.initEntities(vocab))
      .catch(console.error);
  };

  private readonly initVocab = (): Promise<Vocabulary> =>
    vocabularyService.getVocabularyWithSlug(this.AUTOMATIC_ANALYSIS_VOCABULARY)
      .then((vocab: Vocabulary): Promise<Vocabulary> => {
        if (!!vocab && vocab?.entityCount > 0) {
          console.log(`${this.LOG_TAG} Vocab ${vocab._id.toHexString()} exits with ${vocab.entityCount} entities`);
          return Promise.resolve(vocab);
        } else {
          console.log(`${this.LOG_TAG} New AA vocab will be created`);
          return vocabularyService.createVocab({
            slug: this.AUTOMATIC_ANALYSIS_VOCABULARY,
            label: this.AUTOMATIC_ANALYSIS_VOCABULARY,
            description: this.AUTOMATIC_ANALYSIS_VOCABULARY
          } as Vocabulary);
        }
      });

  private readonly initEntities = (vocab: Vocabulary): void => {
    if (this.backupFileNonExistent()) {
      this.createEntries(vocab);
    } else {
      this.loadEntries(vocab);
    }
  };
  private readonly loadEntries = (vocab: Vocabulary): void => {
    // @ts-ignore
    const entities: Entity[] = JSON.parse(fs.readFileSync(path.join(__dirname, this.AUTOMATIC_ANALYSIS_BACKUP)));
    let created = false;

    Promise.all(
      entities.map((e: Entity) =>
        entityServiceInstance.getEntityWithoutVocab(e._id)
          .then(() => undefined) // Entity exists on DB, do nothing
          .catch((err) => {
            console.log(err);
            return e;
          }) // Entity not found, so create it
      )
    ).then((nonExistingEntities: Entity []) => {
      nonExistingEntities.filter(e => !!e)
        .forEach((nE: Entity): void => {
          nE.vocabulary = vocab._id;
          entityServiceInstance.createEntity(nE)
            .then((): void => {created = true;})
            .catch(console.error);
        });
    })
      .catch(console.error);

    if(created) {
      console.log(`${this.LOG_TAG} Backup exists, AA entities were restored`);
    } else {
      console.log(`${this.LOG_TAG} Backup exists, no AA entities were changed nor restored`);
    }
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
      entityServiceInstance.createEntity(UtilService.aam2EntityDbo(aam, vocab._id)))).then((savedEntities: Entity[]): void => {
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
}

export const instance: ConstantService = new ConstantService();

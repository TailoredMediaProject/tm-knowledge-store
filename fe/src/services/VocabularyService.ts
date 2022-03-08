import {Configuration, Pageable, Vocabulary, VocabularyApi} from '@/openapi';
import {ISO8601toUTC} from '@/Utility/DateUtility';
import {extractVocabList, VocabList} from '@/Objects/VocabList';

export class VocabularyService {
  private readonly basePath: string;
  private readonly apiPath: string;
  private apiFn = new VocabularyApi();

  constructor(basePath: string) {
    this.basePath = basePath;
    this.apiPath = basePath + '/vocab';
    this.apiFn = new VocabularyApi(new Configuration({basePath: this.basePath}));
  }

  async getVocabs(text?: string, page = 0, rowCount = 10): Promise<VocabList | undefined> {
    return this.apiFn.listVocabularies(text, undefined, undefined, undefined, page, rowCount).then((resp) => {
      if (resp.status >= 400) {
        console.error(resp);
        return;
      }
      const data = resp.data as Pageable & [Vocabulary];
      return extractVocabList(data);
    });
  }

  getVocab(objectID: string): Promise<Vocabulary | undefined> {
    if (!objectID || objectID === '') {
      return Promise.reject('No vocabulary ID set!');
    }
    return this.apiFn.getVocabulary(objectID).then((resp) => {
      if (resp.status >= 400) {
        console.error(resp);
        return;
      }
      return resp.data;
    });
  }

  createVocab(label?: string, description?: string): Promise<Vocabulary | undefined> {
    return this.apiFn
      .createVocabulary({
        created: '',
        entityCount: 0,
        id: '',
        lastModified: '',
        label: label,
        description: description
      })
      .then((resp) => {
        if (resp.status >= 400) {
          console.error(resp);
          return;
        }
        return resp.data;
      });
  }

  updateVocab(vocab: Vocabulary): Promise<Vocabulary | undefined> {
    const objectID = vocab.id;
    const lastModified = ISO8601toUTC(vocab.lastModified);
    if (!objectID || objectID === '') {
      return Promise.reject('No vocabulary ID set');
    } else if (lastModified === null) {
      return Promise.reject('Invalid date!');
    }

    return this.apiFn.updateVocabulary(objectID, lastModified, vocab).then((resp) => {
      if (resp.status >= 400) {
        console.error(resp);
        return;
      }
      return resp.data;
    });
  }

  deleteVocab(vocab: Vocabulary): Promise<Vocabulary | undefined> {
    const objectID = vocab.id;
    const lastModified = ISO8601toUTC(vocab.lastModified);

    if (!objectID) {
      return Promise.reject('No vocabulary ID set');
    } else if (!lastModified) {
      return Promise.reject('Invalid date!');
    }

    return this.apiFn
      .deleteVocabulary(objectID, lastModified)
      .then((resp) => {
        if (resp.status >= 400) {
          console.error(resp);
          return undefined;
        }
        return resp.data;
      })
      .catch((error) => {
        console.error(error);
        return Promise.reject('Error deleting vocabulary!');
      });
  }
}

import {AxiosInstance, AxiosPromise, AxiosRequestConfig} from 'axios';
import {Configuration, Pageable, Vocabulary, VocabularyApiFp} from '../openapi';
import {ISO8601toUTC} from '@/Utility/DateUtility';
import {extractVocabList, VocabList} from '@/Objects/VocabList';

export class VocabularyService {
  private readonly basePath: string;
  private readonly apiPath: string;
  private readonly apiFn: {
    createVocabulary(
      vocabulary?: Vocabulary,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Vocabulary>
    >;
    deleteVocabulary(
      vocabularyId: string,
      ifUnmodifiedSince: string,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Vocabulary>
    >;
    getVocabulary(
      vocabularyId: string,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Vocabulary>
    >;
    listVocabularies(
      text?: string,
      createdSince?: string,
      modifiedSince?: string,
      sort?: "created asc" | "created desc" | "modified asc" | "modified desc",
      offset?: number,
      rows?: number,
      options?: AxiosRequestConfig
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string
        // eslint-disable-next-line @typescript-eslint/ban-types
      ) => AxiosPromise<Pageable & object>
    >;
    updateVocabulary(
      vocabularyId: string,
      ifUnmodifiedSince: string,
      vocabulary?: Vocabulary,
      options?: AxiosRequestConfig
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Vocabulary>
    >;
  };
  constructor(basePath: string) {
    this.basePath = basePath;
    this.apiPath = basePath + "/vocab";
    this.apiFn = VocabularyApiFp(
      new Configuration({ basePath: this.basePath })
    );
  }

  async getVocabs(
    text?: string,
    page = 0,
    rowCount = 10
  ): Promise<VocabList | undefined> {
    return this.apiFn
      .listVocabularies(text, undefined, undefined, undefined, page, rowCount)
      .then((req) =>
        req().then((resp) => {
          if (resp.status >= 400) {
            console.error(resp);
            return;
          }
          const data = resp.data as Pageable & [Vocabulary];
          console.log(data);
          return extractVocabList(data);
        })
      );
  }

  getVocab(objectID: string): Promise<Vocabulary | undefined> {
    if (!objectID || objectID === "") {
      return Promise.reject("No vocabulary ID set!");
    }
    return this.apiFn.getVocabulary(objectID).then((req) =>
      req().then((resp) => {
        if (resp.status >= 400) {
          console.error(resp);
          return;
        }
        console.log(resp.data);
        return resp.data;
      })
    );
  }

  createVocab(
    label?: string,
    description?: string
  ): Promise<Vocabulary | undefined> {
    return this.apiFn
      .createVocabulary({
        created: "",
        entityCount: 0,
        id: "",
        lastModified: "",
        label: label,
        description: description,
      })
      .then((req) =>
        req().then((resp) => {
          if (resp.status >= 400) {
            console.error(resp);
            return;
          }
          console.log(resp.data);
          return resp.data;
        })
      );
  }

  updateVocab(vocab: Vocabulary): Promise<Vocabulary | undefined> {
    const objectID = vocab.id;
    const lastModified = ISO8601toUTC(vocab.lastModified);
    if (!objectID || objectID === "") {
      return Promise.reject("No vocabulary ID set");
    } else if (lastModified === null) {
      return Promise.reject("Invalid date!");
    }

    return this.apiFn
      .updateVocabulary(objectID, lastModified, vocab)
      .then((req) =>
        req().then((resp) => {
          if (resp.status >= 400) {
            console.error(resp);
            return;
          }
          console.log(resp.data);
          return resp.data;
        })
      );
  }

  deleteVocab(vocab: Vocabulary): Promise<Vocabulary | undefined> {
    const objectID = vocab.id;
    const lastModified = ISO8601toUTC(vocab.lastModified);

    if (!objectID) {
      return Promise.reject("No vocabulary ID set");
    } else if (!lastModified) {
      return Promise.reject("Invalid date!");
    }

    return this.apiFn.deleteVocabulary(objectID, lastModified).then((req) =>
      req()
        .then((resp) => {
          if (resp.status >= 400) {
            console.error(resp);
            return undefined;
          }
          console.log(resp.data);
          return resp.data;
        })
        .catch((error) => {
          console.error(error);
          return Promise.reject("Error deleting vocabulary!");
        })
    );
  }
}

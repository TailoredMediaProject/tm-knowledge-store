import {ResolveService} from '../models/resolve-service.interface';
import {vocabularyService} from './vocabulary.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {UtilService} from './util.service';

export default class KnowledgeResolveService implements ResolveService {
  private readonly host = 'data.tmedia.redlink.io';
  private processUrl: URL;

  accept(url: URL): boolean {
    if (this.host === url.host) {
      this.processUrl = url;
      return true;
    }

    return false;
  }

  priority(): number {
    return 10;
  }

  resolve(): Promise<unknown> {
    if(!!this.processUrl) {
      return vocabularyService
        .getVocabular(this.processUrl.searchParams.get('id'))
        .then((v) => UtilService.vocabDbo2Dto(v))
        .catch((e: unknown) => {
          throw new KnowledgeError(501, 'Internal Server Error', e.toString());
        });
    }
    throw new KnowledgeError(501, 'Internal Server Error', 'URL to resolve is falsy');
  }
}

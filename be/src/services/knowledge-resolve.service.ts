import {ResolveService} from '../models/resolve-service.interface';
import {KnowledgeError} from '../models/knowledge-error.model';
import {UtilService} from './util.service';
import {entityServiceInstance} from './entity.service';

export default class KnowledgeResolveService implements ResolveService {
  private readonly host = 'data.tmedia.redlink.io';
  private readonly subPathVocabs = '/vocab';
  private readonly subPathEntities = '/entities';
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
      const vocabId = this.getSubPath(true);
      const entityId = this.getSubPath(false);

      return entityServiceInstance
        .getEntity(vocabId, entityId)
        .then((v) => UtilService.vocabDbo2Dto(v))
        .catch((e: unknown) => {
          throw new KnowledgeError(501, 'Internal Server Error', e.toString());
        });
    }
    throw new KnowledgeError(501, 'Internal Server Error', 'URL to resolve is falsy');
  }

  private getSubPath(vocab: boolean): string {
    const path = this.processUrl.pathname;
    const subPath = vocab ? this.subPathVocabs : this.subPathEntities;

    if(!this.processUrl.pathname.includes(subPath)) {
      throw new KnowledgeError(400,
        'Bad Request',
        `The URL to resolve '${this.processUrl}' does not contain the correct '${subPath}' path`
      );
    }

    const from = vocab ?
      path.indexOf(this.subPathVocabs) + this.subPathVocabs.length + 2 :
      path.indexOf(this.subPathEntities) + this.subPathEntities.length + 1;
    const to = vocab ? path.indexOf(this.subPathEntities) : path.length;

    return path.substring(from, to)
  }
}

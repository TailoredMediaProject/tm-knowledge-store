import {ResolveService} from '../models/resolve-service.interface';
import {KnowledgeError} from '../models/knowledge-error.model';
import {UtilService} from './util.service';
import {entityServiceInstance} from './entity.service';

export default class KnowledgeResolveService implements ResolveService {
  private readonly host = 'data.tmedia.redlink.io';
  private readonly subPathVocabs = '/vocab';
  private readonly subPathEntities = '/entities';

  private readonly baseUri: string[];

  constructor(baseUri: string[]) {
    this.baseUri = baseUri
  }

  accept(uri: URL): boolean {
    return !!this.baseUri.find(base => uri.toString().startsWith(base))
  }

  priority(): number {
    return 10;
  }

  resolve(uri: URL): Promise<unknown> {
    /* How-To:
       - strip baseUri from uri
       - all what is left is the entity-id
     */


    if(!!this.accept(uri)) {
      const vocabId = this.getSubPath(uri, true);
      const entityId = this.getSubPath(uri, false);

      return entityServiceInstance
        .getEntity(vocabId, entityId)
        .then((v) => UtilService.vocabDbo2Dto(v))
        .catch((e: unknown) => {
          // TODO: use Promise.reject()
          throw new KnowledgeError(501, 'Internal Server Error', e.toString());
        });
    }
    // TODO: use Promise.reject()
    throw new KnowledgeError(501, 'Internal Server Error', 'URL to resolve is falsy');
  }

  private getSubPath(uri: URL, vocab: boolean): string {
    const path = uri.pathname;
    const subPath = vocab ? this.subPathVocabs : this.subPathEntities;

    if(!uri.pathname.includes(subPath)) {

      throw new KnowledgeError(400,
        'Bad Request',
        `The URL to resolve '${uri}' does not contain the correct '${subPath}' path`
      );
    }

    const from = vocab ?
      path.indexOf(this.subPathVocabs) + this.subPathVocabs.length + 2 :
      path.indexOf(this.subPathEntities) + this.subPathEntities.length + 1;
    const to = vocab ? path.indexOf(this.subPathEntities) : path.length;

    return path.substring(from, to)
  }
}

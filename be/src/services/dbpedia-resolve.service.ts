import {ResolveService} from '../models/resolve-service.interface';
import {KnowledgeError} from '../models/knowledge-error.model';

export default class DbpediaResolveService implements ResolveService {
  private readonly host = 'dbpedia.org';
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
      // TODO TM-89, use DBpedia adapter here
      throw new KnowledgeError(501, 'Not Implemented', 'TODO TM-89');
    }
    throw new KnowledgeError(500, 'Internal Server Error', 'URL to resolve is falsy');
  }
}

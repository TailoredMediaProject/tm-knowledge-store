import {ResolveService} from '../models/resolve-service.interface';

export default class DbpediaResolveService implements ResolveService {
  private readonly host = 'dbpedia.org';

  accept(uri: URL): boolean {
    return this.host === uri.host;
  }

  priority(): number {
    return 10;
  }

  resolve(uri: URL): Promise<unknown> {
    if(!this.accept(uri)) {
      return Promise.reject(`Can't handle uri ${uri}`);
    }

    // TODO TM-89, use DBpedia adapter here
    return Promise.reject('Not (yet) implemented');
  }
}

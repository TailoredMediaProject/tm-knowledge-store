import KnowledgeResolveService from '../resolvers/knowledge-resolve.service';
import {BASE_URI_NDB, HOST} from '../models/constants';
import DbpediaResolveService from '../resolvers/dbpedia-resolve.service';
import NdbResolveService from '../resolvers/ndb-resolve.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {StatusCodes} from 'http-status-codes';
import {ResolveServiceInterface} from '../models/resolve-service.interface';
import {Entity} from '../models/dbo.models';
import {ObjectId} from 'mongodb';
import {UtilService} from './util.service';
import {entityServiceInstance} from './entity.service';

/**Main resolve service managing the dedicated ones. Allows also to schedule resolve jobs.*/
export class ResolveService {
  private readonly resolvers: ResolveServiceInterface[] = [
    new KnowledgeResolveService([`https://${HOST}/kb/`, `http://${HOST}/kb/`]),
    new DbpediaResolveService(['dbpedia.org'], 'de'),
    new NdbResolveService([`https://${BASE_URI_NDB}`, `http://${BASE_URI_NDB}`])
  ].sort((a: ResolveServiceInterface, b: ResolveServiceInterface) => a.priority() - b.priority());
  private readonly query: Map<ObjectId, URL> = new Map<ObjectId, URL>();
  private readonly interval: number = 1000;
  private idle = true;

  constructor() {
    // eslint-disable-next-line no-constant-condition
    if(false) {// TODO All resolvers are disabled until we have the external prod URI, see TODO in ndb-resolve.service.ts
      setInterval(this.processQuery, this.interval);
    }
  }

  private readonly processQuery = (): void => {
    if (this.idle) {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      for (const [id, uri] of this.query.entries()) {
        this.idle = false;
        this.resolve(uri)
          .then((resolved: Partial<Entity>) => {
            this.removeQueryEntry(id);
            resolved._id = id;
            void entityServiceInstance.updateResolvedEntity(resolved);
          })
          .catch((e) => {
            this.removeQueryEntry(id);
            console.error(e);
          });
        break;
      }
    }
  };

  private readonly removeQueryEntry = (id: ObjectId): void => {
    this.query.delete(id);
    this.idle = true;
  };

  public readonly resolve = (uri: URL): Promise<Partial<Entity>> => {
    const resolveService = this.resolvers.find((r: ResolveServiceInterface) => r.accept(uri));

    if (!!resolveService) {
      return resolveService.resolve(uri);
    } else {
      return Promise.reject(new KnowledgeError(StatusCodes.NOT_IMPLEMENTED, `Host of URI '${uri.toString()}' is unsupported`));
    }
  };

  public readonly schedule = (entity: Entity): Promise<Entity> => {
    entity.sameAs.forEach((sameAs: string) => {
      if (UtilService.checkUrl(sameAs)) {
        this.query.set(entity._id, new URL(sameAs));
      }
    });
    return Promise.resolve(entity);
  };
}

export const instance = new ResolveService();

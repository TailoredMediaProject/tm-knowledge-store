import {ResolveServiceInterface} from '../models/resolve-service.interface';
import {Entity} from '../models/dbo.models';
import {entityServiceInstance} from '../services/entity.service';
import {UtilService} from '../services/util.service';

export default class KnowledgeResolveService implements ResolveServiceInterface {
  private readonly baseUri: string[];

  constructor(baseUri: string[]) {
    this.baseUri = baseUri;
  }

  public readonly accept = (uri: URL): boolean => this.baseUri.some((base: string) => uri.toString().startsWith(base));

  public readonly priority = (): number => 10;

  resolve(uri: URL): Promise<Partial<Entity>> {
    if (this.accept(uri)) {
      const entityId = this.baseUri.reduce((previous: string, current: string) => previous.replace(current, ''), uri.toString());

      // @ts-ignore
      return entityServiceInstance.getEntityWithoutVocab(entityId).then((e: Entity) => UtilService.entityDbo2Dto(e));
    }
    return Promise.reject('URL to resolve is falsy');
  }
}

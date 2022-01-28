import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ResolveService} from '../models/resolve-service.interface';
import KnowledgeResolveService from '../resolvers/knowledge-resolve.service';
import DbpediaResolveService from '../resolvers/dbpedia-resolve.service';
import {HOST} from '../models/constants';
import {StatusCodes} from 'http-status-codes';

const router: Router = Router();

// @ts-ignore

const resolvers: ResolveService[] = [
  new KnowledgeResolveService([`https://${HOST}/kb/`, `http://${HOST}/kb/`]),
  new DbpediaResolveService(['dbpedia.org'], 'de')
].sort((a: ResolveService, b: ResolveService) => a.priority() - b.priority());

router.get('/resolve', (req: Request, res: Response, next: NextFunction) => {
  if (!UtilService.requireQueryParams(['uri'], req?.query)) {
    next(new KnowledgeError(StatusCodes.BAD_REQUEST, 'Query parameter `uri` is missing or has a falsy value'));
  } else {
    const resolveUri: URL = UtilService.checkUrl(`${req?.query?.uri}`);
    const resolveService = resolvers.find(r => r.accept(resolveUri));

    if (!!resolveService) {
      resolveService.resolve(resolveUri)
        .then((r: unknown) => res.json(r))
        .catch(next);
    } else {
      next(new KnowledgeError(StatusCodes.NOT_IMPLEMENTED, `Host of URI '${resolveUri}' is unsupported`));
    }
  }
});

export default router;

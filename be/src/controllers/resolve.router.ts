import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {AnyResolveService} from '../models/resolve-service.interface';
import KnowledgeResolveService from '../services/knowledge-resolve.service';
import DbpediaResolveService from '../services/dbpedia-resolve.service';

const router: Router = Router();

router.get('/resolve', (req: Request, res: Response, next: NextFunction) => {
  if (!UtilService.requireQueryParams(['url'], req?.query)) {
    next(new KnowledgeError(400, 'Bad Request', 'Query parameter `url` is missing or has a falsy value'));
  } else {
    const baseUrl: URL = UtilService.checkUrl(`${req?.query?.url}`);
    const resolveService: AnyResolveService = [ // Add new services here:
      new KnowledgeResolveService(),
      new DbpediaResolveService()
    ].sort((rsA: AnyResolveService, rsB: AnyResolveService) => rsB.priority() - rsA.priority())
      .find((rs: AnyResolveService) => rs.accept(baseUrl));

    if (!!resolveService) {
      resolveService.resolve()
        .then((r: unknown) => res.json(r))
        .catch(next);
    } else {
      next(new KnowledgeError(501, 'Not implemented', `Host of URL '${req.query.url}' is unsupported`));
    }
  }
});

export default router;

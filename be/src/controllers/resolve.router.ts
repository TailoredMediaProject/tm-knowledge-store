import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {StatusCodes} from 'http-status-codes';
import {instance} from '../services/resolve.service';
import {Entity} from '../models/dbo.models';

const router: Router = Router();

router.get('/resolve', (req: Request, res: Response, next: NextFunction) => {
  if (!UtilService.requireQueryParams(['uri'], req?.query)) {
    next(new KnowledgeError(StatusCodes.BAD_REQUEST, 'Query parameter `uri` is missing or has a falsy value'));
  } else {
    const resolveUri: URL = UtilService.checkUrl(`${req?.query?.uri}`);
    instance
      .resolve(resolveUri)
      .then((r: Partial<Entity>) => res.json(r))
      .catch(next);
  }
});

export default router;

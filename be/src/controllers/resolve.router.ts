import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {KnowledgeError} from '../models/knowledge-error.model';

const router: Router = Router();
const prodHost = 'data.tmedia.redlink.io';
const supportedBaseUrls: string[] = [prodHost, 'dbpedia.org'];

router.get('/resolve', (req: Request, res: Response, next: NextFunction) => {
  if (!UtilService.requireQueryParams(['url'], req?.query)) {
    next(new KnowledgeError(400, 'Bad Request', 'Query parameter `url` is missing or has a falsy value'));
  } else {
    const baseUrl: URL = UtilService.checkUrl(`${req?.query?.url}`);

    if (!supportedBaseUrls.some((url: string) => url === baseUrl.host)) {
      next(new KnowledgeError(400, 'Bad Request', `The host of the URL '${baseUrl}' is unsupported`));
    } else {
      if(prodHost === baseUrl.host) {
        res.redirect(301, `${baseUrl.pathname}${baseUrl.search}`);
      } else {
        // TODO TM-89, dbpedia.org
        next(new KnowledgeError(501, 'Not Implemented', `Support of URL '${baseUrl}' not implemented`));
      }
    }
  }
});

export default router;

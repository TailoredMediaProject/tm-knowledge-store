import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ResolveService} from '../models/resolve-service.interface';
import KnowledgeResolveService from '../services/knowledge-resolve.service';
import DbpediaResolveService from '../services/dbpedia-resolve.service';

const router: Router = Router();

const resolvers: ResolveService[] = [
    new KnowledgeResolveService(['http://data.tmedia.redlink.io/kb/', 'https://data.tmedia.redlink.io/kb/']),
    new DbpediaResolveService(),
].sort((a: ResolveService, b: ResolveService) => a.priority() - b.priority());

router.get('/resolve', (req: Request, res: Response, next: NextFunction) => {
    if (!UtilService.requireQueryParams(['url'], req?.query)) {
        next(new KnowledgeError(400, 'Bad Request', 'Query parameter `uri` is missing or has a falsy value'));
    } else {
        const resolveUri: URL = UtilService.checkUrl(`${req?.query?.uri}`);

        const resolveService = resolvers.find(r => r.accept(resolveUri))

        if (!!resolveService) {
            resolveService.resolve(resolveUri)
                .then((r: unknown) => res.json(r))
                .catch(next);
        } else {
            next(new KnowledgeError(501, 'Not implemented', `Host of URL '${resolveUri}' is unsupported`));
        }
    }
});

export default router;

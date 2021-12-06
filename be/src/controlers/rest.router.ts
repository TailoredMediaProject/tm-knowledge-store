// @ts-ignore
import {Request, Response, Router} from 'express';
import ApiService from '../services/api-service';
import PersistenceService from '../services/persistence-service';
import {KnowledgeResponse} from '../models/response-body.model';

const router: Router = Router();

router.get('/vocab', (req: Request, res: Response) => {
  const queryOk: boolean = ApiService.checkQueryParams(
    ['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'],
    req.query
  );

  if (queryOk) {
    PersistenceService.list(req.query)
      .then((knowledgeResponse: KnowledgeResponse) => res.json(knowledgeResponse))
      .catch(error => res.json(error));
  } else {
    res.json({
      statusCode: 400,
      message: 'Invalid query parameters',
      query: req.query
    });
  }
});

router.post('/vocab', (req: Request, res: Response) => {
  res.json({statusCode:201});
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:202});
});

router.get('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:203});
});

router.delete('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:204});
});

router.get('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({statusCode:205});
});

router.post('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({statusCode:206});
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:207});
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:208});
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:209});
});

export default router;

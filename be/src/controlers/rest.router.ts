// @ts-ignore
import {Request, Response, Router} from 'express';
import VocabularyService from '../services/vocabulary.service';

const router: Router = Router();

router.get('/vocab', async (req: Request, res: Response) => {
  res.json(await VocabularyService.list(req));
});

router.get('/vocab/:id', async (req: Request, res: Response) => {
  res.json(await VocabularyService.list(req));
});

router.post('/vocab', (req: Request, res: Response) => {
  res.json({statusCode:201});
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:202});
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

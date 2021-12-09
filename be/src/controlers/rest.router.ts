// @ts-ignore
import {Request, Response, Router} from 'express';
import {vocabularyService} from "../services/vocabulary.service";
import {Vocabulary} from "../models/dbo.models";

const router: Router = Router();

router.get('/vocab', async (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.post('/vocab', async (req: Request, res: Response) => {
  const body = req.body

  const v = await vocabularyService.createVocab(body);

  res.json(v);
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

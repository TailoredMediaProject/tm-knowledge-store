// @ts-ignore
import {Request, Response, Router} from 'express';
import VocabularyService from '../services/vocabulary.service';
import ApiService from '../services/api.service';

const router: Router = Router();

router.get('/vocab', (req: Request, res: Response) => processVocab(req, res));
router.get('/vocab/:id', (req: Request, res: Response) => processVocab(req, res, true));

const processVocab = (req: Request, res: Response, validateId = false): void => {
  try {
    if(validateId){
      ApiService.checkId(req?.params?.id);
    }
    ApiService.checkVocabReadParams(req.query);
    void VocabularyService.list(req.query, req.params.id)
      .then(r => res.json(r));
  } catch (e) {
    console.error(e);
    res.json({
      statusCode: 400,
      message: e
    });
  }
};

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

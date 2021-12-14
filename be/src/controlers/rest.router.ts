import {Request, Response, Router} from 'express';
import {vocabularyService} from "../services/vocabulary.service";
import {Vocabulary} from "../models/dbo.models";
import {Vocabulary as VocabularyDTO} from "../generated/models/Vocabulary";

const router: Router = Router();

const vocabDto2Dbo = (dto: VocabularyDTO): Vocabulary => ({
    _id: undefined,
    created: undefined,
    description: dto.description,
    label: dto.label,
    lastModified: undefined
});

const vocabDbo2Dto = (dbo: Vocabulary): VocabularyDTO => ({
    id: dbo._id.toHexString(),
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    entityCount: -1
});

router.get('/vocab', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

const errorLogAndResponse = (e: unknown, res: Response): void => {
  console.error(e);
  res.json({
    statusCode: 500,
    message: e
  });
};

router.post('/vocab', (req: Request, res: Response) => {
  const body = <VocabularyDTO>req.body
  const newVocab = vocabDto2Dbo(body)

  vocabularyService.createVocab(newVocab)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => errorLogAndResponse(e, res));
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:202});
});

router.get('/vocab/:id', (req: Request, res: Response) => {
  vocabularyService.getVocabular(req.params.id)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => errorLogAndResponse(e, res));
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

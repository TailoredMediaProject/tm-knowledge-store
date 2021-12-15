import {Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {ListingResult} from '../models/listing-result.model';
import ListQueryModel from '../models/query-list.model';

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

router.get('/vocab', (req: Request, res: Response) => processVocab(req, res));


router.post('/vocab', (req: Request, res: Response) => {
  const body = <VocabularyDTO>req.body
  const newVocab = vocabDto2Dbo(body)

  vocabularyService.createVocab(newVocab)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => errorLogAndResponse(e.toString(), res));
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:202});
});

router.get('/vocab/:id', (req: Request, res: Response) => {
  vocabularyService.getVocabular(req.params.id)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => errorLogAndResponse(e.toString(), res));
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

const errorLogAndResponse = (errorMsg: string, res: Response): void => {
  console.error(errorMsg);
  res.json({
    statusCode: 400,
    message: errorMsg
  });
};

const processVocab = (req: Request, res: Response): void => {
  if (!checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], req?.query)) {
    errorLogAndResponse('Invalid query parameters', res);
  } else {
    const queryListModel: ListQueryModel = {
      ...req?.query,
      modifiedSince: !!req?.query?.modifiedSince ? new Date(`${req?.query.modifiedSince}`) : undefined,
      createdSince: !!req?.query?.createdSince ? new Date(`${req?.query.createdSince}`) : undefined,
    };

    vocabularyService.listVocab(queryListModel, req.params.id)
      .then((r: ListingResult<Vocabulary>) => ({...r, items: r.items.map((v: Vocabulary) => vocabDbo2Dto(v))}))
      .then((r: ListingResult<VocabularyDTO>) => res.json(r))
      .catch((e: unknown) => errorLogAndResponse(e.toString(), res));
  }
};

const checkQueryParams = (allowed: string[], query: unknown): boolean => Object.keys(query).every(key => allowed.includes(key));

export default router;

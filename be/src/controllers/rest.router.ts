import {NextFunction, Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {entityServiceInstance} from '../services/entity.service';
import {KnowledgeError} from '../models/knowledge-error.model';

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

router.get('/vocab', (req: Request, res: Response, next: NextFunction) => {
  next(new KnowledgeError(501, 'Not Implemented', 'GET /vocab is not implemented'));
});

router.post('/vocab', (req: Request, res: Response, next: NextFunction) => {
  const body = <VocabularyDTO>req.body
  const newVocab = vocabDto2Dbo(body)

  vocabularyService.createVocab(newVocab)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch(next);
});

router.put('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  const headerName = 'If-Unmodified-Since';
  const ifUnmodifiedSince: string = req.header(headerName);

  if(!!ifUnmodifiedSince) {
    if(!!req?.params?.id) {
      vocabularyService.updateVocab(req?.params?.id, new Date(ifUnmodifiedSince), vocabDto2Dbo(req.body as VocabularyDTO))
        .then((v: Vocabulary) => res.json(vocabDbo2Dto(v)))
        .catch(next);
    } else {
      next(new KnowledgeError(400, 'Bad Request', 'Missing or invalid ID'));
    }
  } else {
    next(new KnowledgeError(409, 'Conflict', `Operation failed, ${headerName}-Header missing or falsy value!`));
  }
});

router.get('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  vocabularyService.getVocabular(req.params.id)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => next(new KnowledgeError(500, 'Internal Server Error', e.toString())));
});

router.delete('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  next(new KnowledgeError(501, 'Not Implemented', 'DELETE /vocab/:id is not implemented'));
});

router.get('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch(e) {
    next(e);
  }
});

router.post('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch(e) {
    next(e);
  }
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch(e) {
    next(e);
  }
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch(e) {
    next(e);
  }
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch(e) {
    next(e);
  }
});

export default router;

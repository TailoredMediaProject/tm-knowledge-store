import {Request, Response, Router} from 'express';
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

router.get('/vocab', () => {
  throw new KnowledgeError(501, 'Not Implemented', 'GET /vocab is not implemented');
});

router.post('/vocab', (req: Request, res: Response) => {
  const body = <VocabularyDTO>req.body
  const newVocab = vocabDto2Dbo(body)

  vocabularyService.createVocab(newVocab)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => {
        throw new KnowledgeError(500, 'Internal Server Error', e.toString());
      });
});

router.put('/vocab/:id', () => {
  throw new KnowledgeError(501, 'Not Implemented', 'PUT /vocab/:id is not implemented');
});

router.get('/vocab/:id', (req: Request, res: Response) => {
  vocabularyService.getVocabular(req.params.id)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch((e: unknown) => {
        throw new KnowledgeError(500, 'Internal Server Error', e.toString());
      });
});

router.delete('/vocab/:id', () => {
  throw new KnowledgeError(501, 'Not Implemented', 'DELETE /vocab/:id is not implemented');
});

router.get('/vocab/:id/entities', () => {
  void entityServiceInstance.getEntities(undefined, undefined);
});

router.post('/vocab/:id/entities', () => {
  void entityServiceInstance.getEntity(undefined, undefined);
});

router.get('/vocab/:id/entities/:id', () => {
  void entityServiceInstance.getEntity(undefined, undefined);
});

router.put('/vocab/:id/entities/:id', () => {
  void entityServiceInstance.updateEntity(undefined, undefined, undefined, undefined);
});

router.delete('/vocab/:id/entities/:id', () => {
  void entityServiceInstance.deleteEntity(undefined, undefined, undefined);
});

export default router;

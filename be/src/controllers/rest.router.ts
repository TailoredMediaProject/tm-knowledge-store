import {NextFunction, Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Entity, Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {Entity as EntityDTO} from '../generated/models/Entity';
import {entityServiceInstance} from '../services/entity.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ListingResult} from '../models/listing-result.model';
import ListQueryModel from '../models/query-list.model';
import {ObjectId} from 'mongodb';

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

const createNewEntityDBO = (vocabID: string | ObjectId, entity: EntityDTO): Entity => ({
  _id: undefined,
  created: new Date(),
  lastModified: new Date(),
  vocabulary: new ObjectId(vocabID),
  label: entity.label,
  description: entity.description,
  type: entity.type,
  externalResources: entity.externalResources,
  sameAs: entity.sameAs,
  data: undefined,
});

router.get('/vocab', (req: Request, res: Response, next: NextFunction) => {
  if (!checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], req?.query)) {
    next(new KnowledgeError(400, 'Bad Request', 'Invalid query parameters'));
  } else {
    const queryListModel: ListQueryModel = {
      ...req?.query,
      modifiedSince: !!req?.query?.modifiedSince ? new Date(`${req?.query.modifiedSince}`) : undefined,
      createdSince: !!req?.query?.createdSince ? new Date(`${req?.query.createdSince}`) : undefined
    };

    vocabularyService.listVocab(queryListModel, req.params.id)
        .then((r: ListingResult<Vocabulary>) => ({ ...r, items: r.items.map((v: Vocabulary) => vocabDbo2Dto(v)) }))
        .then((r: ListingResult<VocabularyDTO>) => res.json(r))
        .catch(next);
  }
});

router.post('/vocab', (req: Request, res: Response, next: NextFunction) => {
  const body = <VocabularyDTO> req.body;
  const newVocab = vocabDto2Dbo(body);


  vocabularyService.createVocab(newVocab)
      .then(v => vocabDbo2Dto(v))
      .then(v => {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${v.id}`;

        res.setHeader('Location', fullUrl);
        res.status(201).json(v);
      })
      .catch(next);
});

router.put('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  next(new KnowledgeError(501, 'Not Implemented', 'PUT /vocab/:id is not implemented'));
});

router.get('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  vocabularyService.getVocabular(req.params.id)
      .then(v => vocabDbo2Dto(v))
      .then(v => res.json(v))
      .catch(next);
});

router.delete('/vocab/:id',  (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('if-unmodified-since')
    checkIfUnmodifiedHeader(header, next)
    checkDateIfValid(header, next)
    const date: Date = new Date(header)

    vocabularyService.deleteVocab(req.params.id, date).then(result => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({
          message: 'Vocabulary not found'
        });
      }
    }).catch(next);
});

router.get('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch (e) {
    next(e);
  }
});

router.post('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
  const vocabID: string = req.params.id;
  try {
    const entity: Entity = createNewEntityDBO(vocabID, req.body as EntityDTO);
    entityServiceInstance.createEntity(vocabID, entity)
        .then(entity => res.status(201).json(entity))
        .catch(next);
  } catch (e) {
    next(e);
  }
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch (e) {
    next(e);
  }
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch (e) {
    next(e);
  }
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    void entityServiceInstance.getEntity(undefined, undefined);
  } catch (e) {
    next(e);
  }
});

const checkQueryParams = (allowed: string[], query: unknown): boolean => Object.keys(query).every(key => allowed.includes(key));

const checkIfUnmodifiedHeader = (header: string, next: NextFunction): void => {
  if (!header){
    next(new KnowledgeError(428,'Header', 'If-Unmodified-Since-Header missing'))}
}

const checkDateIfValid = (header: string, next: NextFunction): void => {
  const date: Date = new Date(header)
  if (isNaN(date.getTime())) {
    next(new KnowledgeError(400, 'Date', 'Date is not valid'))
  }
}

export default router;

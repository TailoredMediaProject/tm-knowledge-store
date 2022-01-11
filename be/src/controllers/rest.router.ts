import {NextFunction, Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Entity, Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {Entity as EntityDTO} from '../generated/models/Entity';
import {EntityService, entityServiceInstance} from '../services/entity.service';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ListingResult} from '../models/listing-result.model';
import ListQueryModel from '../models/query-list.model';
import {UtilService} from '../services/util.service';

const router: Router = Router();

router.get('/vocab', (req: Request, res: Response, next: NextFunction) => {
  if (!UtilService.checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], req?.query)) {
    next(new KnowledgeError(400, 'Bad Request', 'Invalid query parameters'));
  } else {
    const queryListModel: ListQueryModel = {
      ...req?.query,
      modifiedSince: !!req?.query?.modifiedSince ? new Date(`${req?.query.modifiedSince}`) : undefined,
      createdSince: !!req?.query?.createdSince ? new Date(`${req?.query.createdSince}`) : undefined
    };
    vocabularyService
      .listVocab(queryListModel)
      .then((r: ListingResult<Vocabulary>) => ({ ...r, items: r.items.map((v: Vocabulary) => UtilService.vocabDbo2Dto(v)) }))
      .then((r: ListingResult<VocabularyDTO>) => res.json(r))
      .catch(next);
  }
});

router.post('/vocab', (req: Request, res: Response, next: NextFunction) => {
  const body = <VocabularyDTO> req.body;
  const newVocab: Vocabulary = UtilService.vocabDto2Dbo(body);

  vocabularyService
    .createVocab(newVocab)
    .then((v) => UtilService.vocabDbo2Dto(v))
    .then((v) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${v.id}`;

      res.setHeader('Location', fullUrl);
      res.status(201).json(v);
    })
    .catch(next);
});

router.put('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  const headerName = 'If-Unmodified-Since';
  const ifUnmodifiedSince: string = req.header(headerName);

  if (!!ifUnmodifiedSince) {
    if (!!req?.params?.id) {
      vocabularyService
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .updateVocab(req?.params?.id, new Date(ifUnmodifiedSince), UtilService.vocabDto2Dbo(req.body as VocabularyDTO))
        .then((v: Vocabulary) => res.json(UtilService.vocabDbo2Dto(v)))
        .catch(next);
    } else {
      next(new KnowledgeError(400, 'Bad Request', 'Missing or invalid ID'));
    }
  } else {
    next(new KnowledgeError(428, 'Precondition Required', `Operation failed, ${headerName}-Header missing or falsy value!`));
  }
});

router.get('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  vocabularyService
    .getVocabular(req.params.id)
    .then((v) => UtilService.vocabDbo2Dto(v))
    .then((v) => res.json(v))
    .catch(next);
});

router.delete('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
  const date: Date = UtilService.checkIfUnmodifiedHeader(req, next);

  vocabularyService
    .deleteVocab(req.params.id, date)
    .then((result) => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({
          message: 'Vocabulary not found'
        });
      }
    })
    .catch(next);
});

router.get('/vocab/:vId/entities', (req: Request, res: Response, next: NextFunction) => {
  const vId = UtilService.checkId(req?.params?.vId, 'vocabulary', next);

  if (!UtilService.checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows', 'type'], req?.query)) {
    next(new KnowledgeError(400, 'Bad Request', 'Invalid query parameters'));
  } else {
    const queryListModel: ListQueryModel = {
      ...req?.query,
      modifiedSince: !!req?.query?.modifiedSince ? new Date(`${req?.query.modifiedSince}`) : undefined,
      createdSince: !!req?.query?.createdSince ? new Date(`${req?.query.createdSince}`) : undefined
    };

    entityServiceInstance
      .listEntities(queryListModel, vId)
      .then((r: ListingResult<Entity>) => ({ ...r, items: r.items.map((v: Entity) => UtilService.entityDbo2Dto(v)) }))
      .then((r: ListingResult<EntityDTO>) => res.json(r))
      .catch(next);
  }
});

router.get('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
  const vId = UtilService.checkId(req?.params?.vId, 'vocabulary', next);
  const eId = UtilService.checkId(req?.params?.eId, 'entity', next);

  try {
    entityServiceInstance.getEntity(vId, eId)
      .then((e: Entity) => res.json(e))
      .catch(next);
  } catch (e) {
    next(e);
  }
});

router.post('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
  const vocabID: string = req.params.id;
  UtilService.checkId(vocabID, 'vocabulary', next);
  req.body.vocabulary = vocabID;

  const body = <EntityDTO> req.body;
  const entity: Entity = UtilService.entityDto2Dbo(body, next);

  entityServiceInstance
    .createEntity(entity)
    .then(entity => UtilService.entityDbo2Dto(entity))
    .then(ent => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${ent.id}`;

      res.setHeader('Location', fullUrl);
      res.status(201).json(ent);
    })
    .catch(next);
});

router.put('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
  const ifUnmodifiedSince: Date = UtilService.checkIfUnmodifiedHeader(req, next);
  const vId = UtilService.checkId(req?.params?.vId, 'vocabulary', next);
  const eId = UtilService.checkId(req?.params?.eId, 'entity', next);

  req.body.vocabulary = vId;

  entityServiceInstance
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .updateEntity(vId, eId, ifUnmodifiedSince, UtilService.entityDto2Dbo(req.body as EntityDTO, next))
    .then((e: Entity) => res.json(UtilService.entityDbo2Dto(e)))
    .catch(next);
});

router.delete('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
  const date = UtilService.checkIfUnmodifiedHeader(req, next);
  const vId = UtilService.checkId(req?.params?.vId, 'vocabulary', next);
  const eId = UtilService.checkId(req?.params?.eId, 'entity', next);

  entityServiceInstance.deleteEntity(vId, eId, date).then(result => {
    if (result) {
      res.status(204).end();
    } else {
      res.status(404).json({
        message: 'Entity not found'
      });
    }
  }).catch(next);
});

export default router;

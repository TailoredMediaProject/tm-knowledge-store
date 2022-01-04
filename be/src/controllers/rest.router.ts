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


const entityDto2Dbo = (dto: EntityDTO, next: NextFunction): Entity => ({
    /* eslint-disable */
    _id: !!dto?.id ? new ObjectId(checkId(
      // @ts-ignore
      dto?.id, 'entity',
      next)) : undefined,
    vocabulary: new ObjectId(checkId(
      // @ts-ignore
      dto?.vocabulary, 'vocabulary',
      next)),
    /* eslint-enable */
    type: dto.type,
    label: dto.label,
    description: dto.description,
    created: undefined,
    lastModified: undefined,
    externalResources: dto.externalResources,
    sameAs: dto.sameAs,
    data: undefined
});

const entityDbo2Dto = (dbo: Entity): EntityDTO => ({
    id: dbo._id.toHexString(),
    vocabulary: dbo.vocabulary.toHexString(),
    /* eslint-disable */
    // @ts-ignore
    type: TagType[dbo.type.toUpperCase()],
    /* eslint-enable */
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    externalResources: dbo.externalResources,
    sameAs: dbo.sameAs,
    data: dbo.data,
    canonicalLink: undefined
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

        vocabularyService
            .listVocab(queryListModel, req.params.id)
            .then((r: ListingResult<Vocabulary>) => ({...r, items: r.items.map((v: Vocabulary) => vocabDbo2Dto(v))}))
            .then((r: ListingResult<VocabularyDTO>) => res.json(r))
            .catch(next);
    }
});

router.post('/vocab', (req: Request, res: Response, next: NextFunction) => {
    const body = <VocabularyDTO>req.body;
    const newVocab = vocabDto2Dbo(body);

    vocabularyService
        .createVocab(newVocab)
        .then((v) => vocabDbo2Dto(v))
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
                .updateVocab(req?.params?.id, new Date(ifUnmodifiedSince), vocabDto2Dbo(req.body as VocabularyDTO))
                .then((v: Vocabulary) => res.json(vocabDbo2Dto(v)))
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
        .then((v) => vocabDbo2Dto(v))
        .then((v) => res.json(v))
        .catch(next);
});

router.delete('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
    const date: Date = checkIfUnmodifiedHeader(req, next);

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
    const vId = checkId(req?.params?.vId, 'vocabulary', next);


    if (!checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], req?.query)) {
        next(new KnowledgeError(400, 'Bad Request', 'Invalid query parameters'));
    } else {
        const queryListModel: ListQueryModel = {
            ...req?.query,
            modifiedSince: !!req?.query?.modifiedSince ? new Date(`${req?.query.modifiedSince}`) : undefined,
            createdSince: !!req?.query?.createdSince ? new Date(`${req?.query.createdSince}`) : undefined
        };

        entityServiceInstance
            .listEntities(queryListModel, vId)
            .then((r: ListingResult<Entity>) => ({...r, items: r.items.map((v: Entity) => entityDbo2Dto(v))}))
            .then((r: ListingResult<EntityDTO>) => res.json(r))
            .catch(next);
    }
});

router.get('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
    const vId = checkId(req?.params?.vId, 'vocabulary', next);
    const eId = checkId(req?.params?.eId, 'entity', next);

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
    checkId(vocabID, 'vocabulary', next)
    req.body.vocabulary = vocabID;

    const body = <EntityDTO>req.body;
    const entity: Entity = entityDto2Dbo(body, next);

    entityServiceInstance
        .createEntity(entity)
        .then(entity => entityDbo2Dto(entity))
        .then(ent => {
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${ent.id}`;

            res.setHeader('Location', fullUrl);
            res.status(201).json(ent)
        })
        .catch(next);
});

router.put('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
    const ifUnmodifiedSince: Date = checkIfUnmodifiedHeader(req, next);
    const vId = checkId(req?.params?.vId, 'vocabulary', next);
    const eId = checkId(req?.params?.eId, 'entity', next);

    entityServiceInstance
        .updateEntity(vId, eId, ifUnmodifiedSince, entityDto2Dbo(req.body as EntityDTO,  next))
        .then((e: Entity) => res.json(entityDbo2Dto(e)))
        .catch(next);
});

router.delete('/vocab/:vId/entities/:eId', (req: Request, res: Response, next: NextFunction) => {
    const date = checkIfUnmodifiedHeader(req, next)
    const vId = checkId(req?.params?.vId, 'vocabulary', next);
    const eId = checkId(req?.params?.eId, 'entity', next);

    entityServiceInstance.deleteEntity(vId, eId, date).then(result => {
        if (result) {
            res.status(204).end();
        } else {
            res.status(404).json({
                message: 'Entity not found'
            });
        }
    }).catch(next)

});

const checkQueryParams = (allowed: string[], query: unknown): boolean => Object.keys(query).every((key) => allowed.includes(key));

const checkIfUnmodifiedHeader = (req: Request, next: NextFunction): Date => {
    const headerName = 'If-Unmodified-Since';
    const ifUnmodifiedSince: string = req.header(headerName);

    if (!ifUnmodifiedSince) {
        next(new KnowledgeError(428, 'Precondition Required', 'If-Unmodified-Since-Header missing'));
    }

    const date: Date = new Date(ifUnmodifiedSince);

    if (isNaN(date.getTime())) {
        next(new KnowledgeError(422, 'Unprocessable Entity', `The ${headerName}-Header has an invalid date format!`));
    }

    return date;
};

const checkId = (id: string, idName: string, next: NextFunction): string => {
    if (ObjectId.isValid(id)) {
        return id;
    }

    next(new KnowledgeError(428, 'Precondition Required', `Invalid ${idName} ID '${id}'`));
};

export default router;

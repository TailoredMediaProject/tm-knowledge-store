import {NextFunction, Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {entityServiceInstance} from '../services/entity.service';
import {KnowledgeError} from '../models/knowledge-error.model';
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

router.delete('/vocab/:id', async (req: Request, res: Response) => {
    const header = req.header('if-unmodified-since')
    const date: Date = new Date(header)

    vocabularyService.deleteVocab(req.params.id, date).then(result => {
        if (result == -1) {
            res.status(204).end();
        } else {
            switch (result){
                case 0: {
                    res.status(404).json({
                        message: "Date is not valid"
                    });
                    break
                }
                case 1: {
                    res.status(404).json({
                        message: "No document matches the provided ID."
                    })
                    break
                }
                case 2: {
                    res.status(404).json({
                        message: "Vocabulary with matching params not found."
                    })
                    break
                }
                case 3: {
                    res.status(404).json({
                        message: "Failed to delete Vocabulary."
                    })
                    break;
                }
                case 4: {
                    res.status(404).json({
                        message: "Provided id is not valid."
                    })
                    break;
                }
            }
            // res.status(404).json({
            //     message: "Vocabulary not found"
            // });
            // router.delete('/vocab/:id', (req: Request, res: Response, next: NextFunction) => {
            //     next(new KnowledgeError(501, 'Not Implemented', 'DELETE /vocab/:id is not implemented'));
            // });
        }
    }).catch(e => {
        console.error(e);
        res.status(500).json({
            statusCode: 500,
            message: e
        });
    });
});

router.get('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
    try {
        void entityServiceInstance.getEntity(undefined, undefined);
    } catch (e) {
        next(e);
    }
});

router.post('/vocab/:id/entities', (req: Request, res: Response, next: NextFunction) => {
    try {
        void entityServiceInstance.getEntity(undefined, undefined);
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

export default router;

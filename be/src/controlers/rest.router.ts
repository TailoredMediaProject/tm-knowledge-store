import {Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import ListQueryModel from '../models/list-query.model';
import {BSONType} from "mongodb";

const router: Router = Router();

router.get('/vocab', (req: Request, res: Response) => processVocab(req, res));

router.get('/vocab/:id', (req: Request, res: Response) => processVocab(req, res, true));

router.post('/vocab', (req: Request, res: Response) => {
    const body: VocabularyDTO = <VocabularyDTO>req.body;
    const newVocab: Vocabulary = vocabDto2Dbo(body);
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    vocabularyService.createVocab(newVocab)
        .then(v => vocabDbo2Dto(v))
        .then(v => {
            fullUrl += v.id;
            res.setHeader('Location', fullUrl);
            res.status(201).json(v)
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                message: e
            });
        });
});

router.put('/vocab/:id', (req: Request, res: Response) => {
    res.json({statusCode: 205});
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
        }
    }).catch(e => {
        console.error(e);
        res.status(500).json({
            statusCode: 500,
            message: e
        });
    });
});

router.get('/vocab/:id/entities', (req: Request, res: Response) => {
    res.json({statusCode: 205});
});

router.post('/vocab/:id/entities', (req: Request, res: Response) => {
    res.json({statusCode: 206});
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response) => {
    res.json({statusCode: 207});
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response) => {
    res.json({statusCode: 208});
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response) => {
    res.json({statusCode: 209});
});

const processVocab = (req: Request, res: Response, validateId = false): void => {
    try {
        if (validateId) {
            checkId(req?.params?.id);
        }
        checkVocabReadParams(req.query);
        void vocabularyService.listVocab(req.query, req.params.id)
            .then(v => v.map(dbo => vocabDbo2Dto(dbo)))
            .then(r => res.json({
                offset: req?.query?.offset ?? 0,
                rows: r.length,
                totalItems: 0, // TODO
                items: r
            }));
    } catch (e) {
        console.error(e);
        res.json({
            statusCode: 400,
            message: e
        });
    }
};

const checkVocabReadParams = (query: ListQueryModel): void => {
    if (!checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], query)) {
        throw Error('Invalid query parameters');
    }

// @ts-ignore
    if (query?.createdSince && !ApiService.checkUTCString(query.createdSince)) {
        throw Error('Invalid createdSince date');
    }

// @ts-ignore
    if (query?.modifiedSince && !ApiService.checkUTCString(query.modifiedSince)) {
        throw Error(`Invalid modifiedSince date`);
    }
};

const checkId = (id: number | string | undefined): void => {
    if (!id) {
        throw new Error('Invalid ID');
    }
};

const checkQueryParams = (allowed: string[], query: unknown): boolean => Object.keys(query).every(key => allowed.includes(key));

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

export default router;

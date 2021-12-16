import {Request, Response, Router} from 'express';
import {vocabularyService} from "../services/vocabulary.service";
import {Entity, Vocabulary} from "../models/dbo.models";
import {Vocabulary as VocabularyDTO} from "../generated/models/Vocabulary";
import {entityService} from "../services/entity-service";
import {Entity as EntityDTO, TagType} from "../generated";
import {ObjectId} from "mongodb";


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
    data: entity.data,
    canonicalLink: entity.canonicalLink
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
    const vocabID: string = req.params.id;
    const entity: Entity = createNewEntityDBO(vocabID, req.body as EntityDTO);
    entityService.createEntity(vocabID, entity)
        .then(entity => res.json(entity))
        .catch((error: unknown) => errorLogAndResponse(error, res));
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

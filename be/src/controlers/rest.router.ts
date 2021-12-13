import {Request, Response, Router} from 'express';
import {vocabularyService} from '../services/vocabulary.service';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import ListQueryModel from '../models/list-query.model';

const router: Router = Router();

function vocabDto2Dbo(dto: VocabularyDTO): Vocabulary {
  const vocab: Vocabulary = {
    _id: undefined,
    created: undefined,
    description: dto.description,
    label: dto.label,
    lastModified: undefined
  }
  return vocab
}

function vocabDbo2Dto(dbo: Vocabulary): VocabularyDTO {
  return {
    id: dbo._id.toHexString(),
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    entityCount: -1
  };
}

router.get('/vocab', (req: Request, res: Response) => processVocab(req, res));

router.get('/vocab/:id', (req: Request, res: Response) => processVocab(req, res, true));

router.post('/vocab', (req: Request, res: Response) => {
  const body: VocabularyDTO = <VocabularyDTO> req.body;
  const newVocab: Vocabulary = vocabDto2Dbo(body);

  vocabularyService.createVocab(newVocab)
    .then(v => vocabDbo2Dto(v))
    .then(v => res.json(v))
    .catch(e => {
      console.error(e);
      res.json({
        statusCode: 400,
        message: e
      });
    });
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({ statusCode: 205 });
});

router.delete('/vocab/:id', (req: Request, res: Response) => {
  res.json({ statusCode: 204 });
});

router.get('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({ statusCode: 205 });
});

router.post('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({ statusCode: 206 });
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({ statusCode: 207 });
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({ statusCode: 208 });
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({ statusCode: 209 });
});

const processVocab = (req: Request, res: Response, isRead = false): void => {
  try {
    if (isRead) {
      checkId(req?.params?.id);
    }
    checkVocabReadParams(req.query);
    void vocabularyService.listVocab(req.query, req.params.id)
      .then(v => v.map((dbo: Vocabulary) => vocabDbo2Dto(dbo)))
      .then((r: VocabularyDTO[]) => res.json(createReadOrListResponse(r, req?.params?.id,
        // @ts-ignore
        req?.query?.offset, isRead)));
  } catch (e) {
    console.error(e);
    res.json({
      statusCode: 400,
      message: e
    });
  }
};

const createReadOrListResponse = (items: VocabularyDTO[], id: string | undefined, offset: string | undefined, isRead: boolean): any => {
  if (isRead) {
    return items.find((dto: VocabularyDTO) => dto.id === id);
  } else {
    return {
      offset,
      rows: items.length,
      totalItems: 0, // TODO
      items
    };
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

export default router;

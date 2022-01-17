import {NextFunction, Request} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ObjectId} from 'mongodb';
import {Entity, Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {Entity as EntityDTO} from '../generated/models/Entity';
import {HEADER_IF_UNMODIFIED_SINCE, HOST} from '../models/constants';

export class UtilService {
  public static readonly checkQueryParams = (allowed: string[], query: unknown): boolean =>
    Object.keys(query).every((key) => allowed.includes(key));

  public static readonly requireQueryParams = (required: string[], query: unknown): boolean =>
    // @ts-ignore
    required.every((queryParam: string) => queryParam in query && !!query[queryParam])

  public static readonly checkIfUnmodifiedHeader = (req: Request, next: NextFunction): Date => {
    const ifUnmodifiedSince: string = req.header(HEADER_IF_UNMODIFIED_SINCE);

    if (!ifUnmodifiedSince) {
      next(new KnowledgeError(428, 'Precondition Required', `${HEADER_IF_UNMODIFIED_SINCE} missing`));
      return undefined;
    }

    const date: Date = new Date(ifUnmodifiedSince);

    if (isNaN(date.getTime())) {
      next(new KnowledgeError(422, 'Unprocessable Entity', `The ${HEADER_IF_UNMODIFIED_SINCE}-Header has an invalid date format!`));
      return undefined;
    }

    return date;
  };

  public static readonly checkAcceptHeader = (req: Request, supportedMimeTypes: string[], next: NextFunction): string => {
    const headerName = 'Accept';
    const accept: string = req.header(headerName);

    if(!accept || accept === '*/*') {
      return 'text/turtle'; // TODO set in constants.ts when merged
    }

    if(supportedMimeTypes.includes(accept)) {
      return accept;
    }

    next(new KnowledgeError(406, 'Not Acceptable', `The Accept-Header value '${accept}' is unacceptable`))
    return undefined;
  };

  public static readonly checkId = (id: string, idName: string, next: NextFunction): string => {
    if (ObjectId.isValid(id)) {
      return id;
    }

    next(new KnowledgeError(428, 'Precondition Required', `Invalid ${idName} ID '${id}'`));
  };

  public static readonly escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '');

  public static readonly checkUrl = (url: string): URL => {
    try {
      return new URL(url);
    } catch (e) {
      throw new KnowledgeError(400, 'Bad Request', `The URL '${url}' is malformed`);
    }
  };

  public static readonly entityDto2Dbo = (dto: EntityDTO, next: NextFunction): Entity => ({
    /* eslint-disable */
    _id: !!dto?.id ? new ObjectId(UtilService.checkId(
      // @ts-ignore
      dto?.id, 'entity',
      next)) : undefined,
    vocabulary: new ObjectId(UtilService.checkId(
      // @ts-ignore
      dto?.vocabulary, 'vocabulary',
      next)),
    /* eslint-enable */
    type: dto?.type?.toUpperCase(),
    label: dto.label,
    description: dto.description,
    created: undefined,
    lastModified: undefined,
    externalResources: dto.externalResources,
    sameAs: dto.sameAs,
    data: undefined
  });

  public static readonly entityDbo2Dto = (dbo: Entity): EntityDTO => ({
    id: dbo._id.toHexString(),
    vocabulary: dbo.vocabulary.toHexString(),
    // @ts-ignore
    type: dbo?.type?.toUpperCase(),
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    externalResources: dbo.externalResources,
    sameAs: dbo.sameAs,
    data: dbo.data,
    canonicalLink: `https://${HOST}/kb/${dbo._id.toHexString()}`
  });

  // TODO TM-92, next step in next branch: transform with https://github.com/rubensworks/rdf-parse.js entity to turtle and return result
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static readonly entityDbo2LinkedData = (e: Entity, mimeType: string): EntityDTO => UtilService.entityDbo2Dto(e);

  public static readonly vocabDto2Dbo = (dto: VocabularyDTO): Vocabulary => ({
    _id: undefined,
    created: undefined,
    description: dto.description,
    label: dto.label,
    lastModified: undefined
  });

  public static readonly vocabDbo2Dto = (dbo: Vocabulary): VocabularyDTO => ({
    id: dbo._id.toHexString(),
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    entityCount: -1
  });
}

import {NextFunction, Request} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ObjectId} from 'mongodb';
import {Entity, Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {Entity as EntityDTO} from '../generated/models/Entity';
import {StatusCodes} from 'http-status-codes';
import {HEADER_ACCEPT, HEADER_IF_UNMODIFIED_SINCE, HOST, MIME_TYPE_TURTLE} from '../models/constants';
import {DataFactory, Literal, Writer} from 'n3';

export class UtilService {
  public static readonly checkQueryParams = (allowed: string[], query: unknown): boolean =>
    Object.keys(query).every((key) => allowed.includes(key));

  public static readonly requireQueryParams = (required: string[], query: unknown): boolean =>
    // @ts-ignore
    required.every((queryParam: string) => queryParam in query && !!query[queryParam])

  public static readonly checkIfUnmodifiedHeader = (req: Request, next: NextFunction): Date => {
    const ifUnmodifiedSince: string = req.header(HEADER_IF_UNMODIFIED_SINCE);

    if (!ifUnmodifiedSince) {
      next(new KnowledgeError(StatusCodes.PRECONDITION_REQUIRED, `${HEADER_IF_UNMODIFIED_SINCE} missing`));
      return undefined;
    }

    const date: Date = new Date(ifUnmodifiedSince);

    if (isNaN(date.getTime())) {
      next(new KnowledgeError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        `The ${HEADER_IF_UNMODIFIED_SINCE}-Header has an invalid date format!`)
      );
      return undefined;
    }

    return date;
  };

  public static readonly checkAcceptHeader = (req: Request, supportedMimeTypes: string[], next: NextFunction): string => {
    const accept: string = req.header(HEADER_ACCEPT);

    if(!accept || accept === '*/*') {
      return MIME_TYPE_TURTLE;
    }

    if(supportedMimeTypes.includes(accept)) {
      return accept;
    }

    UtilService.throwNotAcceptable(accept, next);
    return undefined;
  };

  public static readonly checkId = (id: string, idName: string, next: NextFunction): string => {
    if (ObjectId.isValid(id)) {
      return id;
    }

    next(new KnowledgeError(StatusCodes.PRECONDITION_REQUIRED, `Invalid ${idName} ID '${id}'`));
  };

  public static readonly escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '');

  public static readonly checkUrl = (url: string): URL => {
    try {
      return new URL(url);
    } catch (e) {
      throw new KnowledgeError(StatusCodes.BAD_REQUEST, `The URL '${url}' is malformed`);
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

  public static readonly entityDbo2LinkedData = (e: Entity, mimeType: string, next: NextFunction): string => {
    if(MIME_TYPE_TURTLE === mimeType) {
      return UtilService.entityDbo2Turtle(e);
    } else {
      UtilService.throwNotAcceptable(mimeType, next);
    }
  };

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

  private static readonly throwNotAcceptable = (mimeType: string, next: NextFunction): void =>
    next(new KnowledgeError(StatusCodes.NOT_ACCEPTABLE,  `The Accept-Header value '${mimeType}' is unacceptable`));

  private static readonly entityDbo2Turtle = (e: Entity): string => {
    const prefix = 'http://purl.org/dc/terms/';
    const writer = new Writer({
      format: MIME_TYPE_TURTLE,
      prefixes: {dc: prefix}
    });

    writer.addQuad(
      DataFactory.namedNode(`${e._id.toHexString()}`),
      DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      DataFactory.namedNode(`${e.type}`)
    );

    ['label', 'description', 'created', 'lastModified'].forEach((propertyName: string) => {
      writer.addQuad(DataFactory.quad(
        DataFactory.namedNode(`${e._id.toHexString()}`),
        DataFactory.namedNode(`${prefix}${propertyName}`),
        // @ts-ignore
        UtilService.typeTurtleValue(e[propertyName])
      ));
    });

    let rdf: string;
    // Workaround, see https://github.com/rdfjs/N3.js/issues/264
    writer.end((error, result) => rdf = `@base <https://${HOST}/kb/> .\n${result}`);
    return rdf;
  };

  private static readonly typeTurtleValue = (value: unknown): Literal => value instanceof Date ?
    DataFactory.literal(
      value.toISOString(),
      DataFactory.namedNode('xsd:Date')
    ) : DataFactory.literal(`${value}`);
}

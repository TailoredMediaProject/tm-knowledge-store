import {NextFunction, Request} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ObjectId} from 'mongodb';
import {Entity, Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated/models/Vocabulary';
import {Entity as EntityDTO} from '../generated/models/Entity';
import {StatusCodes} from 'http-status-codes';
import {HEADER_ACCEPT, HEADER_IF_UNMODIFIED_SINCE, HOST, MIME_TYPE_TURTLE} from '../models/constants';
import {vocabularyService} from './vocabulary.service';
import {TagType} from '../generated';
import {entityServiceInstance} from './entity.service';

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

  public static readonly checkIfIdOrSlug = (id: string): Promise<string> => {
    if (ObjectId.isValid(id)) {
      return Promise.resolve(id);
    }
    return vocabularyService.getVocabularyWithSlug(id).then((vocab: Vocabulary) => {
      if (vocab) {
        return vocab._id.toHexString();
      }
      return Promise.reject(new KnowledgeError(StatusCodes.PRECONDITION_REQUIRED, `Invalid Vocabulary ID '${id}'`));
    });
  }

  public static readonly checkIfSlugExist = (slug?: string): Promise<boolean> => {
    if (!slug || slug.trim() === '') {
      return Promise.resolve(false);
    }
    return vocabularyService.getVocabularyWithSlug(slug).then((vocab: Vocabulary) => !!vocab);
  }

  public static readonly checkOrCreateId = (id: string): Promise<string> =>
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.checkIfIdOrSlug(id)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(async _ => await vocabularyService.createVocab({
        _id: null,
        slug: id,
        created: new Date(),
        lastModified: new Date(),
        label: null,
        description: null,
        entityCount: 0,
      }).then(vocab => vocab._id.toHexString()))
      .catch(error => {
        console.error(error);
        return error;
      })

  public static readonly checkIfEntityExists = (vocabId: string, label: string, type: TagType, sameAs: string[]): Promise<Entity> => {
    if (!vocabId || vocabId.trim() === '' || sameAs.length === 0) {
      return Promise.reject('VocabId and sameAs links not given!');
    }
    return entityServiceInstance.listEntities({vocabId, text: label, type, includesSameAs: sameAs})
      .then(list => {
        if (list.items.length > 0) {
          return list.items[0];
        }
        return null;
      });
  }

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

  public static readonly vocabDto2Dbo = (dto: VocabularyDTO): Vocabulary => ({
    _id: undefined,
    slug: dto.slug,
    created: undefined,
    description: dto.description,
    label: dto.label,
    lastModified: undefined,
    entityCount: undefined
  });

  public static readonly vocabDbo2Dto = (dbo: Vocabulary): VocabularyDTO => ({
    id: dbo._id.toHexString(),
    slug: dbo.slug,
    label: dbo.label,
    description: dbo.description,
    created: dbo.created.toISOString(),
    lastModified: dbo.lastModified.toISOString(),
    entityCount: dbo.entityCount
  });

  public static readonly throwNotAcceptable = (mimeType: string, next: NextFunction): void =>
    next(new KnowledgeError(StatusCodes.NOT_ACCEPTABLE,  `The Accept-Header value '${mimeType}' is unacceptable`));
}

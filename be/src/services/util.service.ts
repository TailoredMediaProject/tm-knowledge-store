import {NextFunction, Request} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ObjectId} from 'mongodb';

export class UtilService {
  public static readonly checkQueryParams = (allowed: string[], query: unknown): boolean =>
    Object.keys(query).every((key) => allowed.includes(key));

  public static readonly checkIfUnmodifiedHeader = (req: Request, next: NextFunction): Date => {
    const headerName = 'If-Unmodified-Since';
    const ifUnmodifiedSince: string = req.header(headerName);

    if (!ifUnmodifiedSince) {
      next(new KnowledgeError(428, 'Precondition Required', 'If-Unmodified-Since-Header missing'));
      return undefined;
    }

    const date: Date = new Date(ifUnmodifiedSince);

    if (isNaN(date.getTime())) {
      next(new KnowledgeError(422, 'Unprocessable Entity', `The ${headerName}-Header has an invalid date format!`));
      return undefined;
    }

    return date;
  };

  public static readonly checkId = (id: string, idName: string, next: NextFunction): string => {
    if (ObjectId.isValid(id)) {
      return id;
    }

    next(new KnowledgeError(428, 'Precondition Required', `Invalid ${idName} ID '${id}'`));
  };
}

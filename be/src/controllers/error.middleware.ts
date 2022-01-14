import {Request, Response} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ServiceError, ServiceErrorType} from '../models/service-error.model';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';

const serviceError2StatusCode = (serveError: ServiceErrorType): number => {
  if (ServiceErrorType.INVALID_QUERY_VALUE === serveError) {
    return StatusCodes.BAD_REQUEST;
  } else if (ServiceErrorType.NOT_FOUND === serveError) {
    return StatusCodes.NOT_FOUND;
  } else if (ServiceErrorType.CONFLICT === serveError) {
    return StatusCodes.CONFLICT;
  } else if (ServiceErrorType.PRECONDITION_FAILED === serveError) {
    return StatusCodes.PRECONDITION_FAILED;
  }
  return StatusCodes.INTERNAL_SERVER_ERROR;
};

export const ErrorMiddleware = (err: KnowledgeError | ServiceError, req: Request, res: Response): void => {
  if (err instanceof KnowledgeError) {
    console.error(err);
    const body = !!err?.data ? err.data : { title: err.title, message: err.message };
    res.status(err.statusCode).json(body);
  } else if (err instanceof ServiceError) {
    console.error(err);
    const statusCode: number = serviceError2StatusCode(err.type);
    const body = !!err?.data ? err.data : { title: getReasonPhrase(statusCode), message: err.message };

    res.status(statusCode).json(body);
  }
  else {
    res.status(StatusCodes.BAD_REQUEST).json({title: 'Internal Server Error', message: err});
  }
};

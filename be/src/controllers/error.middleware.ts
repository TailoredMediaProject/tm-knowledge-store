import {Request, Response} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';
import {ServiceError, ServiceErrorType} from '../models/service-error.model';

export const ErrorMiddleware = (err: KnowledgeError | ServiceError, req: Request, res: Response): void => {
  if (err instanceof KnowledgeError) {
    console.error(err);
    const body = !!err?.data ? err.data : { title: err.title, message: err.message };
    res.status(err.statusCode).json(body);
  } else if (err instanceof ServiceError) {
    console.error(err);
    const body = !!err?.data ? err.data : { title: ServiceErrorType[err.type], message: err.message };
    res.status(err.type).json(body);
  }
  else {
    res.status(500).json({title: 'Internal Server Error', message: err});
  }
};

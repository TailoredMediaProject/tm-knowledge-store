import {NextFunction, Request, Response} from 'express';
import {KnowledgeError} from '../models/knowledge-error.model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const KnowledgeErrorMiddleware = (err: KnowledgeError, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof KnowledgeError) {
    console.error(err);
    const body = !!err?.data ? err.data : { title: err.title, message: err.message };
    res.status(err.statusCode).json(body);
  } else {
    // TODO TM-107
    res.status(500).json({title: 'Internal Server Error', message: err});
  }
};

import ApiService from './api.service';
import PersistenceService from './persistence.service';
import {Request} from 'express';
import ListQueryModel from '../models/list-query.model';

class VocabularyService {
  public list(req: Request): Promise<any> {
    const hasError = this.checkVocabReadParams(req.query);

    if (hasError) {
      return hasError;
    }

    return PersistenceService.list(req.query, req.params.id);
  }

  private checkVocabReadParams(query: ListQueryModel): boolean | any {
    if (!ApiService.checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], query)) {
      return {
        // @ts-ignore
        statusCode: 400,
        message: 'Invalid query parameters',
        query: query
      };
    }

    // @ts-ignore
    if(query?.createdSince && !ApiService.checkUTCString(query.createdSince)) {
      return {
        // @ts-ignore
        statusCode: 400,
        message: `Invalid createdSince date`,
        query: query.createdSince
      };
    }

    // @ts-ignore
    if(query?.modifiedSince && !ApiService.checkUTCString(query.modifiedSince)) {
      return {
        // @ts-ignore
        statusCode: 400,
        message: `Invalid modifiedSince date`,
        query: query.modifiedSince
      };
    }

    return false;
  }
}

export default new VocabularyService();

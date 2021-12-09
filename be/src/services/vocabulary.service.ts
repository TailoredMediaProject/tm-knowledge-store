import PersistenceService from './persistence.service';
import ListQueryModel from '../models/list-query.model';

class VocabularyService {
  public list(query: ListQueryModel, id?: string): Promise<any> {
    return PersistenceService.list(query, id);
  }
}

export default new VocabularyService();

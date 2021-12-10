import PersistenceService from './persistence.service';
import ListQueryModel from '../models/list-query.model';
import {Filter, FindOptions} from 'mongodb';
import {Vocabulary} from '../models/dbo.models';
import {Vocabulary as VocabularyDTO} from '../generated';

class VocabularyService {
  public async list(query: ListQueryModel, id?: string): Promise<any> {
    const {options, filter} = this.transformToMongoDBFilterOption(query, id);
    const vocDBOs: Vocabulary[] = await PersistenceService.list(options, filter);

    return {
      offset: options.skip ?? 0,
      rows: vocDBOs.length,
      totalItems: 0, // TODO
      items: vocDBOs.map(v => this.vocabDbo2Dto(v))
    };
  }

  private vocabDbo2Dto(dbo: Vocabulary): VocabularyDTO {
    return {
      id: dbo._id.toHexString(),
      label: dbo.label,
      description: dbo.description,
      created: dbo.created.toISOString(),
      lastModified: dbo.lastModified.toISOString(),
      entityCount: -1
    };
  }

  private transformToMongoDBFilterOption(query?: ListQueryModel, id?: string): {options: FindOptions, filter: Filter<Vocabulary>} {
    const options: FindOptions = {};
    const filter: Filter<Vocabulary> = {};

    if(!!id) {
      // @ts-ignore
      filter._id = id;
    }

    if(!!query) {
      if (!!query?.text) {
        filter.$or = [
          {
            label: {
              $regex: `${query.text}`,
              $options: 'gi'
            }
          },
          {
            description: {
              $regex: `${query.text}`,
              $options: 'gi'
            }
          }
        ];
      }

      if(!!query?.createdSince) {
        // @ts-ignore
        filter.created = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query?.createdSince)
          // https://www.mongodb.com/community/forums/t/finding-data-between-two-dates-by-using-a-query-in-mongodb-charts/102506/2
        };
      }

      if(!!query?.modifiedSince) {
        // @ts-ignore
        filter.lastModified = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          $gte: new Date(query.modifiedSince)
        };
      }

      if(!!query?.sort) {
        options.sort = this.mapToMongoSort(query?.sort);
      }

      if(!!query?.offset) {
        options.skip = Number(query?.offset); // Without the cast, it won't work!
      }

      if(!!query?.rows) {
        options.limit = Number(query?.rows); // Without the cast, it won't work!
      }
    }

    return {
      options,
      filter
    };
  }

  private mapToMongoSort(sort: string): any {
    if(!!sort && sort.includes(' ')) {
      if(sort.toLowerCase().includes('created')) {
        return {
          created: sort.toLowerCase().includes('asc') ? 1 : -1
        };
      } else {
        return {
          lastModified: sort.toLowerCase().includes('asc') ? 1 : -1
        };
      }
    }
    return {};
  }
}

export default new VocabularyService();

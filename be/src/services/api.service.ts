import ListQueryModel from '../models/list-query.model';

export default class ApiService {
    public static checkVocabReadParams(query: ListQueryModel): void {
        if (!ApiService.checkQueryParams(['text', 'createdSince', 'modifiedSince', 'sort', 'offset', 'rows'], query)) {
            throw Error('Invalid query parameters');
        }

        // @ts-ignore
        if(query?.createdSince && !ApiService.checkUTCString(query.createdSince)) {
            throw Error('Invalid createdSince date');
        }

        // @ts-ignore
        if(query?.modifiedSince && !ApiService.checkUTCString(query.modifiedSince)) {
            throw Error(`Invalid modifiedSince date`);
        }
    }

    public static checkId(id:number|string|undefined): void {
        if(!!id) {
            throw new Error ('Invalid ID');
        }
    }

    public static checkQueryParams(allowed: string[], query: unknown): boolean {
        return Object.keys(query).every(key => allowed.includes(key));
    }

    public static checkUTCString(utc: string): boolean {
        return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(utc);
    }
}

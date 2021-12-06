export default class ApiService {
    public static checkQueryParams(allowed: string[], query: any): boolean {
        return Object.keys(query).every(key => allowed.includes(key));
    }
}

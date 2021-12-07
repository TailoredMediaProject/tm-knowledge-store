export default class ApiService {
    public static checkQueryParams(allowed: string[], query: any): boolean {
        return Object.keys(query).every(key => allowed.includes(key));
    }

    public static checkUTCString(utc: string): boolean {
        return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(utc);
    }
}

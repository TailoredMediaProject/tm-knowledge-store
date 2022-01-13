import {ResolveService} from '../models/resolve-service.interface';
import fetch from 'node-fetch';
import {URL} from 'url';


export default class DbpediaResolveService implements ResolveService {
  private readonly host: string[] = ['dbpedia.org', 'api.live.dbpedia.org'];
  private readonly uri: URL;
  private readonly address = 'https://dbpedia.org/resource/ORF_(broadcaster)'

  constructor() {
    // this.uri = 'http://'+this.host+'/resource/'+entity;
    // @ts-ignore
    // const uri11: URL = new URL('http://api.live.dbpedia.org/resource/en/ORF_(broadcaster)')
    const uri11: URL = new URL('https://dbpedia.org/resource/ORF_(broadcaster)')
    this.uri = uri11

    this.init()
  }

  async init(): Promise<void>{
    const response = await this.resolve(this.uri)
    console.log('Im here')
    console.log(response)
    console.log(typeof response)
  }

  accept(uri: URL): boolean {
    return this.host.includes(uri.host)
  }

  priority(): number {
    return 10;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async resolve(uri: URL): Promise<string> {
    if(!this.accept(uri)) {
      return Promise.reject(`Can't handle uri ${uri}`);
    }
    try {
      return await fetch(this.uri, {headers: {'Accept': 'application/json'}})
        .then(data => data.json())
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.log(e)
    }

    // TODO TM-89, use DBpedia adapter here
    return Promise.reject('Not (yet) implemented');
  }
}

import {ResolveService} from '../models/resolve-service.interface';
import fetch from 'node-fetch';
import {URL} from 'url';


export default class DbpediaResolveService implements ResolveService {
  private readonly host = 'dbpedia.org';
  private readonly uri: URL;
  private readonly address = 'https://dbpedia.org/page/ORF_(broadcaster)'

  constructor() {
    // this.uri = 'http://'+this.host+'/resource/'+entity;
    // @ts-ignore
    // const uri11: URL = new URL('http://api.live.dbpedia.org/resource/en/ORF_(broadcaster)')
    const uri11: URL = new URL('http://api.live.dbpedia.org/resource/en/ORF_(broadcaster)')
    this.uri = uri11

    void this.resolve()
  }

  accept(uri: URL): boolean {
    return this.host === uri.host;
  }

  priority(): number {
    return 10;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async resolve(): Promise<void> {
    // if(!this.accept(uri)) {
    //   return Promise.reject(`Can't handle uri ${uri}`);
    // }
    try {
      await fetch(this.uri)
        .then(data => data.text())
        .then(res => console.log(res))
    } catch (e){
      console.log(e)
    }


    // TODO TM-89, use DBpedia adapter here
    // return Promise.reject('Not (yet) implemented');
  }
}

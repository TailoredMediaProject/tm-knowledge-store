import {ResolveService} from '../models/resolve-service.interface';
import {URL} from 'url';
import Store from 'rdflib/lib/store';
import {Literal} from 'rdflib';
import $rdf = require('rdflib');
import {Entity} from '../models/dbo.models';
import {ServiceErrorFactory} from '../models/service-error.model';

export default class DbpediaResolveService implements ResolveService {
  private readonly host: string[];

  private readonly props = {
    title: ['http://www.w3.org/2000/01/rdf-schema#label', 'http://xmlns.com/foaf/0.1/name'],
    abstract: ['http://www.w3.org/2000/01/rdf-schema#comment', 'http://dbpedia.org/ontology/abstract'],
    type: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']
  }

  private readonly language = 'de'

  constructor(baseUri: string[]) {
    this.host = baseUri;
  }

  accept(uri: URL): boolean {
    return this.host.includes(uri.host)
  }

  priority(): number {
    return 10;
  }

  // @ts-ignore
  public async resolve(uri: URL): Promise<Partial<Entity>> {
    if(!this.accept(uri)) {
      return Promise.reject(`Can't handle uri ${uri}`);
    }

    const url: URL = new URL(uri.toString().replace('http:', 'https:').replace('resource', 'data') + '.ttl')
    
    const store: Store = $rdf.graph();
    const fetcher = new $rdf.Fetcher(store, {timeout: 5000});

    const response = {}

    const subject = $rdf.sym(uri.toString())

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    return fetcher.load(url.toString(), {}).then(() => {

      const keys = Object.keys(this.props)
      // console.log(keys)

      /* eslint-disable */
      keys.forEach((key) => {
        // @ts-ignore
        for (let i = 0; i < this.props[key].length; i++){
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const curr = store.match(subject, $rdf.sym(this.props[key][i]))
              .map(q => q.object)
              .filter(o => o instanceof Literal)
              // @ts-ignore
              .filter((l: Literal) => l.language == this.language)
          if (!!curr){
            // @ts-ignore
            response[`${key}`] = curr.toString()
            break
          }
        }
      });

      /* eslint-enable */



      /** Represents all the possible predicates on the given subject */

      // store.match(subject)
      //   .map(q => q.predicate)
      //   .map(p => p.value)
      //   .sort()
      //   .reduce(((previousValue, currentValue) => {
      //     if (previousValue !== currentValue) {
      //       console.log(currentValue)
      //     }
      //     return currentValue
      //   })
      //   )

      /** Shows all the possible predicates with all languages */

      // for (let i = 0; i < this.props.title.length; i++) {
      //   console.log('\n')
      //   console.log(this.props.title[i])
      //   store.match(subject, $rdf.sym(this.props.title[i]))
      //     .map(q => q.object)
      //     .filter(o => o instanceof Literal)
      //   // .filter((l: Literal) => l.language == language)
      //   // .map(p => p.value)
      //   // .sort()
      //   //   .reduce(((previousValue: Literal, currentValue: Literal) => {
      //   //     // console.log('previous: ', previousValue)
      //   //     // console.log('current: ', currentValue)
      //   //     if (previousValue !== currentValue) {
      //   //       console.log(currentValue.language + ': ' + currentValue.value)
      //   //     }
      //   //     return currentValue
      //   //   })
      //   //   )
      //     .forEach((res ) => {
      //       // console.log('size: ', array.length)
      //       console.log(res.value)
      //     })
      // }

      // running = false
      return Promise.resolve({data: response})
    }
    ).catch(e => 
      // console.error(e);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ServiceErrorFactory.requestTimeout(e.toString())
    );

    // TODO TM-89, use DBpedia adapter here
    // return Promise.reject('Not (yet) implemented');
  }
}

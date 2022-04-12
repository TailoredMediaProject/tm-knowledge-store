import {ResolveServiceInterface} from '../models/resolve-service.interface';
import {URL} from 'url';
import Store from 'rdflib/lib/store';
import {Literal} from 'rdflib';
import {Entity} from '../models/dbo.models';
import {ServiceErrorFactory} from '../models/service-error.model';
import {Quad_Subject} from 'rdflib/lib/tf-types';
import $rdf = require('rdflib');

export default class DbpediaResolveService implements ResolveServiceInterface {
  private readonly host: string[];

  private readonly props = {
    title: ['http://www.w3.org/2000/01/rdf-schema#label', 'http://xmlns.com/foaf/0.1/name'],
    abstract: ['http://www.w3.org/2000/01/rdf-schema#comment', 'http://dbpedia.org/ontology/abstract'],
    type: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']
  };

  private readonly language: string;

  constructor(baseUri: string[], language: string) {
    this.host = baseUri;
    this.language = language;
  }

  accept(uri: URL): boolean {
    return this.host.includes(uri.host);
  }

  priority(): number {
    return 10;
  }

  public async resolve(uri: URL): Promise<Partial<Entity>> {
    if (!this.accept(uri)) {
      return Promise.reject(`Can't handle uri ${uri}`);
    }

    const url: URL = new URL(uri.toString().replace('http:', 'https:').replace('resource', 'data') + '.ttl');

    const store: Store = $rdf.graph();
    const fetcher = new $rdf.Fetcher(store, {timeout: 5000});

    const response = {};

    const subject = $rdf.sym(uri.toString());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    return fetcher
      .load(url.toString(), {})
      .then(() => {
        const keys = Object.keys(this.props);

        keys.forEach((key) => {
          // @ts-ignore
          for (let i = 0; i < this.props[key].length; i++) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const curr = store
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              .match(subject, $rdf.sym(this.props[key][i]))
              .map((q) => q.object)
              .filter((o) => o instanceof Literal)
              // @ts-ignore
              .filter((l: Literal) => l.language === this.language);
            if (!!curr) {
              // @ts-ignore
              response[`${key}`] = curr.toString();
              break;
            }
          }
        });

        return Promise.resolve({data: response});
      })
      .catch((e) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ServiceErrorFactory.requestTimeout(e.toString())
      );
  }

  /** Shows all the possible predicates with all languages */
  // eslint-disable-next-line @typescript-eslint/ban-types
  private getPredicatesWithLanguages(store: Store, subject: Quad_Subject, predicates: Object): void {
    // @ts-ignore
    for (let i = 0; i < predicates.title.length; i++) {
      console.log('\n');
      // @ts-ignore
      console.log(predicates.title[i]);
      store
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .match(subject, $rdf.sym(predicates.title[i]))
        .map((q) => q.object)
        .filter((o) => o instanceof Literal)
        // @ts-ignore
        .reduce((previousValue: Literal, currentValue: Literal) => {
          if (previousValue !== currentValue) {
            console.log(currentValue.language + ': ' + currentValue.value);
          }
          return currentValue;
        });
    }
  }
}

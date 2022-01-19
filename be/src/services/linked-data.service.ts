import {Entity} from '../models/dbo.models';
import {HOST, MIME_TYPE_TURTLE, PROPERTY_MAPPING_CONFIG} from '../models/constants';
import {NextFunction} from 'express';
import {UtilService} from './util.service';
import Store from 'rdflib/lib/store';
import $rdf = require('rdflib');

class LinkedDataService {
  public readonly entityDbo2LinkedData = (e: Entity, mimeType: string, next: NextFunction): string => {
    if(MIME_TYPE_TURTLE === mimeType) {
      return this.entityDbo2Turtle(e);
    } else {
      UtilService.throwNotAcceptable(mimeType, next);
    }
  };

  private readonly entityDbo2Turtle = (e: Entity): string => {
    const store: Store = $rdf.graph();
    const base = $rdf.Namespace(`https://${HOST}/kb/`);
    const prefix = $rdf.Namespace(PROPERTY_MAPPING_CONFIG.entity.prefixUrl);

    const mapping = PROPERTY_MAPPING_CONFIG.entity.properties;
    Object.keys(mapping).forEach((key: string) => {
      // @ts-ignore
      store.add(base(`${e._id.toHexString()}`), prefix(`${mapping[key]}`), `${e[key]}`);
    });

    let turtle: string;
    // @ts-ignore
    $rdf.serialize(undefined, store, `https://${HOST}/kb/`, MIME_TYPE_TURTLE, (err, data) => turtle = data);
    console.log(turtle);
    return turtle;
  };
}

export const linkedDataServiceInstance = new LinkedDataService();

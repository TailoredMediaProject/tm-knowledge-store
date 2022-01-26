import {Entity} from '../models/dbo.models';
import {HOST, PROPERTY_MAPPING_CONFIG} from '../models/constants';
import Store from 'rdflib/lib/store';
import $rdf = require('rdflib');

class LinkedDataService {
  /** Creates a string RDF from the entity argument.
   * @param e is the entity from which the RDF will be created
   * @param mimeType of the RDF to create, must already be validated.
   * @param next is a function to submit errors.
   * @return The RDF created from the entity as string.
   */
  public readonly entityDbo2LinkedData = (e: Entity, mimeType: string): string => {
    const store: Store = $rdf.graph();
    const base = $rdf.Namespace(`https://${HOST}/kb/`);
    const prefix = $rdf.Namespace(PROPERTY_MAPPING_CONFIG.entity.prefixUrl);

    const mapping = PROPERTY_MAPPING_CONFIG.entity.properties;
    Object.keys(mapping).forEach((key: string) => {
      // @ts-ignore
      store.add(base(`${e._id.toHexString()}`), prefix(`${mapping[key]}`), `${e[key]}`);
    });

    let rdf: string = undefined;
    // @ts-ignore
    $rdf.serialize(
      undefined,
      store,
      `https://${HOST}/kb/`,
      mimeType,
      (error: Error, data: string|undefined) => {
        if(!!error) {
          throw new Error(error.message);
        } else {
          rdf = data;
        }
      }
    );
    return rdf;
  };
}

export const linkedDataServiceInstance = new LinkedDataService();

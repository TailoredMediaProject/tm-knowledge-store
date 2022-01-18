import {Entity} from '../models/dbo.models';
import {DataFactory, Literal, Writer} from 'n3';
import {MIME_TYPE_TURTLE, PROPERTY_MAPPING_CONFIG} from '../models/constants';
import {NextFunction} from 'express';
import {UtilService} from './util.service';

class LinkedDataService {
  public readonly entityDbo2LinkedData = (e: Entity, mimeType: string, next: NextFunction): string => {
    if(MIME_TYPE_TURTLE === mimeType) {
      return this.entityDbo2Turtle(e);
    } else {
      UtilService.throwNotAcceptable(mimeType, next);
    }
  };

  private readonly entityDbo2Turtle = (e: Entity): string => {
    const prefixUrl = PROPERTY_MAPPING_CONFIG.entity.prefixUrl;
    const writer = new Writer({
      format: MIME_TYPE_TURTLE,
      prefixes: {[PROPERTY_MAPPING_CONFIG.entity.prefix]: prefixUrl}
    });

    writer.addQuad(
      DataFactory.namedNode(`${e._id.toHexString()}`),
      DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      DataFactory.namedNode(`${e.type}`)
    );

    const mapping = PROPERTY_MAPPING_CONFIG.entity.properties;
    Object.keys(mapping).forEach((key: string) => {
      writer.addQuad(DataFactory.quad(
        DataFactory.namedNode(`${e._id.toHexString()}`),
        // @ts-ignore
        DataFactory.namedNode(`${prefixUrl}${mapping[key]}`),
        // @ts-ignore
        this.typeTurtleValue(e[key])
      ));
    });

    let rdf: string;
    writer.end((error, result) => rdf = result);
    return rdf;
  };

  private readonly typeTurtleValue = (value: unknown): Literal => value instanceof Date ?
    DataFactory.literal(
      value.toISOString(),
      DataFactory.namedNode('xsd:Date')
    ) : DataFactory.literal(`${value}`);
}

export const linkedDataServiceInstance = new LinkedDataService();

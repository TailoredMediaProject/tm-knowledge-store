import {EntityData, PersonName, Place, ResolveService} from '../models/resolve-service.interface';
import {KnowledgeError} from '../models/knowledge-error.model';
import {StatusCodes} from 'http-status-codes';
import {FetchError} from 'rdflib';
import {Entity} from '../models/dbo.models';

export default class NdbResolveService implements ResolveService {
  private readonly baseUri: string[];

  constructor(baseUri: string[]) {
    this.baseUri = baseUri;
  }

  public readonly accept = (uri: URL): boolean => this.baseUri.some((base: string) => uri.toString().startsWith(base));

  public readonly priority = (): number => 10;

  public readonly resolve = (uri: URL): Promise<unknown> => {
    if (this.accept(uri)) {
      // eslint-disable-next-line no-undef
      if (process.env.NODE_ENV !== 'production') {
        // On local, use mocked NDB REST API
        uri = new URL('http://localhost:3000/vokabel/230109');
      }

      return fetch(uri.toString(), {method: 'GET'})
        .then((res: Response): Promise<string> => res.json())
        .then(this.parse)
        .catch((e: FetchError) => {
          // @ts-ignore
          if (e?.code === 'ENOTFOUND') {
            throw new KnowledgeError(StatusCodes.NOT_FOUND, e?.message);
          } else {
            throw new KnowledgeError(StatusCodes.INTERNAL_SERVER_ERROR, e?.message, e);
          }
        });
    }
    return Promise.reject('URL to resolve is falsy');
  };

  public readonly parse = (responseBody: string): Promise<Entity> => {
    if (!!responseBody) {
      const entity: Entity = {} as Entity;
      let value: never;
      const data: EntityData = {} as EntityData;

      Object.keys(responseBody).forEach((key: string): void => {
        // @ts-ignore
        value = responseBody[key];
        key = key.toLowerCase();

        this.parseType(key, value, entity, data);
        this.parseGeneral(key, value, entity, data);
        this.praseGender(key, value, entity, data);
        this.parseNames(key, value, entity, data);
        this.parseDates(key, value, entity, data);
        this.parsePlaces(key, value, entity, data);
      });

      entity.data = data;

      return Promise.resolve(entity);
    }

    throw new KnowledgeError(StatusCodes.INTERNAL_SERVER_ERROR, 'NDB returned falsy body');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly parseType = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (!!value) {
      if (key === 'personid') {
        entity.type = 'Person';
      } else if (key === 'teilbereich') {
        // @ts-ignore
        entity.type = value.vokabelTeilbereich === 'Ort' ? 'Landmark' : 'Object';
      }
    }
  };

  private readonly parseGeneral = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (!!value) {
      if (key === 'permalink' || key === 'brid') {
        if (!!entity?.sameAs) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          entity.sameAs.push(value);
        } else {
          entity.sameAs = [value];
        }
      }
      // @ts-ignore
      else if (key === 'nationalitaeten' && !!value?.length > 0) {
        if (!!data?.nationalities) {
          // @ts-ignore
          value.foreach((nationalitaet) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            data.nationalities.push(nationalitaet.vokabelName)
          );
        } else {
          // @ts-ignore
          data.nationalities = value.map((nationalitaet) => nationalitaet.vokabelName);
        }
      } else if (key === 'steckbrief') {
        entity.description = value;
        data.description = entity.description;
      } else if (key === 'erlaeuterung') {
        entity.description = value;
        data.description = entity.description;
      } else if (key === 'berufefunktionen') {
        data.professions = value;
      } else if (key === 'akademischertitel' || key === 'ehrentitel') {
        data.title = !!data?.title ? `${data?.title} ${value}` : value;
      }
    }
  };

  private readonly praseGender = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (key === 'geschlecht') {
      // @ts-ignore
      if (!!value?.langName) {
        // @ts-ignore
        data.gender = value.langName;
      } else {
        // @ts-ignore
        data.gender = !!value?.kurzName === 'M' ? 'Männlich' : 'Weiblich';
      }
    }
  };

  private readonly parseNames = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (key === 'namen') {
      // @ts-ignore
      const namen: any[] = value;

      if (!!namen) {
        namen
          // @ts-ignore
          .filter((name: unknown) => !!name?.istHauptname)
          .forEach((name: unknown): void => {
            const personName: PersonName = {} as PersonName;

            // @ts-ignore
            personName.forename = name?.vorname;
            // @ts-ignore
            personName.surname = name?.name;
            // @ts-ignore
            data.name = this.isNameSet(personName) ? personName : undefined;
          });

        // @ts-ignore
        namen
          // @ts-ignore
          .filter((name: unknown) => !name?.istHauptname)
          .forEach((name: unknown): void => {
            const personName: PersonName = {} as PersonName;
            // @ts-ignore
            personName.forename = name?.vorname;
            // @ts-ignore
            personName.surname = name?.name;

            if (!data?.alternativeNames) {
              data.alternativeNames = [];
            }

            if (this.isNameSet(personName)) {
              data.alternativeNames.push(personName);
            }
          });

        // @ts-ignore
        entity.label = this.isNameSet(data.name)
          ? // @ts-ignore
            `${data.name.forename}${!!data?.name?.forename ? ' ' : ''}${data.name.surname}`
          : undefined;
      }
    } else if (key === 'vokabelnamen') {
      // @ts-ignore
      value.forEach((name) => {
        if (name.istHauptname) {
          data.name = entity.label = name.vokabelName;
        } else if (!!name?.vokabelName && (name?.vokabelNameTyp?.langName !== 'Deskriptor' || !name?.istHauptname)) {
          if (!entity?.label) {
            entity.label = name.vokabelName;
          }

          if (!data?.alternativeNames) {
            data.alternativeNames = [];
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          data.alternativeNames.push(name.vokabelName);
        }
      });
    }
  };

  private readonly parseDates = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (key === 'beginndatum') {
      // @ts-ignore
      data.birthday = Date.parse(`${value.jahr}-${value.monat}-${value.tag}`);
    } else if (key === 'endedatum') {
      // @ts-ignore
      data.deathday = Date.parse(`${value.jahr}-${value.monat}-${value.tag}`);
    }
  };

  private readonly parsePlaces = (key: string, value: never, entity: Entity, data: EntityData): void => {
    if (key === 'beginnort') {
      this.createPlace('birthPlace', data);
      if (!data?.birthPlace?.name) {
        data.birthPlace.name = value;
      }
    } else if (key === 'beginnortvokabel') {
      this.createPlace('birthPlace', data);
      if (!data?.birthPlace?.name) {
        // @ts-ignore
        data.birthPlace.name = value.vokabelName;
      }
    } else if (key === 'beginnland') {
      this.createPlace('birthPlace', data);
      // @ts-ignore
      data.birthPlace.country = value.vokabelName;
    } else if (key === 'endeort') {
      this.createPlace('deathPlace', data);
      if (!data?.deathPlace?.name) {
        data.deathPlace.name = value;
      }
    } else if (key === 'endeortvokabel') {
      this.createPlace('deathPlace', data);
      if (!data?.deathPlace?.name) {
        // @ts-ignore
        data.deathPlace.name = value.vokabelName;
      }
    } else if (key === 'endeland') {
      this.createPlace('deathPlace', data);
      // @ts-ignore
      data.deathPlace.country = value.vokabelName;
    }
  };

  private readonly createPlace = (name: 'birthPlace' | 'deathPlace', data: EntityData): void => {
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty(name)) {
      data[name] = {
        name: undefined,
        country: undefined
      } as Place;
    }
  };

  private readonly isNameSet = (personName: PersonName): boolean => !!personName?.forename || !!personName?.surname;
}

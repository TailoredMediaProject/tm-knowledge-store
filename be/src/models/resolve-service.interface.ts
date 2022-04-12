export interface ResolveService {
  /**
   * @param uri to check for acceptance.
   * @return True if the service can resolve the argument, false otherwise. */
  accept(uri: URL): boolean;
  /** Resolve the provided uri
   * @return The resolved object as a promise.*/
  resolve(uri: URL): Promise<unknown>;
  /**@return The priority of the service as number where the priority is equal to the numeric value.*/
  priority(): number;
}

export interface PersonName {
  forename: string;
  surname: string;
}

export interface Place {
  name: string;
  country: string;
}

export interface EntityData {
  title: string;
  name: PersonName | string;
  alternativeNames: PersonName[];
  description: string;
  gender: string;
  birthday: Date;
  deathday: Date;
  birthPlace: Place;
  deathPlace: Place;
  professions: string[];
  nationalities: string[];
}

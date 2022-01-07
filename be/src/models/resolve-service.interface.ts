import KnowledgeResolveService from '../services/knowledge-resolve.service';

export interface ResolveService {
  /**
   * @param url to check for acceptance.
   * @return True if the service can resolve the argument, false otherwise. */
  accept(url: URL): boolean;
  /** Uses the accepted uri for resolving it.
   * @return The resolved object as a promise.*/
  resolve(): Promise<unknown>;
  /**@return The priority of the service as number where the priority is equal to the numeric value.*/
  priority(): number;
}

export type AnyResolveService = KnowledgeResolveService | ResolveService;

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

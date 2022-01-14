export class ServiceError extends Error {
  constructor(
    public readonly type: ServiceErrorType,
    public readonly message: string,
    public readonly data?: unknown) {
    super(message);
  }
}

export class ServiceErrorFactory {
  public static readonly notFound = (message: string): Promise<ServiceError> =>
    Promise.reject(new ServiceError(ServiceErrorType.NOT_FOUND, message));

  public static readonly invalidQueryValue = (message: string): Promise<ServiceError> =>
    Promise.reject(new ServiceError(ServiceErrorType.INVALID_QUERY_VALUE, message));

  public static readonly preconditionFailed = (message: string, data?: unknown): Promise<ServiceError> =>
    Promise.reject(new ServiceError(ServiceErrorType.PRECONDITION_FAILED, message, data));
}

export enum ServiceErrorType {
  INVALID_QUERY_VALUE,
  NOT_FOUND,
  CONFLICT,
  PRECONDITION_FAILED
}

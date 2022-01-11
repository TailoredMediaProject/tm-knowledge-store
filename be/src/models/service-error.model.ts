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

  public static readonly badRequest = (message: string): Promise<ServiceError> =>
    Promise.reject(new ServiceError(ServiceErrorType.BAD_REQUEST, message));

  public static readonly preconditionFailed = (message: string, data?: unknown): Promise<ServiceError> =>
    Promise.reject(new ServiceError(ServiceErrorType.PRECONDITION_FAILED, message, data));
}

export enum ServiceErrorType {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  PRECONDITION_FAILED = 412
}

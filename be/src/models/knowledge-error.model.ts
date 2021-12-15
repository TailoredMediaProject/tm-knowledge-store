export class KnowledgeError extends Error {
  constructor(public readonly statusCode: number, public readonly title: string, public readonly message: string) {
    super(message);
  }
}

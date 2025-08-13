export class NotFoundError extends Error {
  message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }

  jsonResponse() {
    return {
      code: 404,
      error: this.message,
    };
  }
}

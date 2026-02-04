export class AppError extends Error {
  originalError: unknown;

  constructor(message: string = "", innerError: unknown = null) {
    super(AppError.buildMessage(message, innerError));
    this.name = "AppError";
    this.originalError = innerError;

    if (innerError instanceof Error) {
      this.name = innerError.name;
      this.stack = innerError.stack;
    }
  }

  private static buildMessage(message: string, innerError: unknown): string {
    if (innerError instanceof Error) {
      return `${message}. Inner error: ${innerError.message}`;
    }
    if (typeof innerError === "string") {
      return `${message}: ${innerError}`;
    }
    return message;
  }
}


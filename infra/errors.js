export class InternalServerError extends Error {
  constructor({ cause }) {
    super("An unexpected error occurred on server side.", { cause });
    this.name = "InternalServerError";
    this.action = "Cry harder later.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

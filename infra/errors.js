class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("An unexpected error occurred on server side.", { cause });
    this.name = "InternalServerError";
    this.action =
      "Contact support via email <kelvin@deploya.dev.br> if the problem persists.";
    this.statusCode = statusCode || 500;
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

class MethodNotAllowedError extends Error {
  constructor() {
    super("Method not allowed for this endpoint.");
    this.name = "MethodNotAllowed";
    this.action = "Call a valid endpoint with a supported HTTP method.";
    this.statusCode = 405;
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

class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service unavailable at the moment.", { cause });
    this.name = "ServiceError";
    this.action = "Check if the service is available.";
    this.statusCode = 503;
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

class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Validation error.", { cause });
    this.name = "ValidationError";
    this.action =
      action || "Check the error message and fix the input data accordingly.";
    this.statusCode = 400;
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

class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Unauthorized.", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Check your credentials and try again.";
    this.statusCode = 401;
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

class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Resource not found.", { cause });
    this.name = "NotFoundError";
    this.action = action || "Check the resource identifier and try again.";
    this.statusCode = 404;
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

export {
  InternalServerError,
  MethodNotAllowedError,
  ServiceError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
};

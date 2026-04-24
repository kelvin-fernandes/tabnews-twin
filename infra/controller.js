import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "infra/errors.js";

function onNoMatchHandler(request, response) {
  const errorResponse = new MethodNotAllowedError();
  response.status(errorResponse.statusCode).json(errorResponse);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const errorResponse = new InternalServerError({
    cause: error,
  });
  console.error(errorResponse);
  response.status(errorResponse.statusCode).json(errorResponse);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;

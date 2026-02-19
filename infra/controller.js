import { MethodNotAllowedError, InternalServerError, ValidationError } from "infra/errors.js";

function onNoMatchHandler(request, response) {
  const errorResponse = new MethodNotAllowedError();
  response.status(errorResponse.statusCode).json(errorResponse);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

  const errorResponse = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
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

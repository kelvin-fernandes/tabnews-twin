import { MethodNotAllowedError, InternalServerError } from "infra/errors.js";

function onNoMatchHandler(request, response) {
  const errorResponse = new MethodNotAllowedError();
  response.status(errorResponse.statusCode).json(errorResponse);
}

function onErrorHandler(error, request, response) {
  const errorResponse = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  response.status(errorResponse.statusCode).json(errorResponse);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;

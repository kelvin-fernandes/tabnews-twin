import * as cookie from "cookie";
import session from "models/session.js";
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
  if (error instanceof UnauthorizedError) {
    controller.clearSessionCookie(response);
  }

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

function setSessionCookie(response, sessionToken) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

function setNoStoreCacheControl(response) {
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  setNoStoreCacheControl,
};

export default controller;

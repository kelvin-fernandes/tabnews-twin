import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;

  var user = await authentication.validateCredentials({ email, password });

  var sessionCreated = await session.create(user.id);

  await controller.setSessionCookie(response, sessionCreated.token);

  return response.status(201).json(sessionCreated);
}

async function deleteHandler(request, response) {
  const token = request.cookies.session_id;

  const validSession = await session.findValidSessionToken(token);
  await session.invalidate(validSession.id);
  controller.clearSessionCookie(response);

  return response.status(204).send();
}

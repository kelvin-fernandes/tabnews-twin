import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const token = request.cookies.session_id;

  const validSession = await session.findValidSessionToken(token);
  const renewedSession = await session.renew(validSession.id);
  controller.setSessionCookie(response, renewedSession.token);
  controller.setNoStoreCacheControl(response);

  const userFromSession = await user.findOneById(validSession.user_id);

  return response.status(200).json(userFromSession);
}

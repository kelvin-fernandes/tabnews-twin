import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const usernameInput = request.query.username;

  var userResponse = await user.findOneByUsername(usernameInput);

  return response.status(200).json(userResponse);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  var userResponse = await user.update(username, userInputValues);

  return response.status(200).json(userResponse);
}

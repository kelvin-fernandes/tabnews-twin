import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputData = request.body;

  var newUser = await user.create(userInputData);

  const newActivationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, newActivationToken);

  return response.status(201).json(newUser);
}

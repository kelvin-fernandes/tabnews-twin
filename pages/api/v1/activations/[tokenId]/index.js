import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const tokenId = request.query.tokenId;

  const validActivationToken = await activation.findOneByToken(tokenId);
  const usedActivationToken = await activation.use(validActivationToken);
  await activation.activateUserByUserId(usedActivationToken.user_id);

  return response.status(200).json(usedActivationToken);
}

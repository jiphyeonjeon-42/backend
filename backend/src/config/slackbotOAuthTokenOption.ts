import { z } from 'zod';
import { nonempty } from './envObject';

export const slackbotOAuthTokenSchema = z.object({
  BOT_USER_OAUTH_ACCESS_TOKEN: nonempty.optional(),
});

export const getSlackbotOAuthToken = (processEnv: NodeJS.ProcessEnv) => {
  const { BOT_USER_OAUTH_ACCESS_TOKEN: token } = slackbotOAuthTokenSchema.parse(processEnv);

  return token;
};

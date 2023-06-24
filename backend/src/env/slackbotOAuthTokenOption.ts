import { envObject } from './envObject';

export const slackbotOAuthTokenSchema = envObject('BOT_USER_OAUTH_ACCESS_TOKEN');

export const getSlackbotOAuthToken = (processEnv: NodeJS.ProcessEnv) => {
  const { BOT_USER_OAUTH_ACCESS_TOKEN: token } = slackbotOAuthTokenSchema.parse(processEnv);

  return token;
};

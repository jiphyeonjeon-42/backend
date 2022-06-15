import { searchAuthenticatedUser, updateSlackIdUser } from '../slack/slack.service';
import * as models from '../users/users.model';

const { WebClient } = require('@slack/web-api');

// Read a token from the environment variables
const token = process.env.BOT_USER_OAUTH_ACCESS_TOKEN;

// Initialize
const web = new WebClient(token);
const userMap = new Map();

const updateSlackID = async () : Promise<void> => {
  let searchUsers: any[] = [];
  let cursor;
  const authenticatedUser : models.User[] = await searchAuthenticatedUser();
  if (authenticatedUser.length === 0) return;
  while (cursor === undefined || cursor !== '') {
    const response = await web.users.list({ cursor, limit: 1000 }) as any;
    searchUsers = searchUsers.concat(response.members);
    cursor = response.response_metadata.next_cursor;
  }
  searchUsers.forEach((user) => {
    const { real_name } = user.profile;
    const slackUserId = user.id;
    userMap.set(real_name, slackUserId);
  });
  authenticatedUser.forEach((user) => {
    if (userMap.has(user.nickname)) updateSlackIdUser(user.id, userMap.get(user.nickname));
  });
};

const findUser = (intraName: any) => (userMap.get(intraName));

const publishMessage = async (slackId: string, msg: string) => {
  await web.chat.postMessage({
    token,
    channel: slackId,
    text: msg,
  });
};

export default { updateSlackID, findUser, publishMessage };

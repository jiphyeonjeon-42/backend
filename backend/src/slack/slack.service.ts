import { WebClient } from '@slack/web-api';
import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '../mysql';
import * as models from '../users/users.model';
import { searchUserById } from '../users/users.service';
import { logger } from '../utils/logger';

export const updateSlackIdUser = async (id: number, slackId: string) : Promise<number> => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE user
    SET slack = ?
    WHERE id = ?
  `, [slackId, id]);
  return result.affectedRows;
};

export const searchAuthenticatedUser = async () : Promise<models.User[]> => {
  const result : models.User[] = await executeQuery(`
    SELECT *
    FROM user
    WHERE intraId IS NOT NULL AND (slack IS NULL OR slack = '')
  `);
  return result;
};

// Read a token from the environment variables
const token = process.env.BOT_USER_OAUTH_ACCESS_TOKEN;

// Initialize
const web = new WebClient(token);
const userMap = new Map();

export const updateSlackId = async (): Promise<void> => {
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
    const { real_name: realName } = user.profile;
    const slackUserId = user.id;
    userMap.set(realName.toLowerCase(), slackUserId);
  });
  authenticatedUser.forEach((user) => {
    if (userMap.has(user.nickname.toLowerCase())) {
      updateSlackIdUser(user.id, userMap.get(user.nickname.toLowerCase()));
    }
  });
};

export const updateSlackIdByUserId = async (userId: number): Promise<void> => {
  const { items: userInfo } = await searchUserById(userId);
  if (userInfo[0] && userMap.has(userInfo[0].nickname)) {
    updateSlackIdUser(userInfo[0].id, userMap.get(userInfo[0].nickname));
  }
};

export const findUser = (intraName: any) => (userMap.get(intraName));

export const publishMessage = async (slackId: string, msg: string) => {
  await web.chat.postMessage({
    token,
    channel: slackId,
    text: msg,
  }).catch((e) => {
    logger.error(e);
  });
};

import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '../mysql';
import { role } from './auth.type';
import * as models from '../users/users.model';

export const updateAuthenticationUser = async (
  id: number,
  intraId: number,
  nickName: string,
) : Promise<number> => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE USER
    SET intraId = ?, nickName = ?, role = ?
    WHERE id = ?
  `, [intraId, nickName, role.cadet, id]);
  return result.affectedRows;
};

export const updateSlackIDUser = async (id: number, slackID: string) : Promise<number> => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE USER
    SET slack = ?
    WHERE id = ?
  `, [slackID, id]);
  return result.affectedRows;
};

export const searchAuthenticatedUser = async () : Promise<models.User[]> => {
  const result : models.User[] = await executeQuery(`
    SELECT *
    FROM USER
    WHERE intraId IS NOT NULL AND (slack IS NULL OR slack = '')
  `);
  return result;
};

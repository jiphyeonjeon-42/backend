import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '../mysql';
import { role } from './auth.type';

// eslint-disable-next-line import/prefer-default-export
export const updateAuthenticationUser = async (
  id: number,
  intraId: number,
  nickname: string,
) : Promise<number> => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE user
    SET intraId = ?, nickname = ?, role = ?
    WHERE id = ?
  `, [intraId, nickname, role.cadet, id]);
  return result.affectedRows;
};

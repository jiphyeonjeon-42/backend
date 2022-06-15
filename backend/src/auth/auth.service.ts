import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '../mysql';
import { role } from './auth.type';

export const updateAuthenticationUser = async (
  id: number,
  intraId: number,
  nickname: string,
) : Promise<number> => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE USER
    SET intraId = ?, nickname = ?, role = ?
    WHERE id = ?
  `, [intraId, nickname, role.cadet, id]);
  return result.affectedRows;
};

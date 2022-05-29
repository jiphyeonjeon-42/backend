import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '../mysql';
import { role } from './auth.type';

export const updateAuthenticationUser = async (id: number, intraId: number, nickName: string) => {
  const result : ResultSetHeader = await executeQuery(`
    UPDATE USER
    SET intraId = ?, nickName = ?, role = ?
    WHERE id = ?
  `, [intraId, nickName, role.cadet, id]);
  return result.affectedRows;
};

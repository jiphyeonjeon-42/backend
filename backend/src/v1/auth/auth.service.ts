import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '~/mysql';
import axios from 'axios';
import { role } from './auth.type';
import ErrorResponse from '../utils/error/errorResponse';
import httpStatus from 'http-status';

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

export const getAccessToken = async (): Promise<string> => {
  const tokenURL = 'https://api.intra.42.fr/oauth/token';
  const queryString = {
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URL,
  };
  let accessToken: string = '';
  await axios(tokenURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: queryString,
  }).then((response) => {
    accessToken = response.data.access_token;
  }).catch((error) => {
    throw new ErrorResponse(httpStatus[500], httpStatus.INTERNAL_SERVER_ERROR, '42 API로부터 토큰을 받아오는데 실패했습니다.');
  });
  return accessToken;
};

import { ResultSetHeader } from 'mysql2';
import { executeQuery } from '~/mysql';
import axios from 'axios';
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
    console.log(error.message);
  });
  return accessToken;
};

import { executeQuery } from '../mysql';
import * as models from './users.model';
import * as types from './users.type';

export const searchLendingByIntraId = async (intraId: number) => {
  const items = await executeQuery(`
    SELECT
    l.userId as userId, bi.title as title, DATE_ADD(l.updatedAt, INTERVAL 14 DAY) as duedate
    FROM lending as l
    LEFT JOIN book as b
    on l.bookId = b.id
    LEFT JOIN book_info as bi
    on b.infoid = bi.id
    where l.returnedAt is null AND userId = ?;
  `, [intraId]) as models.Lending[];
  return { items };
};

export const getLendingFromUser = async (items: models.User[]) => {
  if (items) {
    items.map((user) => {
      const lendingPromise = searchLendingByIntraId(user.intraId);
      const newUserObj:models.User = Object.assign(user);
      lendingPromise.then((res) => { newUserObj.lendings = res.items; });
      return newUserObj;
    });
    return items;
  }
};

export const searchUserByNickName = async (nickName: string, limit: number, page: number) => {
  const items = (await executeQuery(`
    SELECT 
    SQL_CALC_FOUND_ROWS
    *
    FROM user
    WHERE nickName LIKE ?
    LIMIT ?
    OFFSET ?;
  `, [`%${nickName}%`, limit, limit * page])) as models.User[];
  const total = (await executeQuery(`
  SELECT FOUND_ROWS() as totalItems;
  `));
  const meta: types.Meta = {
    totalItems: total[0].totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total[0].totalItems / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const searchUserById = async (id: number) => {
  const items = (await executeQuery(`
    SELECT 
    *
    FROM user
    WHERE id=?;
  `, [id])) as models.User[];
  return { items };
};

export const searchUserByEmail = async (email: string) => {
  const items = (await executeQuery(`
    SELECT 
    *
    FROM user
    WHERE email LIKE ?;
  `, [email])) as models.User[];
  return { items };
};

export const searchUserByIntraId = async (intraId: number) => {
  const result = (await executeQuery(`
    SELECT *
    FROM user
    WHERE
      intraId = ?
  `, [intraId])) as models.User[];
  return result;
};

export const searchAllUsers = async (limit: number, page: number) => {
  const items = (await executeQuery(`
    SELECT
    SQL_CALC_FOUND_ROWS
    *
    FROM user
    LIMIT ?
    OFFSET ?;
  `, [limit, limit * page])) as models.User[];
  const total = (await executeQuery(`
  SELECT FOUND_ROWS() as totalItems;
  `));
  const meta: types.Meta = {
    totalItems: total[0].totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total[0].totalItems / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const createUser = async (email: string, password: string) => {
  await executeQuery(`
    INSERT INTO user(
      email, password, nickName
    )
    VALUES (
      ?, ?, ?
    );
  `, [email, password, '']);
  return null;
};

export const updateUserEmail = async (id: number, email:string) => {
  await executeQuery(`
  UPDATE user 
  SET email = ?
  WHERE id = ?;
  `, [email, id]);
};

export const updateUserPassword = async (id: number, password: string) => {
  await executeQuery(`
  UPDATE user
  SET password = ? 
  WHERE id = ?;
  `, [password, id]);
};

export const updateUserAuth = async (
  id: number,
  nickname: string,
  intraId: number,
  slack: string,
  role: number,
) => {
  await executeQuery(`
  UPDATE user 
  SET 
  nickname=?,
  intraId=?, 
  slack=?,
  role=? 
  WHERE id=?;
  `, [nickname, intraId, slack, role, id]);
};

// 없어질 함수입니다. 다른 함수로 바꾸세요 searchUsersById 추천
export const identifyUserById = async (id: number): Promise<models.User> => {
  const result = (await executeQuery(`
    SELECT *
      FROM user
    WHERE
      id = ?
    LIMIT 1;
  `, [id])) as models.User[];
  return result[0];
};
// export const searchByLogin = async (login: string, page: number, limit: number) => {};

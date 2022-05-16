/* eslint no-console: "off" */
import { FtTypes } from '../auth/auth.service';
import { pool } from '../mysql';
import * as UsersService from './users.service';

describe('UsersService', () => {
  afterAll(() => {
    pool.end();
  });

  // searchUserByNickName
  it('[searchUserByNickName] User jimin is', async () => {
    expect(await UsersService.searchUserByNickName('jimin', 5, 0)).toStrictEqual({
      items: [
        {
          id: 14,
          email: '',
          password: '',
          nickName: 'jimin',
          intraId: 99994,
          slack: 'U02LNNDRC9F',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 1,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
        },
      ],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 5,
        totalPages: 1,
        currentPage: 1,
      },
    });
  });

  // searchUserById
  it('[searchUserById] User id 14 (jimin) is', async () => {
    expect(await UsersService.searchUserById(14)).toStrictEqual(
      [{
        id: 14,
        email: '',
        password: '',
        nickName: 'jimin',
        intraId: 99994,
        slack: 'U02LNNDRC9F',
        penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
        role: 1,
        createdAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
        updatedAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
      }],
    );
  });

  // searchUserByIntraId
  it('[searchUserByIntraId] User intraId 99994 (jimin) is', async () => {
    expect(await UsersService.searchUserByIntraId(99994)).toStrictEqual(
      [{
        id: 14,
        email: '',
        password: '',
        nickName: 'jimin',
        intraId: 99994,
        slack: 'U02LNNDRC9F',
        penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
        role: 1,
        createdAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
        updatedAt: new Date(Date.parse('2021-12-07 20:06:18.991237')),
      }],
    );
  });

  // searchAllUsers
  it('[searchAllUsers] 5 Users in page 1 are', async () => {
    expect(await UsersService.searchAllUsers(5, 1)).toStrictEqual({
      items: [
        {
          id: 6,
          email: '',
          password: '',
          nickName: 'donghyun',
          intraId: 100015,
          slack: 'U02LCAZBTL4',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 0,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.973689')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.973689')),
        },
        {
          id: 7,
          email: '',
          password: '',
          nickName: 'ymoon',
          intraId: 100013,
          slack: 'U02LCAYAFCL',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 0,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.975733')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.975733')),
        },
        {
          id: 8,
          email: '',
          password: '',
          nickName: 'yeocho',
          intraId: 100011,
          slack: 'U02LEJRST6J',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 0,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.977874')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.977874')),
        },
        {
          id: 9,
          email: '',
          password: '',
          nickName: 'sumjang',
          intraId: 100009,
          slack: 'U02KVE2D2BZ',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 0,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.980172')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.980172')),
        },
        {
          id: 10,
          email: '',
          password: '',
          nickName: 'jaewchoi',
          intraId: 100004,
          slack: 'U02LZQMD63A',
          penaltyEndDay: new Date(Date.parse('2021-12-07 20:06:18')),
          role: 0,
          createdAt: new Date(Date.parse('2021-12-07 20:06:18.983446')),
          updatedAt: new Date(Date.parse('2021-12-07 20:06:18.983446')),
        },
      ],
      meta: {
        totalItems: 1385,
        itemCount: 5,
        itemsPerPage: 5,
        totalPages: 277,
        currentPage: 2,
      },
    });
  });

  // it('User is created and deleted', async () => {
  //   const ftUserInfo: FtTypes = {
  //     intra: 44444,
  //     login: 'test',
  //     imageURL: 'http://localhost:3000/img',
  //   };
  //   expect(await UsersService.deleteUserByIntra(ftUserInfo.intra)).toBe(false);
  //   expect(await UsersService.createUser(ftUserInfo)).toEqual(
  //     expect.objectContaining({
  //       login: 'test',
  //       intra: 44444,
  //       slack: '0',
  //       librarian: 0,
  //       imageURL: 'http://localhost:3000/img',
  //     }),
  //   );
  //   expect(await UsersService.deleteUserByIntra(ftUserInfo.intra)).toBe(true);
  // });
});

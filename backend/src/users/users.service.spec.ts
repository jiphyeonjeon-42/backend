/* eslint no-console: "off" */
import { FtTypes } from '../auth/auth.service';
import { pool } from '../mysql';
import * as UsersService from './users.service';

describe('UsersService', () => {
  afterAll(() => {
    pool.end();
  });

  it('User jimin is', async () => {
    expect(await UsersService.searchUserByIntraId('jimin', 5, 0)).toStrictEqual({
      items: [
        {
          id: 14,
          login: 'jimin',
          intra: 99994,
          slack: 'U02LNNDRC9F',
          penaltyAt: new Date(Date.parse('2021-12-07 20:06:18')),
          librarian: 1,
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

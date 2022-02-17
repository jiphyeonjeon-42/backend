/* eslint no-console: "off" */
import * as UsersService from '../users/users.service';

describe('UsersService', () => {
  it('User 3 is', async () => {
    expect(await UsersService.identifyUserById(3)).toStrictEqual({
      id: 3,
      login: 'kyolee',
      intra: 100020,
      slack: 'U02L74YHTLM',
      penaltyAt: new Date(Date.parse('2021-12-07T11:06:18.000Z')),
      librarian: 0,
      createdAt: new Date(Date.parse('2021-12-07T11:06:18.967Z')),
      updatedAt: new Date(Date.parse('2021-12-07T11:06:18.967Z')),
    });
  });

  // Unique key contraint 때문에 테스트하지 않음.
  // it('User is created', async () => {
  //   const ftUserInfo: FtTypes = {
  //     intra: 44444,
  //     login: 'test',
  //     imageURL: 'http://localhost:3000/img',
  //   };
  //   expect(await UsersService.createUser(ftUserInfo)).toBe({
  //     id: 1395,
  //     login: 'test',
  //     intra: 44444,
  //     slack: '0',
  //     librarian: 0,
  //     imageURL: 'http://localhost:3000/img',
  //   });
  // });
});

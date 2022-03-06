/* eslint no-console: "off" */
import { FtTypes } from '../auth/auth.service';
import * as UsersService from './users.service';

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

  it('User is created and deleted', async () => {
    const ftUserInfo: FtTypes = {
      intra: 44444,
      login: 'test',
      imageURL: 'http://localhost:3000/img',
    };
    expect(await UsersService.createUser(ftUserInfo)).toEqual(
      expect.objectContaining({
        login: 'test',
        intra: 44444,
        slack: '0',
        librarian: 0,
        imageURL: 'http://localhost:3000/img',
      }),
    );
    expect(await UsersService.deleteUserByIntra(ftUserInfo.intra)).toBe(true);
  });
});

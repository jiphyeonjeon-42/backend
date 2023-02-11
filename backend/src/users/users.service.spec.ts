/* eslint no-console: "off" */
import { pool } from '../mysql';
import * as UsersService from './users.service';

describe('UsersService', () => {
  afterAll(() => {
    pool.end();
  });

  // searchUserByNickName
  it('[searchUserByNickName] User hihi is', async () => {
    expect(await UsersService.searchUserByNickName('seongyle3', 5, 0)).toStrictEqual({
      items: [
        {
          id: 1410,
          email: 'example_role_1_3@gmail.com',
          password: '1234',
          nickname: 'seongyle3',
          intraId: 3,
          slack: null,
          penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
          role: 1,
          createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
          updatedAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
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
  it('[searchUserById] User id 1414 (hihi) is', async () => {
    expect(await UsersService.searchUserById(1414)).toStrictEqual(
      {
        items: [
          {
            id: 1414,
            email: 'example_role1_7@gmail.com',
            password: '4444',
            nickname: 'hihi',
            intraId: 44,
            slack: 'dasdwqwe1132',
            penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
            role: 1,
            createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
            updatedAt: new Date(Date.parse('2022-05-20 16:13:39.314069')),
          },
        ],
      },
    );
  });

  // searchUserByIntraId
  it('[searchUserByIntraId] User intraId 44 (hihi) is', async () => {
    expect(await UsersService.searchUserByIntraId(44)).toStrictEqual(
      [
        {
          id: 1414,
          email: 'example_role1_7@gmail.com',
          password: '4444',
          nickname: 'hihi',
          intraId: 44,
          slack: 'dasdwqwe1132',
          penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
          role: 1,
          createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
          updatedAt: new Date(Date.parse('2022-05-20 16:13:39.314069')),
        },
      ],
    );
  });

  // searchAllUsers
  it('[searchAllUsers] 3 Users in page 6 are', async () => {
    expect(await UsersService.searchAllUsers(3, 6)).toStrictEqual({
      items: [
        {
          id: 1410,
          email: 'example_role_1_3@gmail.com',
          password: '1234',
          nickname: 'seongyle3',
          intraId: 3,
          slack: null,
          penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
          role: 1,
          createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
          updatedAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
        },
        {
          id: 1411,
          email: 'example_role1_4@gmail.com',
          password: '1234',
          nickname: 'seongyle4',
          intraId: 4,
          slack: null,
          penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
          role: 1,
          createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
          updatedAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
        },
        {
          id: 1412,
          email: 'example_role_1_5@gmail.com',
          password: '1234',
          nickname: 'seongyle5',
          intraId: 5,
          slack: null,
          penaltyEndDay: new Date(Date.parse('2022-05-20 07:02:34')),
          role: 1,
          createdAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
          updatedAt: new Date(Date.parse('2022-05-20 07:02:34.973193')),
        },
      ],
      meta: {
        totalItems: 55,
        itemCount: 3,
        itemsPerPage: 3,
        totalPages: 19,
        currentPage: 7,
      },
    });
  });
});

/* eslint no-console: "off" */
import { QueryRunner } from 'typeorm';
import jipDataSource from '~/app-data-source';
import { connectMode } from '~/config';
import { logger } from '~/logger';
import UsersService from './users.service';

const usersService = new UsersService();

describe('UsersService', () => {
  // typeORM init을 위해 제한시간을 넉넉히 잡는다.
  jest.setTimeout(10 * 1000);
  let queryRunner: QueryRunner;
  beforeAll(async () => {
    await jipDataSource
      .initialize()
      .then(() => {
        logger.info('typeORM INIT SUCCESS');
        logger.info(connectMode);
      })
      .catch((e) => {
        logger.error(`typeORM INIT FAILED : ${e.message}`);
      });
    // 트랜잭션 사전작업
    queryRunner = jipDataSource.createQueryRunner();
    await queryRunner.connect();
  });
  beforeEach(async () => {
    await queryRunner.startTransaction();
  });
  afterEach(async () => {
    await queryRunner.rollbackTransaction();
  });
  afterAll(async () => {
    await queryRunner.release();
  });
  // searchUserByNickName
  it('searchUserBynicknameOrEmail()', async () => {
    expect(await usersService.searchUserBynicknameOrEmail('seongyle3', 5, 0)).toStrictEqual({
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
  it('searchUserById()', async () => {
    expect(await usersService.searchUserById(1414)).toStrictEqual({
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
    });
  });

  // searchUserByIntraId
  it('searchUserByIntraId()', async () => {
    expect(await usersService.searchUserByIntraId(44)).toStrictEqual([
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
    ]);
  });

  // searchAllUsers
  it('searchAllUsers()', async () => {
    expect(await usersService.searchAllUsers(3, 6)).toStrictEqual({
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

import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';

export const history = async () => {
  console.log('get history');
  const histories = [
    {
    bookInfoId: 42,
    renter: 'yena',
    returnAt: null,
    status: 0,
  },
  {
    bookInfoId: 4242,
    renter: 'yena',
    returnAt: '2022-09-24',
    status: 2,
    }];
  return (histories);
};

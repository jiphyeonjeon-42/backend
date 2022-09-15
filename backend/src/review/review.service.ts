import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';
import { publishMessage } from '../slack/slack.service';

export const getReview = async () => {
  console.log('get review');
};

export const updateReview = async () => {
  console.log('update review');
}

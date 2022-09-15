import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';

export const createReview = async (bookInfoId: number, commentText: string) => {
  console.log('create review');
  console.log(`${bookInfoId} ${commentText}`);
}

export const getReview = async () => {
  console.log('get review');
};

export const updateReview = async () => {
  console.log('update review');
}

export const deleteReview = async () => {
  console.log('deleteReview');
}
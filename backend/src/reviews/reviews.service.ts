import * as errorCode from '../utils/error/errorCode';
import { executeQuery, makeExecuteQuery, pool } from '../mysql';
import { Meta } from '../users/users.type';

export const createReviews = async (bookInfoId: number, commentText: string) => {
  console.log('create reviews');
  console.log(`${bookInfoId} ${commentText}`);
};

export const getReviews = async (bookInfoId: string | undefined) => {
  console.log('get reviews');
  console.log(`${bookInfoId}`, typeof(bookInfoId));
  let reviews;
  if (bookInfoId === undefined) {
    reviews = [{
      reviewer: 'seongyle',
      commentText: 'blabla',
      bookInfoId: 42,
    },
      {
        reviewer: 'yena',
        commentText: '42seoul, jiphyeonjeon developer',
        bookInfoId: 41,
      },
    ];
  } else {
    reviews = [{
      reviewer: 'seongyle',
      commentText: 'blabla',
      bookInfoId: 42,
    },
    ];
  }
  return (reviews);
};

export const updateReviews= async () => {
  console.log('update reviews');
};

export const deleteReviews = async (reviewsId: number) => {
  console.log('deleteReviews');
  console.log(`${reviewsId} should be soft deleted`);
};

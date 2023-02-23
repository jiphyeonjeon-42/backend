import * as errorCode from '../../../utils/error/errorCode';
import * as reviewsRepository from '../../repository/reviews.repository';

export const updatePossibleCheck = async (
  reviewsId : number,
) => {
  let result : any;
  let resultId : number;
  try {
    result = await reviewsRepository.getReviews(reviewsId);
    resultId = result[0].userId;
  } catch (error : any) {
    throw new Error(errorCode.NOT_FOUND_REVIEWS);
  }
  if (result[0].disabled === 1) {
    throw new Error(errorCode.DISABLED_REVIEWS);
  }
  return resultId;
};

export const idAndTokenIdSameCheck = (
  id : number,
  tokenId : number,
) => {
  if (id !== tokenId) {
    throw new Error(errorCode.UNAUTHORIZED_REVIEWS);
  }
};

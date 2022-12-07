import * as errorCode from '../../../utils/error/errorCode';
import * as reviewsService from '../../service/reviews.service';

export const contentParseCheck = (
  content : string,
) => {
  const result = content.trim();
  if (result === '' || result.length < 10 || result.length > 420) {
    throw new Error(errorCode.INVALID_INPUT_REVIEWS_CONTENT);
  }
  return result;
};

export const reviewsIdParseCheck = (
  reviewsId : string,
) => {
  if (reviewsId.trim() === '') {
    throw new Error(errorCode.INVALID_INPUT_REVIEWS_ID);
  }
  try {
    return parseInt(reviewsId, 10);
  } catch (error : any) {
    throw new Error(errorCode.INVALID_INPUT_REVIEWS);
  }
};

export const reviewsIdExistCheck = async (
  reviewsId : number,
) => {
  let result : number;
  try {
    result = await reviewsService.getReviewsUserId(reviewsId);
  } catch (error : any) {
    throw new Error(errorCode.NOT_FOUND_REVIEWS);
  }
  return result;
};

export const idAndTokenIdSameCheck = (
  id : number,
  tokenId : number,
) => {
  if (id !== tokenId) {
    throw new Error(errorCode.UNAUTHORIZED_REVIEWS);
  }
};

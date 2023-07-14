import * as errorCode from '../../../utils/error/errorCode';
import ReviewsService from '../../service/reviews.service';
import ErrorResponse from '../../../utils/error/errorResponse';

const reviewsService = new ReviewsService();

export const contentParseCheck = (
  content : string,
) => {
  const result = content.trim();
  if (result === '' || result.length < 10 || result.length > 420) {
    throw new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_CONTENT, 400);
  }
  return result;
};

export const reviewsIdParseCheck = (
  reviewsId : string,
) => {
  if (reviewsId.trim() === '') {
    throw new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS_ID, 400);
  }
  try {
    return parseInt(reviewsId, 10);
  } catch (error : any) {
    throw new ErrorResponse(errorCode.INVALID_INPUT_REVIEWS, 400);
  }
};

export const reviewsIdExistCheck = async (
  reviewsId : number,
) => {
  let result : number;
  try {
    result = await reviewsService.getReviewsUserId(reviewsId);
  } catch (error : any) {
    throw new ErrorResponse(errorCode.NOT_FOUND_REVIEWS, 404);
  }
  return result;
};

export const idAndTokenIdSameCheck = (
  id : number,
  tokenId : number,
) => {
  if (id !== tokenId) {
    throw new ErrorResponse(errorCode.UNAUTHORIZED_REVIEWS, 401);
  }
};

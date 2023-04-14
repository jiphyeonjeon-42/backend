import * as errorCode from '../../../utils/error/errorCode';
import ReviewsRepository from '../../repository/reviews.repository';
import ErrorResponse from "../../../utils/error/errorResponse";

const reviewsRepository = new ReviewsRepository();

export const updatePossibleCheck = async (
  reviewsId : number,
) => {
  let result : any;
  let resultId : number;
  try {
    result = await reviewsRepository.getReviews(reviewsId);
    resultId = result[0].userId;
  } catch (error : any) {
    throw new ErrorResponse(errorCode.NOT_FOUND_REVIEWS, 404);
  }
  if (result[0].disabled === 1) {
    throw new ErrorResponse(errorCode.DISABLED_REVIEWS, 401);
  }
  return resultId;
};

export const idAndTokenIdSameCheck = (
  id : number,
  tokenId : number,
) => {
  if (id !== tokenId) {
    throw new ErrorResponse(errorCode.UNAUTHORIZED_REVIEWS, 401);
  }
};

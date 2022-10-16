import * as errorCode from '../../utils/error/errorCode';
import * as reviewsService from '../reviews.service';

export const contentParseCheck = async (
    content : string,
) => {
    const result = content.trim();
    if (result === '' || result === undefined || result === null || result.trim().length < 10 || result.trim().length > 100) {
        throw new Error(errorCode.INVALID_INPUT_REVIEWS_CONTENT);
    }
    return result;
};

export const reviewsIdParseCheck = async (
    reviewsId : string,
) => {
    let result : number;
    if (reviewsId === '' || reviewsId === undefined || reviewsId === null) {
        throw new Error(errorCode.INVALID_INPUT_REVIEWS_ID);
    }
    try {
        result = parseInt(reviewsId, 10);
    } catch (error : any) {
        throw new Error(errorCode.INVALID_INPUT_REVIEWS);
    }
    return result;
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

export const idAndTokenIdSameCheck = async (
    id : number,
    tokenId : number,
) => {
    if (id !== tokenId) {
        throw new Error(errorCode.UNAUTHORIZED_REVIEWS);
    }
};


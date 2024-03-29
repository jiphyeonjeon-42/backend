import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';

export const bookInfoParseCheck = (bookInfoId: string) => {
  let result: number;
  if (bookInfoId.trim() === '') {
    throw new ErrorResponse(errorCode.INVALID_INPUT, 400);
  }
  try {
    result = parseInt(bookInfoId, 10);
  } catch (error: any) {
    throw new ErrorResponse(errorCode.INVALID_INPUT, 400);
  }
  return result;
};

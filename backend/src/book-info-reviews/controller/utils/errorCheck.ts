import * as errorCode from '../../../utils/error/errorCode';

export const bookInfoParseCheck = (
  bookInfoId : string,
) => {
  let result : number;
  if (bookInfoId.trim() === '') {
    throw new Error(errorCode.INVALID_INPUT);
  }
  try {
    result = parseInt(bookInfoId, 10);
  } catch (error : any) {
    throw new Error(errorCode.INVALID_INPUT);
  }
  return result;
};


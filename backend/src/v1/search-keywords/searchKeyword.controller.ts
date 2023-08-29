/* eslint-disable import/no-unresolved */
import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import * as status from 'http-status';
import { executeQuery } from '~/mysql';
// import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
// import * as parseCheck from '~/v1/utils/parseCheck';
// import * as SearchKeywordervice from './searchKeyword.service';
import * as hangul from 'hangul-js';


const disassembleHangul = (original: string) => {
  if (!original) return null;
  return hangul.d(original).join("");
};

const extractHangulCho = (original: string) => {
  if (!original) return null;
  return hangul
    .d(original, true)
    .map((letter) => letter[0])
    .join("");
};

/**SearchBookInfoQuery
 * TODO search keyword preview
 * 생쿼리를 날려서 확인 필요
 * book.service 와의 연관성 확인 필요
 * 보니까 service에서 query를 날리는 듯 싶다
 */
export const searchKeywordPreview: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  // // URI에 있는 파라미터/쿼리 변수에 저장
  const query = req.query?.query ?? '';
  const {
    keyword
  } = req.query;
  const LIMIT_OF_SEARCH_keyword_PREVIEW = 12;
  
  console.log(`query: ${query}`);
  console.log(`keyword: ${keyword}`);

  // 유효한 인자인지 파악
  if (!keyword) {
    return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
  }

  // keyword 비어 있을때에 대한 처리 필요, 초기화를 잘 할것.
  let keyword_d = extractHangulCho(keyword)
  let isCho = true;
  if (keyword !== keyword_d) {
    keyword_d = disassembleHangul(keyword);
    isCho = false;
  }
  console.log(`keyword_d: ${keyword_d}`);
  let result: any;
  try {
    if (isCho) {
      result = await executeQuery(
        `
        (
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_search_keywords_442
              WHERE MATCH(book_name_cho, author_name_cho, publisher_name_cho) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_search_keywords_442
              WHERE book_name_cho LIKE ('%${keyword_d}%')
                      OR author_name_cho LIKE ('%${keyword_d}%')
                      OR publisher_name_cho LIKE ('%${keyword_d}%')
          )
      )
      LIMIT ${LIMIT_OF_SEARCH_keyword_PREVIEW}
        `,      [keyword_d]
      );
    } else {
      result = await executeQuery(
        `(
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_search_keywords_442
              WHERE MATCH(book_name_jamo, author_name_jamo, publisher_name_jamo) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_search_keywords_442
              WHERE book_name_jamo LIKE ('%${keyword_d}%')
                      OR author_name_jamo LIKE ('%${keyword_d}%')
                      OR publisher_name_jamo LIKE ('%${keyword_d}%')
          )
      )
      LIMIT ${LIMIT_OF_SEARCH_keyword_PREVIEW}
      `,
        [keyword_d]
      );
    }
  } catch (error) {
    return next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }

  return res.status(200).send({
    result: {
      fulltext: { length: result.length },
    },
    fulltext: result,
  });
}

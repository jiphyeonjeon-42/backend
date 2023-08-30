import { NextFunction, Request, Response } from 'express';
import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import * as searchKeywordsService from './searchKeywords.service';

import { executeQuery } from '~/mysql';
import * as hangul from 'hangul-js';

export const getPopularSearchKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const items = await searchKeywordsService.getPopularSearchKeywords();
    return res.status(status.OK).json({ items });
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 300 && errorNumber < 400) {
      return next(new ErrorResponse(error.message, status.BAD_REQUEST));
    }
    if (error.message === 'DB error') {
      return next(
        new ErrorResponse(
          errorCode.QUERY_EXECUTION_FAILED,
          status.INTERNAL_SERVER_ERROR,
        ),
      );
    }
    logger.error(error);
    return next(
      new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR),
    );
  }
};


const disassembleHangul = (original?: string) => {
  if (!original) return null;
  return hangul.d(original).join("");
};

const extractHangulCho = (original?: string) => {
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
export const searchKeywordsAutocomplete: any = async (
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

  // keyword 비어 있을때에 대한 처리 필요, 초기화를 잘 할것. // keyword as string
  let keyword_d = extractHangulCho(keyword as string)
  let isCho = true;
  if (keyword !== keyword_d) {
    keyword_d = disassembleHangul(keyword as string);
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
              FROM book_info_search_keywords
              WHERE MATCH(title_initials, author_initials, publisher_initials) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_info_search_keywords
              WHERE title_initials LIKE ('%${keyword_d}%')
                      OR author_initials LIKE ('%${keyword_d}%')
                      OR publisher_initials LIKE ('%${keyword_d}%')
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
              FROM book_info_search_keywords
              WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_info_search_keywords
              WHERE disassembled_title LIKE ('%${keyword_d}%')
                      OR disassembled_author LIKE ('%${keyword_d}%')
                      OR disassembled_publisher LIKE ('%${keyword_d}%')
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

  return res.status(status.OK).send({
    result: {
      fulltext: { length: result.length },
    },
    fulltext: result,
  });
}

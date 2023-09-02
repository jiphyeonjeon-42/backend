import { NextFunction, Request, Response } from 'express';

import { extractHangulInitials, disassembleHangul } from '~/v1/utils/disassembleKeywords';
import { logger } from '~/logger';
import * as errorCode from '~/v1/utils/error/errorCode';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import * as searchKeywordsService from './searchKeywords.service';

import { executeQuery } from '~/mysql';

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

export const searchKeywordsAutocomplete: any = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    keyword
  } = req.query;
  const LIMIT_OF_SEARCH_keyword_PREVIEW = 12;

  if (!keyword) {
    return res.status(status.OK).send({
      items: [],
      meta: 
        0
    });
  }

  let keyword_d = extractHangulInitials(keyword as string)
  let isCho = true;
  if (keyword !== keyword_d) {
    keyword_d = disassembleHangul(keyword as string);
    isCho = false;
  }

  let result: any = [];
  let totalCount: number;
  try {
    if (isCho) {
      result = await executeQuery(
        `
        (
          SELECT id as book_info_id, title, author, publisher, publishedAt, image
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_info_search_keywords
              WHERE MATCH(title_initials, author_initials, publisher_initials) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id as book_info_id, title, author, publisher, publishedAt, image
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
      totalCount = await executeQuery(
        `SELECT COUNT(*) AS totalCount FROM (
          (
            SELECT id
            FROM book_info
            WHERE id IN (
                SELECT book_info_id
                FROM book_info_search_keywords
                WHERE MATCH(title_initials, author_initials, publisher_initials) AGAINST (? IN BOOLEAN MODE)
            )
        )
        UNION (
            SELECT id
            FROM book_info
            WHERE id IN (
                SELECT book_info_id
                FROM book_info_search_keywords
                WHERE title_initials LIKE ('%${keyword_d}%')
                        OR author_initials LIKE ('%${keyword_d}%')
                        OR publisher_initials LIKE ('%${keyword_d}%')
            )
        )) AS COUNT_SET`,      [keyword_d]
        ).then((result) => {
          return result[0]
        });
    } else {
      result = await executeQuery(
        
        `(
          SELECT id as book_info_id, title, author, publisher, publishedAt, image         
          FROM book_info
          WHERE id IN (
              SELECT book_info_id
              FROM book_info_search_keywords
              WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher) AGAINST (? IN BOOLEAN MODE)
          )
      )
      UNION (
          SELECT id as book_info_id, title, author, publisher, publishedAt, image         
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
        `,      [keyword_d]
      );
      totalCount = await executeQuery(
        `SELECT COUNT(*) AS totalCount FROM (
          (
            SELECT id
            FROM book_info
            WHERE id IN (
                SELECT book_info_id
                FROM book_info_search_keywords
                WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher) AGAINST (? IN BOOLEAN MODE)
            )
        )
        UNION (
            SELECT id
            FROM book_info
            WHERE id IN (
                SELECT book_info_id
                FROM book_info_search_keywords
                WHERE disassembled_title LIKE ('%${keyword_d}%')
                        OR disassembled_author LIKE ('%${keyword_d}%')
                        OR disassembled_publisher LIKE ('%${keyword_d}%')
            )
        )) AS COUNT_SET`,      [keyword_d]
      ).then((result) => {
        return result[0]
      });
      
    }
  } catch (error) {
    return next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
  }

  return res.status(status.OK).send({
    items: result,
    meta: 
      totalCount
  });
}

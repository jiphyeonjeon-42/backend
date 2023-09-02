import { makeExecuteQuery, pool } from '~/mysql';
import { logger } from '~/logger';
import { PopularSearchKeyword, SearchKeyword } from './searchKeywords.type';
import { extractHangulInitials, disassembleHangul } from '~/v1/utils/disassembleKeywords';
import { executeQuery } from '~/mysql';
import * as searchKeywordRepository from './searchKeywords.repository';

const LEAST_SEARCH_COUNT = 5;
const POPULAR_RANKING_LIMIT = 10;
let lastPopular: string[] = [];

const updateLastPopular = (items: string[]) => {
  lastPopular = [...items];
  logger.debug(
    `(${new Date().toLocaleString()}) Popular Search Keywords `,
    lastPopular,
  );
};

export const getPopularSearchKeywords = async () => {
  const popularKeywords = await searchKeywordRepository.getPopularSearchKeywords(
    0,
    `${LEAST_SEARCH_COUNT}`,
    POPULAR_RANKING_LIMIT,
  );

  if (!lastPopular || lastPopular.length === 0) {
    updateLastPopular(popularKeywords.map((item) => item.keyword));
  }
  const items: PopularSearchKeyword[] = popularKeywords.map(
    (item, index: number) => {
      const preRanking = lastPopular.indexOf(item.keyword);
      return {
        searchKeyword: item.keyword,
        rankingChange: preRanking === -1 ? null : preRanking - index,
      };
    },
  );

  return items;
};

export const renewLastPopular = async () => {
  const popularKeywords = await searchKeywordRepository.getPopularSearchKeywords(
    1,
    `${LEAST_SEARCH_COUNT}`,
    POPULAR_RANKING_LIMIT,
  );
  updateLastPopular(popularKeywords.map((item) => item.keyword));
};

export const createSearchKeywordLog = async (
  keyword: string,
  disassemble: string,
  initials: string,
) => {
  if (!keyword) return;

  const connection = await pool.getConnection();
  const transactionExecuteQuery = makeExecuteQuery(connection);

  try {
    await connection.beginTransaction();
    const [searchKeyword]: [SearchKeyword | undefined] = await transactionExecuteQuery(
      `
      SELECT id, keyword
      FROM search_keywords
      WHERE keyword = ?
      `,
      [keyword],
    );

    let searchKeywordId = searchKeyword?.id;
    if (!searchKeyword) {
      const { insertId }: { insertId: number } = await transactionExecuteQuery(
        `
        INSERT INTO search_keywords
        (keyword, disassembled_keyword, initial_consonants)
        VALUES (?, ?, ?)
        `,
        [keyword, disassemble, initials],
      );
      searchKeywordId = insertId;
    }

    await transactionExecuteQuery(
      `
      INSERT INTO search_logs
      (search_keyword_id)
      VALUES (?)
      `,
      [searchKeywordId],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    connection.release();
  }
};


export const getSearchAutocompletePreviewResult = async (
  keyword: string
) => {
  const LIMIT_OF_SEARCH_keyword_PREVIEW = 12;
  let keyword_d = extractHangulInitials(keyword as string)
  let isCho = true;

  if (keyword !== keyword_d) {
    keyword_d = disassembleHangul(keyword as string);
    isCho = false;
  }

  let result: any = [];
  let totalCount: number;
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
  return {
    items: result,
    meta: 
      totalCount
  };
}
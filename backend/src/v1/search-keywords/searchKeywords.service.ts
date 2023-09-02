import { executeQuery, makeExecuteQuery, pool } from '~/mysql';
import { logger } from '~/logger';
import { extractHangulInitials, disassembleHangul } from '~/v1/utils/disassembleKeywords';
import { AutocompleteKeyword, PopularSearchKeyword, SearchKeyword } from './searchKeywords.type';
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
  keyword: string,
) => {
  const LIMIT_OF_SEARCH_KEYWORD_PREVIEW = 12;
  let keywordInitials = extractHangulInitials(keyword as string);
  let isCho = true;

  if (keyword !== keywordInitials) {
    keywordInitials = disassembleHangul(keyword as string);
    isCho = false;
  }

  let queryResult: AutocompleteKeyword[] = [];
  let totalCount: number;
  if (isCho) {
    queryResult = await executeQuery(`
      (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE MATCH(title_initials, author_initials, publisher_initials) AGAINST (? IN BOOLEAN MODE)
        )
    )
    UNION (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE title_initials LIKE ('%${keywordInitials}%')
                    OR author_initials LIKE ('%${keywordInitials}%')
                    OR publisher_initials LIKE ('%${keywordInitials}%')
        )
    )
    LIMIT ${LIMIT_OF_SEARCH_KEYWORD_PREVIEW}
      `, [keywordInitials]);
    totalCount = await executeQuery(`SELECT COUNT(*) AS totalCount FROM (
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
              WHERE title_initials LIKE ('%${keywordInitials}%')
                      OR author_initials LIKE ('%${keywordInitials}%')
                      OR publisher_initials LIKE ('%${keywordInitials}%')
          )
      )) AS COUNT_SET`, [keywordInitials]).then((result) => result[0]);
  } else {
    queryResult = await executeQuery(`(
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image         
        FROM book_info
        WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher) AGAINST (? IN BOOLEAN MODE)
        )
    )
    UNION (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image         
        FROM book_info
        WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE disassembled_title LIKE ('%${keywordInitials}%')
                    OR disassembled_author LIKE ('%${keywordInitials}%')
                    OR disassembled_publisher LIKE ('%${keywordInitials}%')
        )
    )
    LIMIT ${LIMIT_OF_SEARCH_KEYWORD_PREVIEW}
      `, [keywordInitials]);
    totalCount = await executeQuery(`SELECT COUNT(*) AS totalCount FROM (
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
              WHERE disassembled_title LIKE ('%${keywordInitials}%')
                      OR disassembled_author LIKE ('%${keywordInitials}%')
                      OR disassembled_publisher LIKE ('%${keywordInitials}%')
          )
      )) AS COUNT_SET`, [keywordInitials]).then((result) => result[0]);
  }
  return {
    items: queryResult,
    meta: totalCount,
  };
};

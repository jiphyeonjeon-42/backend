import { executeQuery } from '~/mysql';
import { logger } from '~/logger';
import jipDataSource from '~/app-data-source';
import * as errorCode from '~/v1/utils/error/errorCode';
import {
  extractHangulInitials,
  disassembleHangul,
  removeSpecialCharacters,
} from '~/v1/utils/processKeywords';
import {
  AutocompleteKeyword,
  PopularSearchKeyword,
  SearchKeyword,
} from './searchKeywords.type';
import SearchKeywordsRepository from './searchKeywords.repository';
import SearchLogsRepository from './searchLogs.repository';

const LEAST_SEARCH_COUNT = 5;
const POPULAR_RANKING_LIMIT = 10;
let lastPopular: string[] = [];

export const getPopularSearches = async (
  base: number, // 검색어를 집계할 날짜 기준. ex) 0: 현재 시각부터 집계, 1: 1일 전부터 집계
  leastSearchCount: string,
  popularRankingLimit: number,
) => {
  const popularSearchKeywords: SearchKeyword[] = await executeQuery(
    `
    (
      SELECT keyword
      FROM search_logs
      LEFT JOIN search_keywords ON search_logs.search_keyword_id = search_keywords.id
      WHERE search_logs.timestamp BETWEEN NOW() - INTERVAL 1 DAY - INTERVAL ? DAY AND NOW() - INTERVAL ? DAY 
      GROUP BY search_keywords.keyword
      HAVING COUNT(search_keywords.keyword) >= ?
      ORDER BY COUNT(search_keywords.keyword) DESC, MAX(search_logs.timestamp) DESC
      LIMIT ?
    )
    UNION
    (
      SELECT keyword
      FROM search_logs
      LEFT JOIN search_keywords ON search_logs.search_keyword_id = search_keywords.id
      WHERE search_logs.timestamp BETWEEN NOW() - INTERVAL 1 MONTH - INTERVAL ? DAY AND NOW() - INTERVAL ? DAY 
      GROUP BY search_keywords.keyword
      HAVING COUNT(search_keywords.keyword) >= ?
      ORDER BY COUNT(search_keywords.keyword) DESC, MAX(search_logs.timestamp) DESC
      LIMIT ?
    )
    UNION
    (
      SELECT keyword
      FROM search_logs
      LEFT JOIN search_keywords ON search_logs.search_keyword_id = search_keywords.id
      GROUP BY search_keywords.keyword
      HAVING COUNT(search_keywords.keyword) >= ?
      ORDER BY COUNT(search_keywords.keyword) desc, MAX(search_logs.timestamp) desc
      LIMIT ?
    )
    LIMIT ?
    `,
    [
      base,
      base,
      leastSearchCount,
      popularRankingLimit,
      base,
      base,
      leastSearchCount,
      popularRankingLimit,
      leastSearchCount,
      popularRankingLimit,
      popularRankingLimit,
    ],
  );
  return popularSearchKeywords;
};

const updateLastPopular = (items: string[]) => {
  lastPopular = [...items];
  logger.debug(
    `(${new Date().toLocaleString()}) Popular Search Keywords `,
    lastPopular,
  );
};

export const renewLastPopular = async () => {
  const popularSearchKeywords = await getPopularSearches(
    1,
    `${LEAST_SEARCH_COUNT}`,
    POPULAR_RANKING_LIMIT,
  );
  updateLastPopular(popularSearchKeywords.map((item) => item.keyword));
};

export const getPopularSearchKeywords = async () => {
  const popularSearchKeywords = await getPopularSearches(
    0,
    `${LEAST_SEARCH_COUNT}`,
    POPULAR_RANKING_LIMIT,
  );

  if (!lastPopular || lastPopular.length === 0) {
    updateLastPopular(popularSearchKeywords.map((item) => item.keyword));
  }
  const items: PopularSearchKeyword[] = popularSearchKeywords.map(
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

export const createSearchKeywordLog = async (
  keyword: string,
  disassembledKeyword: string,
  initialConsonants: string,
) => {
  if (!keyword) return;

  const transactionQueryRunner = jipDataSource.createQueryRunner();
  const searchKeywordsRepository = new SearchKeywordsRepository(
    transactionQueryRunner,
  );
  const searchLogsRepository = new SearchLogsRepository(transactionQueryRunner);

  try {
    await transactionQueryRunner.startTransaction();
    const searchKeyword = await searchKeywordsRepository.findSearchKeyword({
      keyword,
    });

    let searchKeywordId: number | undefined;
    if (searchKeyword) {
      searchKeywordId = searchKeyword.id;
    } else {
      const { id } = await searchKeywordsRepository.createSearchKeyword({
        keyword,
        disassembledKeyword,
        initialConsonants,
      });
      searchKeywordId = id;
    }

    if (!searchKeywordId) {
      throw new Error(errorCode.QUERY_EXECUTION_FAILED);
    }
    await searchLogsRepository.createSearchLog({ searchKeywordId });
    await transactionQueryRunner.commitTransaction();
  } catch (error) {
    await transactionQueryRunner.rollbackTransaction();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    await transactionQueryRunner.release();
  }
};

export const getSearchAutocompletePreviewResult = async (keyword: string) => {
  const LIMIT_OF_SEARCH_KEYWORD_PREVIEW = 12;
  let keywordInitials = extractHangulInitials(keyword as string);
  let isCho = true;

  if (keyword !== keywordInitials) {
    keywordInitials = disassembleHangul(keyword as string);
    isCho = false;
  }
  const fullTextSearch = removeSpecialCharacters(keywordInitials);
  const likeSearch = keywordInitials.replaceAll(' ', '%').replaceAll(' ', '%');

  let queryResult: AutocompleteKeyword[] = [];
  let totalCount: number;
  if (isCho) {
    queryResult = await executeQuery(
      `
      (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
          SELECT book_info_id
          FROM book_info_search_keywords
          WHERE MATCH(title_initials, author_initials, publisher_initials)
            AGAINST (? IN BOOLEAN MODE)
        )
      )
      UNION
      (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
          SELECT book_info_id
          FROM book_info_search_keywords
          WHERE title_initials LIKE ('%${likeSearch}%')
            OR author_initials LIKE ('%${likeSearch}%')
            OR publisher_initials LIKE ('%${likeSearch}%')
        )
      )
      LIMIT ${LIMIT_OF_SEARCH_KEYWORD_PREVIEW}
      `,
      [fullTextSearch],
    );
    totalCount = await executeQuery(
      `
      SELECT COUNT(*) AS totalCount FROM (
        (
          SELECT id
          FROM book_info
          WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE MATCH(title_initials, author_initials, publisher_initials)
              AGAINST (? IN BOOLEAN MODE)
          )
        )
        UNION
        (
          SELECT id
          FROM book_info
          WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE title_initials LIKE ('%${likeSearch}%')
              OR author_initials LIKE ('%${likeSearch}%')
              OR publisher_initials LIKE ('%${likeSearch}%')
          )
        )
      ) AS COUNT_SET`,
      [fullTextSearch],
    ).then((result) => result[0]);
  } else {
    queryResult = await executeQuery(
      `
      (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
          SELECT book_info_id
          FROM book_info_search_keywords
          WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher) AGAINST (? IN BOOLEAN MODE)
        )
      )
      UNION
      (
        SELECT id as bookInfoId, title, author, publisher, publishedAt, image
        FROM book_info
        WHERE id IN (
          SELECT book_info_id
          FROM book_info_search_keywords
          WHERE disassembled_title LIKE ('%${likeSearch}%')
            OR disassembled_author LIKE ('%${likeSearch}%')
            OR disassembled_publisher LIKE ('%${likeSearch}%')
        )
      )
      LIMIT ${LIMIT_OF_SEARCH_KEYWORD_PREVIEW}
      `,
      [fullTextSearch],
    );
    totalCount = await executeQuery(
      `SELECT COUNT(*) AS totalCount FROM (
        (
          SELECT id
          FROM book_info
          WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE MATCH(disassembled_title, disassembled_author, disassembled_publisher)
              AGAINST (? IN BOOLEAN MODE)
          )
        )
        UNION
        (
          SELECT id
          FROM book_info
          WHERE id IN (
            SELECT book_info_id
            FROM book_info_search_keywords
            WHERE disassembled_title LIKE ('%${likeSearch}%')
              OR disassembled_author LIKE ('%${likeSearch}%')
              OR disassembled_publisher LIKE ('%${likeSearch}%')
          )
        )
      ) AS COUNT_SET`,
      [fullTextSearch],
    ).then((result) => result[0]);
  }
  return {
    items: queryResult,
    meta: totalCount,
  };
};

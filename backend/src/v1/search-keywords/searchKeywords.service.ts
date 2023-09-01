import { makeExecuteQuery, pool } from '~/mysql';
import { logger } from '~/logger';
import { PopularSearchKeyword, SearchKeyword } from './searchKeywords.type';
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
        rankingChange: preRanking === -1 ? null : index - preRanking,
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
    console.log(searchKeyword);

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

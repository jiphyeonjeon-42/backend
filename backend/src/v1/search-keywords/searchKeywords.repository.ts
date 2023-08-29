import { executeQuery } from '~/mysql';
import { SearchKeyword } from './search-keywords.type';

export const getPopularSearchKeywords = async (
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

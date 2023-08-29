import { executeQuery } from '~/mysql';
import { SearchKeyword } from './search-keywords.type';

export const getPopularSearchKeywords = async (
  leastSearchCount: string,
  popularRankingLimit: number,
) => {
  const popularSearchKeywords: SearchKeyword[] = await executeQuery(
    `
    (
      SELECT keyword
      FROM search_logs
      LEFT JOIN search_keywords ON search_logs.search_keyword_id = search_keywords.id
      WHERE search_logs.timestamp BETWEEN NOW() - INTERVAL 1 DAY AND NOW()
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
      WHERE search_logs.timestamp BETWEEN NOW() - INTERVAL 1 MONTH AND NOW()
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
      leastSearchCount,
      popularRankingLimit,
      leastSearchCount,
      popularRankingLimit,
      leastSearchCount,
      popularRankingLimit,
      popularRankingLimit,
    ],
  );
  return popularSearchKeywords;
};

import { executeQuery } from '~/mysql';
import { PopularSearchKeyword, SearchKeyword } from './search-keywords.type';

const MINIMUN_SEARCH_COUNT = 5;
const POPULAR_KEYWORDS_LIMIT = 10;
let lastPopular: string[] = [];

export const getPopularSearchKeywords = async () => {
  const popularKeywords = await executeQuery(
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
      `${MINIMUN_SEARCH_COUNT}`,
      POPULAR_KEYWORDS_LIMIT,
      `${MINIMUN_SEARCH_COUNT}`,
      POPULAR_KEYWORDS_LIMIT,
      `${MINIMUN_SEARCH_COUNT}`,
      POPULAR_KEYWORDS_LIMIT,
      POPULAR_KEYWORDS_LIMIT,
    ],
  );

  const items: PopularSearchKeyword[] = popularKeywords.map(
    (item: SearchKeyword, index: number) => {
      const preRank = lastPopular.indexOf(item.keyword);
      return {
        searchKeyword: item.keyword,
        rankingChange: preRank === -1 ? null : index - preRank,
      };
    },
  );
  lastPopular = items.map((item) => item.searchKeyword);

  return items;
};

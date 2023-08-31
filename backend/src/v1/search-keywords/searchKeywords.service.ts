import { PopularSearchKeyword } from './searchKeywords.type';
import * as searchKeywordRepository from './searchKeywords.repository';

const LEAST_SEARCH_COUNT = 5;
const POPULAR_RANKING_LIMIT = 10;
let lastPopular: string[] = [];

const updateLastPopular = (items: string[]) => {
  lastPopular = [...items];
  console.log(`(${new Date().toLocaleString()}) Popular Search Keywords `, lastPopular);
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

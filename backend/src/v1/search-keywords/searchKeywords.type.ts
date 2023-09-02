export type SearchKeyword = {
  id?: number;
  keyword: string;
};

export type PopularSearchKeyword = {
  searchKeyword: string;
  rankingChange: number | null;
};

export type SearchKeyword = {
  id?: number;
  keyword: string;
};

export type PopularSearchKeyword = {
  searchKeyword: string;
  rankingChange: number | null;
};

export type AutocompleteKeyword = {
  bookInfoId: number;
  title: string;
  author: string;
  publisher: string;
  publishedAt: string;
  image: string;
};

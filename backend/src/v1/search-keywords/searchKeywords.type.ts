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

export type CreateSearchLog = {
  searchKeywordId: number;
};

export type CreateSearchKeyword = {
  keyword: string;
  disassembledKeyword: string;
  initialConsonants: string;
};

export type FindSearchKeyword = {
  id?: number;
  keyword?: string;
};

export type FindBookInfoSearchKeyword = {
  id?: number;
  bookInfoId?: number;
};

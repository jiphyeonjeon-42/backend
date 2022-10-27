export interface SearchBookInfoQuery {
    query: string;
    sort: string;
    page: string;
    limit: string;
    category: string;
}

export interface SortInfoType {
    sort: string;
    limit: string;
}

export interface CreateBookInfo {
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  image?: string;
  categoryId?: string;
  pubdate?: string | Date;
  donator: string;
}

export interface UpdateBookInfo {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publishedAt: string | Date;
  image: string;
  categoryId?: string;
}

export interface UpdateBook {
  id: number;
  callSign: string;
  Status: number;
}

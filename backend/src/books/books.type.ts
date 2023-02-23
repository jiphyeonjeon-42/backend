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

export interface LendingBookList {
    id: number;
    title: string;
    author: string;
    publisher: string;
    isbn: string;
    image: string;
    publishedAt: Date | string;
    updatedAt: Date | string;
    lendingCnt: number;
}

export interface CreateBookInfo {
    infoId: number;
    callSign: string;
    title: string;
    author: string;
    publisher: string;
    isbn?: string;
    image?: string;
    categoryId?: string;
    pubdate?: string | null;
    donator: string;
    donatorId: number | null;
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
  status: number;
}

export enum categoryIds{
    'K' = 1,
    'C',
    'O',
    'A',
    'I',
    'G',
    'J',
    'c',
    'F',
    'E',
    'e',
    'H',
    'd',
    'D',
    'k',
    'g',
    'B',
    'n',
    'N',
    'j',
    'a',
    'f',
    'L',
    'b',
    'M',
    'i',
    'l',
}

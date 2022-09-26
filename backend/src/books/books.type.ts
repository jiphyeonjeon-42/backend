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

export interface ModifyBookInfo {
  id: number;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  image?: string;
  category?: string;
  publishedAt?: Date;
  callSign: string;
  donator?: string;
  dueDate: Date;
  pubdate?: string | Date;
}

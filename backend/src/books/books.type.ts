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
    isbn: string;
    donator: string;
    categoryId: number
    callSign: string;
}

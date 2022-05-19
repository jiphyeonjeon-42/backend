export interface SearchBookInfoQuery {
    query: string;
    sort: string;
    page: string;
    limit: string;
    category: string;
};


export interface SortInfoType { 
    sort: string;
    limit: string;
};
import axios from 'axios';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import httpStatus from 'http-status';

/**
 * 42 API에서 프로젝트 정보를 받아오는 함수.
 * @param accessToken 42 API에 접근하기 위한 access token
 * @param pageNumber 프로젝트 정보를 가져올 페이
 */
export const getProjectsInfo = async (
  accessToken: string,
  pageNumber: string,
) => {
  const uri: string = 'https://api.intra.42.fr/v2/projects';
  const queryString: string = 'sort=id&filter[exam]=false&filter[visible]=true&filter[has_mark]=true&page[size]=100';
  const pageQuery: string = `&page[number]=${pageNumber}`;
  const response = await axios.get(`${uri}?${queryString}${pageQuery}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch((error) => {
    if (error.status === 401) { throw new ErrorResponse(httpStatus[401], 401, 'Unauthorized'); } else { throw new ErrorResponse(httpStatus[500], 500, 'Internal Server Error'); }
  });
  return ();
};



/**
 * TODO search-keywords autocomplete
 * @param query 
 * @param limit 
 * @returns 
 */
export const searchkeywordPreview = async (
  keyword: string,
) => {
  return 0;
}
/*
export const searchkeyword = async (
  query: string,
  page: number,
  limit: number,
) => {
  const booksRepository = new BooksRepository();
  const bookList = await booksRepository.getBookList(query, limit, page);
  const totalItems = await booksRepository.getTotalItems(query);
  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: bookList, meta };
};
*/
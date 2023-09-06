import { Router } from 'express';
import { searchKeywordsAutocomplete, getPopularSearchKeywords } from '../search-keywords/searchKeywords.controller';

export const path = '/search-keywords';
export const router = Router();

router
  /**
   * @openapi
   * /api/search-keywords/popular:
   *    get:
   *      description: 인기 검색어 순위를 10위까지 가져온다. 동순위가 있는 경우 가장 최근에 검색된 검색어 순으로 보여준다.
   *      tags:
   *      - search-keywords
   *      responses:
   *        '200':
   *          description: 인기 검색어 10위.
   *                       rankingChange는 순위가 올랐으면 양수, 떨어졌으면 음수, 그대로면 0 이며, 새롭게 진입한 검색어는 null이다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    type: array
   *                    example: [
   *                               { "searchKeyword": 'aws', "rankingChange": 2 },
   *                               { "searchKeyword": '파이썬', "rankingChange": 0 },
   *                               { "searchKeyword": '도커', "rankingChange": -2 },
   *                               { "searchKeyword": 'tcp', "rankingChange": 0 },
   *                               { "searchKeyword": '스위프트', "rankingChange": 0 },
   *                               { "searchKeyword": '자바', "rankingChange": 0 },
   *                               { "searchKeyword": '검색', "rankingChange": 0 },
   *                               { "searchKeyword": 'http', "rankingChange": null },
   *                               { "searchKeyword": '리액트', "rankingChange": -1 },
   *                               { "searchKeyword": 'java', "rankingChange": -1 }
   *                             ]
   *                    items:
   *                      type: object
   *                      properties:
   *                        searchKeyword:
   *                          description: 검색어
   *                          type: string
   *                        rankingChange:
   *                          description: 순위 등락
   *                          type: integer
   */
  .get('/popular', getPopularSearchKeywords);

router
  /**
   * @openapi
   * /api/search-keywords/autocomplete:
   *    get:
   *      description: 검색창에서 검색어(초성 검색 가능)를 입력하면 해당 검색어에 대한 미리보기를 제공한다.
   *      tags:
   *      - search-keywords
   *      parameters:
   *      - name: keyword
   *        in: query
   *        description: 검색어(초성검색 가능)
   *        schema:
   *          type: string
   *      responses:
   *        '200':
   *          description: 검색결과 미리보기.
   *                       검색결과 미리보기는 최대 12개까지 리턴해주며. 검색어를 결과가 없으면 0개가 리턴 될수 있다
   *                       실제 검색 결과가 몇개인지도 totalCount라는 이름으로 제공한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    type: array
   *                    example:  [
   *                               {
   *                                  "book_info_id": 254,
   *                                   "title": "자료구조(C언어로 쉽게 풀어 쓴)(개정판 3판)",
   *                                   "author": "천인국, 공용해, 하상호",
   *                                   "publisher": "생능출판",
   *                                   "publishedAt": "2019-02-21T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/716/x9788970509716.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 948,
   *                                   "title": "열혈강의 : 자료구조",
   *                                   "author": "이상진",
   *                                   "publisher": "프리렉",
   *                                   "publishedAt": "2010-01-14T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/022/x9788989345022.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 945,
   *                                   "title": "윤성우의 열혈 자료구조 ",
   *                                   "author": "윤성우",
   *                                   "publisher": "오렌지미디어",
   *                                   "publishedAt": "2012-01-15T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/067/x9788996094067.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 199,
   *                                   "title": "Do it! 자료구조와 함께 배우는 알고리즘 입문: C 언어 편",
   *                                   "author": "보요 시바타",
   *                                   "publisher": "이지스퍼블리싱",
   *                                   "publishedAt": "2017-12-26T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/130/x9791188612130.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 209,
   *                                   "title": "Do it! 자료구조와 함께 배우는 알고리즘 입문: 파이썬 편",
   *                                   "author": "시바타 보요",
   *                                   "publisher": "이지스퍼블리싱",
   *                                   "publishedAt": "2020-07-19T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/727/x9791163031727.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 220,
   *                                   "title": "C로 쓴 자료구조론(2판)",
   *                                   "author": "HOROWITZ, Sahni, Anderson-Freed",
   *                                   "publisher": "교보문고",
   *                                   "publishedAt": "2008-02-09T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/944/x9788970858944.jpg"
   *                                 },
   *                                 {
   *                                   "book_info_id": 936,
   *                                   "title": "(C++로 구현하는) 자료구조와 알고리즘",
   *                                   "author": "Michael T. Goodrich",
   *                                   "publisher": "한티에듀",
   *                                   "publishedAt": "2013-08-30T15:00:00.000Z",
   *                                   "image": "https://image.kyobobook.co.kr/images/book/xlarge/039/x9791190017039.jpg"
   *                                 }
   *                               ]
   *                    items:
   *                      type: object
   *                      properties:
   *                        title:
   *                          description: 책 이름
   *                          type: string
   *                        author:
   *                          description: 저자 이름
   *                          type: string
   *                        publisher:
   *                          description: 출판사 이름
   *                          type: string
   *                        publishedAt:
   *                          description: 출판일자
   *                          type: string
   *                        image:
   *                          description: 책 표지 이미지 주소 링크
   *                          type: string
   *                  meta:
   *                    type: object
   *                    properties:
   *                      totalCount:
   *                        description: 전체 검색결과 수
   *                        type: number
   *                        example: 7
   */
  .get('/autocomplete', searchKeywordsAutocomplete);

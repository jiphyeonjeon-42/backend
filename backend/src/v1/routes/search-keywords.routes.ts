import { Router } from 'express';
import { getPopularSearchKeywords } from '../search-keywords/search-keywords.controller';

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

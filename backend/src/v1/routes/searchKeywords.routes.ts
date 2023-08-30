import { Router } from 'express';
import { searchKeywordsAutocomplete, getPopularSearchKeywords } from '../search-keywords/searchKeywords.controller';
import rateLimit from 'express-rate-limit';

export const path = '/search-keywords';
export const router = Router();

/**
 * TODO
 * 초당 요청할수 있는 api회수인듯 싶다. 
 * 검색결과 미리보기에서는 어떻게 활용할지 고려필요
 * 매직넘버 환경변수나 const 변수로 대체할지 고민 필요.
 */
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1분
//   max: 100, // 1분에 100번
//   message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
// });

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
   * TODO swagger
   * /api/search-keywords/autocomplete
   * e.g)
   *   http://localhost:3000/api/search-keywords/autocomplete?keyword=파이썬
   */
  .get('/autocomplete', searchKeywordsAutocomplete);


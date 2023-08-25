import { Router } from 'express';
import wrapAsyncController from '~/v1/middlewares/wrapAsyncController';
import { getProjects } from '../cursus/cursus.controller';

export const path = '/cursus';
export const router = Router();
router
/**
 * @openapi
 * /api/cursus/projects:
 *    get:
 *      summary: 42 API를 통해 cursus의 프로젝트 정보를 가져온다.
 *      description: 42 API를 통해 cursus의 프로젝트를 정보를 가져와서 json으로 저장한다.
 *      tags:
 *      - cursus
 *      responses:
 *        '200':
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *               examples:
 *                default(bookInfoId = 1) :
 *                  value:
 *                    items : [
 *                      {
 *                      reviewsId : 1,
 *                      reviewerId : 100,
 *                      bookInfoId: 1,
 *                      title: 클린코드,
 *                      nickname : sechung1,
 *                      content : hello,
 *                      },
 *                      {
 *                      reviewsId : 2,
 *                      reviewerId : 101,
 *                      bookInfoId: 1,
 *                      title: 클린코드,
 *                      nickname : sechung2,
 *                      content : hello,
 *                      },
 *                      {
 *                      reviewsId : 3,
 *                      reviewerId : 102,
 *                      bookInfoId: 1,
 *                      title: 클린코드,
 *                      nickname : sechung3,
 *                      content : hello,
 *                      },
 *                      {
 *                      reviewsId : 4,
 *                      reviewerId : 103,
 *                      bookInfoId: 1,
 *                      title: 클린코드,
 *                      nickname : sechung4,
 *                      content : hello,
 *                      },
 *                      {
 *                      reviewsId : 5,
 *                      reviewerId : 104,
 *                      bookInfoId: 1,
 *                      title: 클린코드,
 *                      nickname : sechung5,
 *                      content : hello,
 *                      }
 *                      ]
 *                    "meta": {
 *                        totalItems: 100,
 *                        itemsPerPage : 5,
 *                        totalPages : 20,
 *                        finalPage : False,
 *                        finalReviewsId : 104
 *                      }
 *        '400':
 *           content:
 *             application/json:
 *               schema:
 *                 type: json
 *                 description: 잘못된 요청 URL입니다.
 *                 examples: {errorCode: 400}
 *        '401':
 *           content:
 *             application/json:
 *               schema:
 *                 type: json
 *                 description: 토큰이 유효하지 않습니다.
 *               examples: {errorCode: 401}
 */
  .get('/cursus/projects', getProjects);

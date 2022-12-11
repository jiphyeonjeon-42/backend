import { Router } from 'express';
import {
  getBookInfoReviewsPage,
} from '../book-info-reviews/controller/bookInfoReviews.controller';
import { wrapAsyncController } from '../middlewares/wrapAsyncController';

export const path = '/book-info';
export const router = Router();
router
/**
 * @openapi
 * /api/book-info/{bookInfoId}/reviews:
 *    get:
 *      description: 책 리뷰 10개를 반환한다. 최종 페이지의 경우 1 <= n <= 10 개의 값이 반환될 수 있다. content에는 리뷰에 대한 정보를, finalPage 에는 해당 페이지가 마지막인지에 대한 여부를 boolean 값으로 반환한다. finalReviewsId는 마지막 리뷰의 Id를 반환하며, 반환할 아이디가 존재하지 않는 경우에는 해당 인자를 반환하지 않는다.
 *      tags:
 *      - bookInfo/reviews
 *      parameters:
 *      - name: bookInfoId
 *        required: true
 *        in: path
 *        schema:
 *          type: number
 *        description: bookInfoId에 해당 하는 리뷰 페이지를 반환한다.
 *      - name: reviewsId
 *        in: query
 *        schema:
 *          type: number
 *        required: false
 *        description: 해당 reviewsId를 조건으로 asc 기준 이후, desc 기준 이전의 페이지를 반환한다. 기본값은 첫 페이지를 반환한다.
 *      - name: sort
 *        in: query
 *        schema:
 *          type: string
 *        required: false
 *        description: asc, desc 값을 통해 시간순으로 정렬된 페이지를 반환한다. 기본값은 asd으로 한다.
 *      - name: limit
 *        in: query
 *        schema:
 *          type: number
 *        description: 한 페이지에서 몇 개의 게시글을 가져올 지 결정한다. [default = 10]
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
 *                 type: object
 *               examples:
 *                적절하지 않는 reviewsId 값:
 *                  value:
 *                    errorCode: 800
 *                적절하지 않는 bookInfoId 값:
 *                  value:
 *                    errorCode: 2
 *                적절하지 않는 sort 값:
 *                  value:
 *                    errorCode: 2
 */
  .get('/:bookInfoId/reviews', wrapAsyncController(getBookInfoReviewsPage));

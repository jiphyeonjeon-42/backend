import { Router } from 'express';
import {
  createReviews, updateReviews, getReviews, deleteReviews
} from '../reviews/reviews.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/reviews';
export const router = Router();

router
    /**
     * @openapi
     * /api/reviews:
     *    post:
     *      description: 책 리뷰를 작성한다.
     *      tags:
     *      - reviews
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                bookInfoId:
     *                  type: integer
     *                  nullable: false
     *                  required: true
     *                  example: 42
     *                commentText:
     *                  type: string
     *                  nullable: false
     *                  required: true
     *                  example: "책이 좋네요."
     *      responses:
     *         '201':
     *            description: 리뷰가 DB에 정상적으로 insert됨.
     *         '401':
     *            description: 권한 없음.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  토큰 누락 :
     *                    value:
     *                      errorCode: 100
     *                  토큰 유저 존재하지 않음 :
     *                    value :
     *                      errorCode: 101
     *                  토큰 만료 :
     *                    value :
     *                      errorCode: 108
     *                  토큰 유효하지 않음 :
     *                    value :
     *                      errorCode: 109
     */
    .post('/', /* authValidate(roleSet.all),*/ createReviews);

router
    /**
     * @openapi
     * /api/reviews:
     *    get:
     *      description: 책 리뷰 10개를 반환한다. 최종 페이지의 경우 1 <= n <= 10 개의 값이 반환될 수 있다. content에는 리뷰에 대한 정보를,
     *        finalPage 에는 해당 페이지가 마지막인지에 대한 여부를 boolean 값으로 반환한다.
     *      tags:
     *      - reviews
     *      parameters:
     *      - name: bookInfoId
     *        in: query
     *        description: book_info 테이블의 id값이 들어오면, 해당 책에 대한 리뷰를 보여준다.
     *        required: false
     *      - name: userId
     *        in: query
     *        description: user 테이블의 id값이 들어오면, 해당 user가 작성한 리뷰를 보여준다.
     *        required: false
     *      - name: page
     *        in: query
     *        description: 해당하는 페이지를 보여준다.
     *        required: false
     *      - name: sort
     *        in: query
     *        description: asd, desc 값을 통해 시간순으로 정렬된 페이지를 반환한다.
     *        required: false
     *      responses:
     *        '200':
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *               examples:
     *                bookInfo 기준 :
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
     *                      },
     *                      {
     *                      reviewsId : 6,
     *                      reviewerId : 105,
     *                      bookInfoId: 1,
     *                      title: 클린코드,
     *                      nickname : sechung6,
     *                      content : hello,
     *                      },
     *                      {
     *                      reviewsId : 7,
     *                      reviewerId : 106,
     *                      bookInfoId: 1,
     *                      title: 클린코드,
     *                      nickname : sechung7,
     *                      content : hello,
     *                      },
     *                      {
     *                      reviewsId : 8,
     *                      reviewerId : 107,
     *                      bookInfoId: 1,
     *                      title: 클린코드,
     *                      nickname : sechung8,
     *                      content : hello,
     *                      },
     *                      {
     *                      reviewsId : 9,
     *                      reviewerId : 108,
     *                      bookInfoId: 1,
     *                      title: 클린코드,
     *                      nickname : sechung9,
     *                      content : hello,
     *                      },
     *                      {
     *                      reviewsId : 10,
     *                      reviewerId : 109,
     *                      bookInfoId: 1,
     *                      title: 클린코드,
     *                      nickname : sechung10,
     *                      content : hello,
     *                      },
     *                      ]
     *                    "meta": {
     *                        totalItems: 100,
     *                        itemCount : 10,
     *                        itemsPerPage : 10,
     *                        totalPages : 20,
     *                        currentPage : 1,
     *                        finalPage : False
     *                      }
     *        '400':
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *               examples:
     *                적절하지 않는 bookInfoId 값:
     *                  value:
     *                    errorCode: 2
     *                적절하지 않는 userId 값:
     *                  value:
     *                    errorCode: 2
     *                적절하지 않는 page 값:
     *                  value:
     *                    errorCode: 2
     *                적절하지 않는 sort 값:
     *                  value:
     *                    errorCode: 2
     *        '401':
     *           description: 권한 없음.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *               examples:
     *                 토큰 누락 :
     *                   value:
     *                     errorCode: 100
     *                 사서 권한 없음 :
     *                   value:
     *                     errorCode: 100
     *                 토큰 유저 존재하지 않음 :
     *                   value :
     *                     errorCode: 101
     *                 토큰 만료 :
     *                   value :
     *                     errorCode: 108
     *                 토큰 유효하지 않음 :
     *                   value :
     *                     errorCode: 109
     */
    .get('/:bookInfoId', /* authValidate(roleSet.all),*/ getReviews);

router
    /**
     * @openapi
     * /api/reviews/{reviewsId}:
     *    patch:
     *      description: 책 리뷰를 수정한다. 작성자만 수정할 수 있다.
     *      tags:
     *      - reviews
     *      parameters:
     *      - name: reviewsId
     *        in: path
     *        description: 수정할 reviews ID
     *        required: true
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                content:
     *                  type: string
     *                  nullable: false
     *                  example: "책이 좋네요."
     *      responses:
     *         '200':
     *            description: 리뷰가 DB에 정상적으로 update됨.
     *         '400':
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                 적절하지 않는 reviewsId 값:
     *                   value:
     *                     errorCode: 800
     *         '401':
     *            description: 권한 없음.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  토큰 누락 :
     *                    value:
     *                      errorCode: 100
     *                  토큰 유저 존재하지 않음 :
     *                    value :
     *                      errorCode: 101
     *                  토큰 만료 :
     *                    value :
     *                      errorCode: 108
     *                  토큰 유효하지 않음 :
     *                    value :
     *                      errorCode: 109
     *                  토큰 userId와 리뷰 userID 불일치 && 사서 권한 없음 :
     *                    value :
     *                      errorCode: 801
     *         '404':
     *            description: 존재하지 않는 reviewsId.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  존재하지 않는 reviewsId :
     *                    value:
     *                      errorCode: 804
     */
    .patch('/:reviewsId', authValidate(roleSet.all), updateReviews);

router
    /**
     * @openapi
     * /api/reviews/{reviewsId}:
     *    delete:
     *      description: 책 리뷰를 삭제한다.
     *      tags:
     *      - reviews
     *      parameters:
     *      - name: reviewsId
     *        required: true
     *        in: path
     *        description: 들어온 reviewsId에 해당하는 리뷰를 삭제한다. 사서와 작성자만 삭제할 수 있다.
     *      responses:
     *         '200':
     *            description: 리뷰가 DB에서 정상적으로 delete됨.
     *         '400':
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                 적절하지 않는 reviewsId 값:
     *                   value:
     *                     errorCode: 800
     *         '401':
     *            description: 권한 없음.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  토큰 누락 :
     *                    value:
     *                      errorCode: 100
     *                  토큰 유저 존재하지 않음 :
     *                    value :
     *                      errorCode: 101
     *                  토큰 만료 :
     *                    value :
     *                      errorCode: 108
     *                  토큰 유효하지 않음 :
     *                    value :
     *                      errorCode: 109
     *                  토큰 userId와 리뷰 userID 불일치 && 사서 권한 없음 :
     *                    value :
     *                      errorCode: 801
     *         '404':
     *            description: 존재하지 않는 reviewsId.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  존재하지 않는 reviewsId :
     *                    value:
     *                      errorCode: 804
     */
    .delete('/:reviewsId', /* authValidate(roleSet.all),*/ deleteReviews);

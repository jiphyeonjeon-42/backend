import { Router } from 'express';
import {
  createReview, updateReview, getReview, deleteReview
} from '../review/review.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/review';
export const router = Router();

router
/**
   * @openapi
   * /api/review/:
   *    post:
   *      description: 책 리뷰를 작성한다.
   *      tags:
   *      - review
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
  .post('/', /* authValidate(roleSet.all),*/ createReview);


  router
/**
   * @openapi
   * /api/review/:
   *    get:
   *      description: 책 리뷰 10개를 반환한다. 최종 페이지의 경우 1 <= n <= 10 개의 값이 반환될 수 있다. content에는 리뷰에 대한 정보를,
   *        finalPage 에는 해당 페이지가 마지막인지에 대한 여부를 boolean 값으로 반환한다.
   *      tags:
   *      - review
   *      parameters:
   *      - name: bookInfoId
   *        in: query
   *        description: book_info 테이블의 id값이 들어오면, 해당 책에 대한 리뷰를 보여준다.
   *        required: false
   *      - name: userId
   *        in: query
   *        description: user 테이블의 id값이 들어오면, 해당 user가 작성한 리뷰를 보여준다.
   *        required: false
   *      - name: reviewId
   *        in: query
   *        description: review 테이블의 id값이 들어오면, 해당 reviewId 이후 다음 페이지를 반환한다. null일 경우 첫 페이지를 반환한다.
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
   *                    content : [
   *                      {
   *                      reviewId : 1,
   *                      reviewerId : 100,
   *                      bookInfoId: 1,
   *                      nickname : sechung1,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 2,
   *                      reviewerId : 101,
   *                      bookInfoId: 1,
   *                      nickname : sechung2,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 3,
   *                      reviewerId : 102,
   *                      bookInfoId: 1,
   *                      nickname : sechung3,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 4,
   *                      reviewerId : 103,
   *                      bookInfoId: 1,
   *                      nickname : sechung4,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 5,
   *                      reviewerId : 104,
   *                      bookInfoId: 1,
   *                      nickname : sechung5,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 6,
   *                      reviewerId : 105,
   *                      bookInfoId: 1,
   *                      nickname : sechung6,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 7,
   *                      reviewerId : 106,
   *                      bookInfoId: 1,
   *                      nickname : sechung7,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 8,
   *                      reviewerId : 107,
   *                      bookInfoId: 1,
   *                      nickname : sechung8,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 9,
   *                      reviewerId : 108,
   *                      bookInfoId: 1,
   *                      nickname : sechung9,
   *                      content : hello,
   *                      },
   *                      {
   *                      reviewId : 10,
   *                      reviewerId : 109,
   *                      bookInfoId: 1,
   *                      nickname : sechung10,
   *                      content : hello,
   *                      },
   *                      ]
   *                    finalPage : False
   *        '404':
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *               examples:
   *                존재하지 않는 bookInfoId :
   *                  value:
   *                    errorCode: 604
   *                존재하지 않는 userId :
   *                  value:
   *                    errorCode: 604
   *                존재하지 않는 reviewId :
   *                  value:
   *                    errorCode: 604
   */
  .get('/:bookInfoId', /* authValidate(roleSet.all),*/ getReview);
  router.get('/', /* authValidate(roleSet.all),*/ getReview);


  router
/**
   * @openapi
   * /api/review/{reviewId}:
   *    patch:
   *      description: 책 리뷰를 수정한다. 작성자만 수정할 수 있다.
   *      tags:
   *      - review
   *      parameters:
   *      - name: reviewId
   *        in: path
   *        description: 수정할 review ID
   *        required: true
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
   *                  example: 42
   *                commentText:
   *                  type: string
   *                  nullable: false
   *                  example: "책이 좋네요."
   *      responses:
   *         '200':
   *            description: 리뷰가 DB에 정상적으로 update됨.
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
   *                      errorCode: 601
   *         '404':
   *            description: 존재하지 않는 reviewId.
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                examples:
   *                  존재하지 않는 reviewId :
   *                    value:
   *                      errorCode: 604
   */
  .patch('/:reviewId', /* authValidate(roleSet.all),*/ updateReview);

router
/**
   * @openapi
   * /api/review/{reviewId}:
   *    delete:
   *      description: 책 리뷰를 삭제한다.
   *      tags:
   *      - review
   *      parameters:
   *      - name: reviewId
   *        required: true
   *        in: path
   *        description: 들어온 reviewId에 해당하는 리뷰를 삭제한다. 사서와 작성자만 삭제할 수 있다.
   *      responses:
   *         '200':
   *            description: 리뷰가 DB에서 정상적으로 delete됨.
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
   *                      errorCode: 601
   *         '404':
   *            description: 존재하지 않는 reviewId.
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                examples:
   *                  존재하지 않는 reviewId :
   *                    value:
   *                      errorCode: 604
   */
  .delete('/:reviewId', /* authValidate(roleSet.all),*/ deleteReview);

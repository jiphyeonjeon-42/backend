import { Router } from 'express';
import {
  createReviews, updateReviews, getReviews, deleteReviews, patchReviews,
} from '../reviews/controller/reviews.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';
import { wrapAsyncController } from '../middlewares/wrapAsyncController';

export const path = '/reviews';
export const router = Router();

router
  /**
     * @openapi
     * /api/reviews:
     *    post:
     *      description: 책 리뷰를 작성한다. content 길이는 10글자 이상 100글자 이하로 입력하여야 한다.
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
     *                content:
     *                  type: string
     *                  nullable: false
     *                  required: true
     *                  example: "책이 좋네요 열글자."
     *      responses:
     *         '201':
     *            description: 리뷰가 DB에 정상적으로 insert됨.
     *         '400':
     *            description: 잘못된 요청.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  유효하지 않은 content 길이 :
     *                    value:
     *                      errorCode: 801
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
    .post('/', authValidate(roleSet.all), wrapAsyncController(createReviews));

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
     *      - name: title
     *        in: query
     *        description: book-info 테이블의 title값이 들어오면, 해당 title의 리뷰를 보여준다.
     *        required: false
     *      - name: intraId
     *        in: query
     *        description: user 테이블의 intraId값이 들어오면, 해당 user가 작성한 리뷰를 보여준다.
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
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "sechung",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 2,
     *                      reviewerId : 101,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 3,
     *                      reviewerId : 102,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 4,
     *                      reviewerId : 103,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 5,
     *                      reviewerId : 104,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 6,
     *                      reviewerId : 105,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 7,
     *                      reviewerId : 106,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 8,
     *                      reviewerId : 107,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 9,
     *                      reviewerId : 108,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
     *                      },
     *                      {
     *                      reviewsId : 10,
     *                      reviewerId : 109,
     *                      bookInfoId: 1,
     *                      content : "hello",
     *                      createdAt: "2022-11-09T06:56:15.640Z",
     *                      title: "클린코드",
     *                      nickname : "chanheki",
     *                      intraId: "default@student.42seoul.kr",
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
    .get('/', authValidate(roleSet.librarian), wrapAsyncController(getReviews));

router
    /**
     * @openapi
     * /api/reviews/{reviewsId}:
     *    put:
     *      description: 책 리뷰를 수정한다. 작성자만 수정할 수 있다. content 길이는 10글자 이상 100글자 이하로 입력하여야 한다.
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
     *                  nullable: false경
     *                  example: "책이 좋네요 열글자."
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
     *                 유효하지 않은 content 길이 :
     *                   value:
     *                     errorCode: 801
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
     *                  토큰 Disabled Reviews는 수정할 수 없음. :
     *                    value :
     *                      errorCode: 805
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
    .put('/:reviewsId', authValidate(roleSet.all), wrapAsyncController(updateReviews));

    router
    /**
     * @openapi
     * /api/reviews/{reviewsId}:
     *    patch:
     *      description: 책 리뷰의 비활성화 여부를 토글 방식으로 변환
     *      tags:
     *      - reviews
     *      parameters:
     *      - name: reviewsId
     *        in: path
     *        description: 수정할 reviews ID
     *        required: true
     *      requestBody:
     *        required: false
     *      responses:
     *         '200':
     *            description: 리뷰가 DB에 정상적으로 fetch됨.
     */
    .patch('/:reviewsId', authValidate(roleSet.librarian), wrapAsyncController(patchReviews));

router
    /**
     * @openapi
     * /api/reviews/{reviewsId}:
     *    delete:
     *      description: 책 리뷰를 삭제한다. 작성자와 사서 권한이 있는 사용자만 삭제할 수 있다.
     *      tags:
     *      - reviews
     *      parameters:
     *      - name: reviewsId
     *        required: true
     *        in: path
     *        description: 들어온 reviewsId에 해당하는 리뷰를 삭제한다.
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
    .delete('/:reviewsId', authValidate(roleSet.all), wrapAsyncController(deleteReviews));

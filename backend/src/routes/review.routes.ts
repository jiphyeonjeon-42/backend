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
   *         '201':
   *            description: 리뷰가 DB에 정상적으로 insert됨.
   */
  .post('/', /* authValidate(roleSet.all),*/ createReview);


  router
/**
   * @openapi
   * /api/review/:
   *    get:
   *      description: 책 리뷰를 반환한다.
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
   *      responses:
   *        '200':
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   bookInfoId:
   *                     description: book_info 테이블의 id값
   *                     type: integer
   *                     nullable: false
   *                     example: 4261
   *                   reviewer:
   *                     description: 작성자
   *                     type: string
   *                     nullable: false
   *                     example: yena
   *                   createdAt:
   *                     type: date
   *                     nullable: false
   *                     example: "2022-09-14"
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
   *      - name: bookInfoId
   *        in: path
   *        description: 삭제할 review ID
   *      requestBody:
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
   *            description: 삭제 권한이 없음.
   *            content:
   *              application/json:
   *                schema:
   *                  type: json
   *                  example: { errorCode : 600 }
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
   *        in: path
   *        description: 들어온 reviewId에 해당하는 리뷰를 삭제한다. 사서와 작성자만 삭제할 수 있다.
   *      responses:
   *         '200':
   *            description: 리뷰가 DB에서 정상적으로 delete됨.
   *         '401':
   *            description: 삭제 권한이 없음.
   *            content:
   *              application/json:
   *                schema:
   *                  type: json
   *                  example: { errorCode : 600 }
   */
  .delete('/:reviewId', /* authValidate(roleSet.all),*/ deleteReview);

import { Router } from 'express';
// import {
//   createReviews, updateReviews, getReviews, deleteReviews, patchReviews,
// } from '../reviews/controller/reviews.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';
import { wrapAsyncController } from '../middlewares/wrapAsyncController';

export const path = '/tags';
export const router = Router();

router
  /**
     * @openapi
     * /api/tags:
     *    post:
     *      description: 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.
     *      tags:
     *      - tags
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                bookInfoId:
     *                  type: number
     *                  nullable: false
     *                  required: true
     *                  example: 42
     *                content:
     *                  type: string
     *                  nullable: false
     *                  required: true
     *                  example: "Python"
     *      responses:
     *         '201':
     *            description: 태그가 DB에 정상적으로 insert됨.
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
    .post('/', authValidate(roleSet.all), /*wrapAsyncController(createtags)*/);

router
    /**
     * @openapi
     * /api/tags/{tagsId}:
     *    delete:
     *      description: 책 태그를 삭제한다. 작성자와 사서 권한이 있는 사용자만 삭제할 수 있다.
     *      tags:
     *      - tags
     *      parameters:
     *      - name: tagsId
     *        required: true
     *        in: path
     *        description: 들어온 tagsId에 해당하는 태그를 삭제한다.
     *      responses:
     *         '200':
     *            description: 태그가 DB에서 정상적으로 delete됨.
     *         '400':
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                 적절하지 않는 tagsId 값:
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
     *                  토큰 userId와 태그 userID 불일치 && 사서 권한 없음 :
     *                    value :
     *                      errorCode: 801
     *         '404':
     *            description: 존재하지 않는 tagsId.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  존재하지 않는 tagsId :
     *                    value:
     *                      errorCode: 804
     */
    .delete('/:reviewsId', authValidate(roleSet.all), /*wrapAsyncController(deleteReviews)*/);

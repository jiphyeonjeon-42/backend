import { Router } from 'express';
import { roleSet } from '../auth/auth.type';
import authValidate from '../auth/auth.validate';
import {
  create, myupdate, search, update,
} from '../users/users.controller';

export const path = '/users';
export const router = Router();

/**
 * @openapi
 * /api/users/search:
 *    get:
 *      description: 유저 정보를 검색해 온다. query 가 null이면 모든 유저를 검색한다.
 *      tags:
 *        - users
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nickname:
 *                  type: string
 *                page:
 *                  type: integer
 *                limit:
 *                  type: integer
 *      responses:
 *        '200':
 *          description: 검색 결과를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    description: 유저 정보 목록
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          description: 유저 번호
 *                          type: integer
 *                          example: 3
 *                        email:
 *                          description: 이메일
 *                          type: string
 *                          example: "kyungsle@gmail.com"
 *                        nickName:
 *                          description: 닉네임
 *                          type: string
 *                          example: "kyungsle"
 *                        intraId:
 *                          description: 인트라 고유 번호
 *                          type: integer
 *                          example: 10068
 *                        slack:
 *                          description: slack 멤버 Id
 *                          type: string
 *                          example: "U035MUEUGKW"
 *                        penaltyEndDate:
 *                          description: 패널티 끝나는 날짜
 *                          type: string
 *                          format: date
 *                          example: 2022-05-22
 *                        overDueDay:
 *                          description: 현재 연체된 날수
 *                          type: string
 *                          format: number
 *                          example: 0
 *                        role:
 *                          description: 권한
 *                          type: integer
 *                          example: 2
 *                        reservations:
 *                          description: 해당 유저의 예약 정보
 *                          type: array
 *                          example: []
 *                        lendings:
 *                          description: 해당 유저의 대출 정보
 *                          type: array
 *                          example: []
 *                  meta:
 *                    description: 유저 수와 관련된 정보
 *                    type: object
 *                    properties:
 *                      totalItems:
 *                        description: 전체 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      itemCount:
 *                        description: 현재 페이지 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      itemsPerPage:
 *                        description: 페이지 당 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      totalPages:
 *                        description: 전체 결과 페이지 수
 *                        type: integer
 *                        example: 1
 *                      currentPage:
 *                        description: 현재 페이지
 *                        type: integer
 *                        example: 1
 *        '400':
 *          description: Client Error Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 200
 *        '500':
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 1
 *
 */
/**
 * @openapi
 * /api/users/create:
 *    post:
 *      description: 유저를 생성한다.
 *      tags:
 *        - users
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        '201':
 *          description: 유저 생성 성공!
 *        '400':
 *          description: 입력된 인자가 부적절합니다
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: 200, 201, 205 에러 가능
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: error description
 *                    example: 200
 *        '500':
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 1
 */
/**
 * @openapi
 * /api/users/update/{id}:
 *    patch:
 *      description: 유저 정보를 변경한다.
 *      tags:
 *        - users
 *      parameters:
 *        - in: path
 *          name: id
 *          description: 변경할 유저의 id 값
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                nickname:
 *                  type: string
 *                intraId:
 *                  type: integer
 *                slack:
 *                  type: string
 *                role:
 *                  type: integer
 *      responses:
 *        '200':
 *          description: 성공
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: success
 *        '400':
 *          description: nickname, intraId, slack, role 중 아무것도 없습니다..
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errCode:
 *                    type: integer
 *                    example: 200
 *        '500':
 *          description: DB Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 1
 */
/**
 * @openapi
 * /api/users/myupdate:
 *    patch:
 *      description: 유저 정보를 변경한다.
 *      tags:
 *        - users
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        '200':
 *          description: 유저 정보 변경 성공!
 *        '400':
 *          description: 들어온 인자가 없습니다..
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 200
 *        '403':
 *          description: 수정하려는 계정이 본인의 계정이 아닙니다
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 206
 *        '409':
 *          description: 수정하려는 값이 중복됩니다
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: 203, 204 에러
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 204
 *        '500':
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 1
 */

router.get('/search', search)
  .post('/create', create)
  .patch('/update/:id', authValidate(roleSet.librarian), update)
  .patch('/myupdate', authValidate(roleSet.all), myupdate);

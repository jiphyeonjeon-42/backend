import { Router } from 'express';
import { create, search } from '../users/users.controller';

export const path = '/users';
export const router = Router();

router.post('/', create)
/**
 * @openapi
 * /api/users/search:
 *    get:
 *      description: 유저 정보를 검색해 온다. query 가 null이면 모든 유저를 검색한다.
 *      parameters:
 *      - name: IntraId
 *        in: query
 *        description: 닉네임
 *        required: false
 *        schema:
 *          type: string
 *      - name: page
 *        in: query
 *        description: 페이지 수
 *        required: true
 *        schema:
 *          type: integer
 *      - name: limit
 *        in: query
 *        description: 한 페이지 표시 개수
 *        requied: true
 *        schema:
 *          type: integer
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
 *                          description: 이메일
 *                          type: string
 *                          example: "kyungsle@gmail.com"
 *                        IntraId:
 *                          description: 닉네임
 *                          type: string
 *                          example: "kyungsle"
 *                        IntraKey:
 *                          description: 인트라 고유 번호
 *                          type: integer
 *                          example: 10068
 *                        slack:
 *                          description: slack 멤버 Id
 *                          type: string
 *                          example: "U035MUEUGKW"
 *                        penaltyEndDay:
 *                          description: 패널티 끝나는 날
 *                          type: string
 *                          format: date
 *                          example: 2022-05-22
 *                        role:
 *                          description: 권한
 *                          type: integer
 *                          example: 2
 *                        lendingCnt:
 *                          description: 해당 유저의 대출 권 수
 *                          type: integer
 *                          example: 0
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
 *          description: page, limit 중 한 개 이상이 존재 하지 않습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                description: error decription
 *                example: page, limit 중 한 개 이상이 존재 하지 않습니다..
 */.get('/', search);

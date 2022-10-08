import { Router } from 'express';
import {
  histories,
} from '../histories/histories.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/histories';
export const router = Router();

router
  /**
   * @openapi
   * /api/histories:
   *     get:
   *       description: 현재까지의 대출 기록을 최신순으로 가져온다. 사서라면 모든 사용자의 기록을, 사서가 아니라면 본인의 기록만 볼  수 있다.
   *       tags:
   *       - histories
   *       parameters:
   *       - name: who
   *         in: query
   *         description: 대출/반납의 기록 범위
   *         required: true
   *         schema:
   *           type: string
   *           enum: [all, my]
   *       - name: query
   *         in: query
   *         description: 검색어
   *         required: false
   *         schema:
   *           type: string
   *       - name: type
   *         in: query
   *         description: 어떤 값들로 검색하고 싶은지 결정하는 필터
   *         required: false
   *         schema:
   *           type: string
   *           enum: [user, title, callsign, bookId]
   *       - name: page
   *         in: query
   *         description: 페이지 수
   *         required: false
   *         schema:
   *           type: integer
   *       - name: limit
   *         in: query
   *         description: 한 페이지 표시 개수
   *         required: false
   *         schema:
   *           type: integer
   *       responses:
   *         '200':
   *          description: 대출 기록을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    type: array
   *                    example: [{"id": 135,"lendingCondition": "","login": "seongyle1","penaltyDays": 0,"callSign": "K23.17.v1.c1","title": "모두의 데이터 과학 with 파이썬","createdAt": "2022-12-07T10:24:57.708Z", "returnedAt": "2022-12-07T10:24:57.708Z","dueDate": "2022-12-21T10:24:57.708Z"}, {"id": 136,"lendingCondition": "","login": "seongyle1","penaltyDays": 0,"callSign": "C5.13.v1.c1","title": "TCP IP 윈도우 소켓 프로그래밍(IT Cookbook 한빛 교재 시리즈 124)","createdAt": "2022-10-28T10:24:57.708Z", "returnedAt": null, "dueDate": "2022-11-11T10:24:57.708Z"}]
   *                  meta:
   *                    type: object
   *                    properties:
   *                      totalItems:
   *                          description: 전체 아이템의 수
   *                          example: 25
   *                      itemCount:
   *                            example: 5
   *                      itemsPerPage:
   *                            example: 5
   *                      totalPages:
   *                            example: 5
   *                      currentPage:
   *                            example: 1
   *         '401':
   *           description: 사서권한 없은 유저가 전체 대출/반납 기록을 조회하려고 함
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   errorCode:
   *                     type: integer
   *                     example: 700
   */
  .get('/', authValidate(roleSet.all), histories);

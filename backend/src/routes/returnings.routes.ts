import { Router } from 'express';
import { create, getRouter } from '../returnings/returnings.controller';

export const path = '/returnings';
export const router = Router();

/**
 * @openapi
 * /api/returnings:
 *    post:
 *      tags:
 *      - returnings
 *      summary: 반납 기록 생성
 *      description: 반납기록을 생성한다.
 *      requestBody:
 *        description: lendingId는 대출 고유 아이디, condition은 반납 당시 책 상태
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                lendingId:
 *                  type: integer
 *                condition:
 *                  type: string
 *              required:
 *                - lendingId
 *                - condition
 *      responses:
 *        '201':
 *          description: 반납기록 생성완료
 *        '400':
 *          description: 에러코드 0 dto에러 잘못된 json key, 1 db 에러 알 수 없는 lending id 등
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *        '401':
 *          description: 알 수 없는 사용자 0 로그인 안 된 유저 1 사서권한없음
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 * */
router.post('/', create).get('/', getRouter);

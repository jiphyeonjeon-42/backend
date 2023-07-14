import { Router } from 'express';
import { updateSlackList } from '../slack/slack.controller';

export const path = '/slack';
export const router = Router();

/**
 * @openapi
 * /api/slack/updateSlackList:
 *    get:
 *      description: 인증된 회원의 Slack ID를 추가한다. (사서만 가능)
 *      tags:
 *      - auth
 *      responses:
 *        '204':
 *          description: 정상적으로 검사 완료
 *        '401':
 *          description: 토큰이 없을 경우 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 *        '403':
 *          description: 권한이 맞지 않을때 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 *        '410':
 *          description: 해당 토큰의 유저가 DB에 없을 경우의 에러
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 *        '500':
 *          description: 예상 하지 못한 오류
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 */
router.get('/updateSlackList', updateSlackList);

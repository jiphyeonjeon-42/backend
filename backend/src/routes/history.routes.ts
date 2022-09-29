import { Router } from 'express';
import {
  history,
} from '../history/history.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/history';
export const router = Router();

router
  /**
   * @openapi
   * /api/history:
   *     get:
   *       description: 현재까지의 대출 기록을 최신순으로 가져온다. 사서라면 모든 사용자의 기록을, 사서가 아니라면 본인의 기록을 가져온다.
   *       tags:
   *       - history
   *       responses:
   *         '200':
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    bookInfoId:
   *                      description: book_info 테이블의 id값
   *                      type: integer
   *                      nullable: false
   *                      example: 42
   *                    renter:
   *                      description: 대출자
   *                      type: string
   *                      nullable: false
   *                      example: yena
   *                    returnAt:
   *                      type: date
   *                      nullable: true
   *                      example: "2022-09-25"
   *                    status:
   *                      type: integer
   *                      nullable: false
   *                      example: 0
   */
  .get('/', /* authValidate(roleSet.all), */ history);

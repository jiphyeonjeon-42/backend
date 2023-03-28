import { Router } from 'express';
import { roleSet } from '../auth/auth.type';
import authValidate from '../auth/auth.validate';

export const path = '/tags';
export const router = Router();

/**
 * @openapi
 * /api/tags/{id}:
 *    patch:
 *      description: 태그를 수정한다.
 *      tags:
 *        - tags
 *      parameters:
 *        - in: path
 *          name: id
 *          description: 변경할 태그의 id 값
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                login:
 *                  description: 인트라 아이디
 *                  type: string
 *                  example: yena
 *                content:
 *                  description: 태그 내용
 *                  type: string
 *                  example: "수정할_내용_적기"
 *      responses:
 *        '200':
 *          description: 수정된 태그를 반환합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 수정된 태그의 id
 *                    type: integer
 *                    example: 1
 *                  login:
 *                    description: 인트라 아이디
 *                    type: string
 *                    example: yena
 *                  content:
 *                    description: 태그 내용
 *                    type: string
 *                    example: "수정된_태그"
 *                  count:
 *                    description: 태그 개수
 *                    type: integer
 *                    example: 1
 *        '900':
 *          description: 태그의 양식이 올바르지 않습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 900
 *        '901':
 *          description: 권한이 없습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 901
 *        '902':
 *          description: 이미 존재하는 태그입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 902
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
router.patch('/update/:id', authValidate(roleSet.all) /* ,update */);

/**
 * @openapi
 * /api/tags/merge:
 *    patch:
 *      description: 태그를 병합한다.
 *      tags:
 *        - tags
 *      parameters:
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sourceId:
 *                  description: 병합될 태그의 id 값
 *                  type: integer
 *                  required: true
 *                  example: 1
 *                targetId:
 *                  description: 병합할 태그의 id 값
 *                  type: integer
 *                  required: true
 *                  example: 2
 *      responses:
 *        '200':
 *          description: 병합 후의 태그를 반환합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 병합된 태그의 id
 *                    type: integer
 *                    example: 3
 *                  login:
 *                    description: 인트라 아이디 리스트
 *                    type: list
 *                    example: ['yena', 'chanheki', 'jang-cho']
 *                  content:
 *                    description: 태그 내용
 *                    type: string
 *                    example: "병합된_태그"
 *                  count:
 *                    description: 태그 개수
 *                    type: integer
 *                    example: 3
 *        '901':
 *          description: 권한이 없습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 901
 *        '904':
 *          description: 존재하지 않는 태그 ID 입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 904
 *        '910':
 *          description: 유효하지 않은 양식의 태그 ID 입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 910
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
router.patch('/update/:id', authValidate(roleSet.librarian) /* ,merge */);

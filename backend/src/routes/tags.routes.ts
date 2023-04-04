import { Router } from 'express';
import { roleSet } from '../auth/auth.type';
import authValidate from '../auth/auth.validate';

export const path = '/tags';
export const router = Router();

/**
 * @openapi
 * /api/tags/{superTagId}:
 *    patch:
 *      description: 슈퍼 태그를 수정한다.
 *      tags:
 *        - tags
 *      parameters:
 *        - in: path
 *          name: superTagId
 *          description: 변경할 슈퍼 태그의 id 값
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  description: 슈퍼 태그 내용
 *                  type: string
 *                  example: "수정할_내용_적기"
 *      responses:
 *        '200':
 *          description: 수정된 슈퍼 태그를 반환합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 수정된 슈퍼 태그의 id
 *                    type: integer
 *                    example: 1
 *                  content:
 *                    description: 수정된 슈퍼 태그 내용
 *                    type: string
 *                    example: "수정된_태그"
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
router.patch('/tags/{superTagId}', authValidate(roleSet.librarian) /* ,update */);

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
 *                subTagIds:
 *                  description: 병합될 서브 태그의 id 리스트
 *                  type: list
 *                  required: true
 *                  example: [1, 2, 3, 5, 10]
 *                superTagId:
 *                  description: 슈퍼 태그의 id
 *                  type: integer
 *                  required: true
 *                  example: 2
 *      responses:
 *        '200':
 *          description: 병합 후의 슈퍼 태그를 반환합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 슈퍼 태그의 id
 *                    type: integer
 *                    example: 3
 *                  content:
 *                    description: 태그 내용
 *                    type: string
 *                    example: "병합된_태그"
 *                  count:
 *                    description: 해당 슈퍼 태그에 속한 서브 태그의 개수
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

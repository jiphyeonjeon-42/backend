import { Router } from 'express';
import { roleSet } from '../auth/auth.type';
import authValidate from '../auth/auth.validate';

export const path = '/tags';
export const router = Router();

/**
 * @openapi
 * /api/tags/:
 *    patch:
 *      description: 태그를 수정한다.
 *      tags:
 *        - tags
 *      parameters:
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  description: 수정할 태그의 id
 *                  type: integer
 *                  example: 1
 *                  required: true
 *                type:
 *                  description: 수정할 태그의 타입
 *                  type: string
 *                  enum: [super, sub, default]
 *                  example: super
 *                  required: true
 *                content:
 *                  description: 슈퍼 태그 내용
 *                  type: string
 *                  example: "수정할_내용_적기"
 *                visible:
 *                  description: 태그의 공개 여부
 *                  type: string
 *                  example: public
 *                  enum: [public, private]
 *      responses:
 *        '200':
 *          description: 수정된 슈퍼 태그를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 수정된 슈퍼 태그의 id
 *                    type: integer
 *                    example: 1
 *                  type:
 *                    description: 수정된 슈퍼 태그의 타입
 *                    type: string
 *                    example: "super"
 *                    enum: [super, sub, default]
 *                  content:
 *                    description: 수정된 슈퍼 태그 내용
 *                    type: string
 *                    example: "수정된_태그"
 *                  visible:
 *                    description: 수정된 슈퍼 태그의 공개 여부
 *                    type: string
 *                    example: "public"
 *                    enum: [public, private]
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
router.patch('/tags', authValidate(roleSet.all) /* ,update */);

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
router.patch('/tags/merge', authValidate(roleSet.librarian) /* ,merge */);

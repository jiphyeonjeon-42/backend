import { Router } from 'express';
import { getProjects } from '../cursus/cursus.controller';

export const path = '/cursus';
export const router = Router();
router
/**
 * @openapi
 * /api/cursus/projects:
 *    get:
 *      summary: 42 API를 통해 cursus의 프로젝트 정보를 가져온다.
 *      description: 42 API를 통해 cursus의 프로젝트를 정보를 가져와서 json으로 저장한다.
 *      tags:
 *      - cursus
 *      parameters:
 *      - name: page
 *        in: query
 *        description: 프로젝트 정보를 가져올 페이지 번호
 *        required: true
 *        schema:
 *          type: integer
 *          example: 1
 *          default: 1
 *      responses:
 *        '200':
 *          description: 프로젝트 정보를 성공적으로 가져옴.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                example: {
 *                  projects: [
 *                      {
 *                          id: 1,
 *                          name: "Libft",
 *                          slug: "libft",
 *                          parent: null,
 *                          cursus: [
 *                              {
 *                                 id: 1,
 *                                 name: "42",
 *                                 slug: "42"
 *                              },
 *                              {
 *                                 id: 8,
 *                                 name: "WeThinkCode_",
 *                                 slug: "wethinkcode_"
 *                              },
 *                              {
 *                                 id: 10,
 *                                 name: "Formation Pole Emploi",
 *                                 slug: "formation-pole-emploi"
 *                              }
 *                          ]
 *                      },
 *                      {
 *                          id: 2,
 *                          name: "GET_Next_Line",
 *                          slug: "get_next_line",
 *                          parent: null,
 *                          cursus: [
 *                              {
 *                                 id: 1,
 *                                 name: "42",
 *                                 slug: "42"
 *                              },
 *                              {
 *                                 id: 8,
 *                                 name: "WeThinkCode_",
 *                                 slug: "wethinkcode_"
 *                              },
 *                              {
 *                                 id: 10,
 *                                 name: "Formation Pole Emploi",
 *                                 slug: "formation-pole-emploi"
 *                              },
 *                              {
 *                               id: 18,
 *                               name: "Starfleet",
 *                               slug: "starfleet"
 *                              }
 *                          ]
 *                      }
 *                   ]
 *                }
 *        '400':
 *          description: 잘못된 요청 URL입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: json
 *                example: {errorCode: 400}
 *        '401':
 *          description: 토큰이 유효하지 않습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: json
 *                example: {errorCode: 401}
 */
  .get('/projects', getProjects);

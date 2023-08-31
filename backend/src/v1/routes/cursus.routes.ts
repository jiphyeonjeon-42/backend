import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { recommendBook, getProjects } from '../cursus/cursus.controller';
import { roleSet } from '../auth/auth.type';
import authValidate from '../auth/auth.validate';

export const path = '/cursus';
export const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100, // 1분에 100번
  message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
});

router
  /**
   * @openapi
   * /api/cursus/recommend/books:
   *    get:
   *      summary: 서클 별 추천 도서를 가져온다
   *      description: 사용자가 속한 서클의 추천 도서를 가져온다
   *      tags:
   *      - cursus
   *      parameters:
   *      - name: limit
   *        in: query
   *        description: 가져올 추천 도서의 개수
   *        schema:
   *          type: integer
   *        example: 4
   *      - name: project
   *        in: query
   *        description: 과제 명을 받아온다. 과제 명이 없으면, 사용자가 진행 중인 과제 중 가장 최근에 진행한 과제를 가져온다.
   *                     로그인하지 않은 사용자는 추천 도서 목록을 랜덤으로 가져온다.
   *        schema:
   *          type: string
   *        example: Libft
   *      responses:
   *        '200':
   *          description: 서클 별 추천 도서의 정보를 가져온다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 추천 도서들의 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        bookInfoId:
   *                          description: DB 상의 book_info.id
   *                          type: integer
   *                          example: 42
   *                        title:
   *                          description: 도서 제목
   *                          type: string
   *                          example: "시작하세요! 도커/쿠버네티스"
   *                        author:
   *                          description: 저자
   *                          type: string
   *                          example: 용찬호
   *                        publisher:
   *                          description: 출판사
   *                          type: string
   *                          example: 위키북스
   *                        image:
   *                          description: 표지 사진
   *                          type: string
   *                          example: https://image.kyobobook.co.kr/images/book/xlarge/394/x9791195982394.jpg
   *                        publishedAt:
   *                          description: 출판일자
   *                          type: string
   *                          format: date
   *                          example: 2020-01-31
   *                        subjects:
   *                          description: 도서와 관련된 과제들
   *                          type: array
   *                          example: ["Inception", "Inception-of-Things"]
   *                  meta:
   *                    description: 드롭다운에서 선택할 수 있는 서클과 과제 정보
   *                    type: array
   *                    example: ["사용자 맞춤", "0서클 | Libft", "1서클 | ft_printf", ...,
   *                              "아우터 서클 | ft_ping"]
   *        '500':
   *          description: 서버 오류
   *          content:
   *           application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 500 }
   */
  .get('/recommend/books', limiter, authValidate(roleSet.all), recommendBook);

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
 *      - name: mode
 *        in: query
 *        description: 프로젝트 정보를 가져올 모드. append면 기존에 저장된 정보에 추가로 저장하고, overwrite면 기존에 저장된 정보를 덮어쓴다.
 *        required: true
 *        schema:
 *          type: string
 *          enum: [append, overwrite]
 *          example: overwrite
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

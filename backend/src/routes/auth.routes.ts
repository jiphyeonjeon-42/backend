import { Router } from 'express';
import passport from 'passport';
import {
  getMe, getOAuth, getToken, intraAuthentication, login, logout,
  getIntraAuthentication,
} from '../auth/auth.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';
import config from '../config';
import * as errorCode from '../utils/error/errorCode';

export const path = '/auth';
export const router = Router();

/**
 * @openapi
 * /api/auth/oauth:
 *    get:
 *      description: 42 Api에 API key값을 추가해서 요청한다. redirect 되기에 반환값 확인 불가
 *      tags:
 *      - auth
 *      responses:
 *        '302':
 *          description: 정상적으로 42 Api로 이동
 *          headers:
 *             Location:
 *               description: 42 Api 주소로 이동
 *               schema:
 *                 type: string
 *                 format: uri
 */
router.get('/oauth', getOAuth);

/**
 * @openapi
 * /api/auth/token:
 *    get:
 *      description: 42 OAuth Api의 반환값을 이용하여 토큰을 발급한다. redirect 되기에 반환값 확인 불가.
 *      tags:
 *      - auth
 *      responses:
 *        '302':
 *          description: 성공적으로 토큰 발급
 *          headers:
 *             Location:
 *               description: 브라우저에 유저정보를 저장 하는 frontend /auth 주소로 이동
 *               schema:
 *                 type: string
 *                 format: uri
 *        '401':
 *          description: 42 api와 연동된 ID가 없음, [front에서 알림 후 회원가입창으로 이동]
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
router.get('/token', passport.authenticate('42', { session: false, failureRedirect: `${config.client.clientURL}/login?errorCode=${errorCode.ACCESS_DENIED}` }), getToken);

/**
 * @openapi
 * /api/auth/me:
 *    get:
 *      description: 클라이언트의 로그인된 유저 정보를 받아온다.
 *      tags:
 *      - auth
 *      responses:
 *        '200':
 *          description: 로그인 되어 있는 유저의 정보를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 로그인한 유저의 PK
 *                    type: integer
 *                    example: 42
 *                  intra:
 *                    description: 인트라 아이디 (인트라아이디가 없다면 email)
 *                    type: string
 *                    example: seongyle
 *                  librarian:
 *                    description: 사서 여부
 *                    type: boolean
 *                  email:
 *                    decription: email
 *                    type: string
 *                    example: seongyle@student.42seoul.kr
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
router.get('/me', authValidate(roleSet.all), getMe);

/**
 * @openapi
 * /api/auth/login:
 *    post:
 *      description: 입력된 회원정보를 Users DB에서 확인하여, Token을 발급해 쿠키에 저장해준다.
 *      tags:
 *      - auth
 *      requestBody:
 *        description: 로그인할 유저 정보
 *        required: true
 *        content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                  id:
 *                    type: string
 *                  password:
 *                    type: string
 *      responses:
 *        '204':
 *          description: 성공적으로 토큰 발급
 *        '400':
 *          description: ID, PW 값이 없는 잘못된 요청
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 *        '401':
 *          description: ID를 찾을 수 없는 경우
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
 *          description: PW가 틀린 경우
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
router.post('/login', login);

/**
 * @openapi
 * /api/auth/logout:
 *    post:
 *      description: 발급한 token을 소멸시킨다.
 *      tags:
 *      - auth
 *      responses:
 *        204:
 *          description: 정상적으로 token 삭제 완료
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/auth/getIntraAuthentication:
 *    get:
 *      description: 42 Api에 API key값을 추가해서 요청한다. redirect 되기에 반환값 확인 불가
 *      tags:
 *      - auth
 *      responses:
 *        '302':
 *          description: 정상적으로 42 Api로 이동
 *          headers:
 *             Location:
 *               description: 42 Api 주소로 이동
 *               schema:
 *                 type: string
 *                 format: uri
 */
router.get('/getIntraAuthentication', getIntraAuthentication);

/**
 * @openapi
 * /api/auth/intraAuthentication:
 *    get:
 *      description: 42 intra 인증을 실시한다. redirect 되어 들어오기에 반환값 확인 불가.
 *      tags:
 *      - auth
 *      responses:
 *        '302':
 *          description: 성공적으로 토큰 발급
 *          headers:
 *             Location:
 *               description: 브라우저에 유저정보를 저장 하는 frontend /auth 주소로 이동
 *               schema:
 *                 type: string
 *                 format: uri
 *        '400':
 *          description: ID, PW 값이 없는 잘못된 요청
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: number
 *                  message:
 *                    type: string
 *        '401':
 *          description: 토큰이 없을 경우, 이미 인증된 회원의 경우 에러
 *          content:
 *            application/json:
 *             schema:
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
router.get('/intraAuthentication', passport.authenticate('42Auth', { session: false, failureRedirect: `${config.client.clientURL}/mypage?errorCode=${errorCode.ACCESS_DENIED}` }), passport.authenticate('jwt', { session: false, failureRedirect: `${config.client.clientURL}/logout` }), intraAuthentication);

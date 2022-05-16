import { Router } from 'express';
import passport from 'passport';
import { getMe, getOAuth, getToken, login, logout } from '../auth/auth.controller';

export const path = '/auth';
export const router = Router();

router.get('/oauth', getOAuth);
router.get('/token', passport.authenticate('42', { session: false }), getToken);

/**
 * @openapi
 * /api/auth/me:
 *    get:
 *      description: 클라이언트의 로그인된 유저 정보를 받아온다.
 *      responses:
 *        200:
 *          description: 클라이언트의 정보를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 집현전 웹서비스에서의 유저 아이디
 *                    type: integer
 *                  intra:
 *                    description: 인트라 아이디
 *                    type: string
 *                  librarian:
 *                    description: 사서 여부
 *                    type: boolean
 *                  imageUrl:
 *                    description: 인트라넷 프로필 이미지 주소
 *                    type: string
 *        401:
 *          description: 토큰이 없거나 올바르지 않다.
 */
router.get('/me', passport.authenticate('jwt', { session: false }), getMe);

/**
 * @openapi
 * /api/auth/login:
 *    post:
 *      description: 입력된 회원정보를 Users DB에서 확인하여, Token을 발급해준다.
 *      responses:
 *        200:
 *          description: 성공적으로 로그인 완료
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  token:
 *                    description: 발급한 jwt token
 *                    type: string
 *        401:
 *          description:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    description: 에러 발생 원인
 *                    type: string
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/logout:
 *    post:
 *      description: 발급한 token을 소멸시킨다.
 *      responses:
 *        200:
 *          description: 정상적으로 token 삭제 완료
 */
router.post('/logout', logout);
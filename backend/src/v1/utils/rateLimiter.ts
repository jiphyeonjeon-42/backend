import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const message: string = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';

/**
 * GET method에 대해 rate limit을 적용한다. 초당 100회의 요청을 허용한다.
 */
export const getRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1000,
  max: 100,
  message,
});

/**
 * GET method를 제외한 모든 HTTP method에 대해 rate limit을 적용한다. 초당 10회의 요청을 허용한다.
 */
export const cudRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1000,
  max: 10,
  message,
});

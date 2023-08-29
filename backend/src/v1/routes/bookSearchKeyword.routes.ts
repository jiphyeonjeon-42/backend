import { Router } from 'express';
import { 
  searchKeywordPreview,
} from '~/v1/search-keywords/searchKeyword.controller';
import rateLimit from 'express-rate-limit';

export const path = '/search-keywords';
export const router = Router();
/**
 * TODO
 * 매직넘버 환경변수나 const 변수로 대체할지 고민 필요.
 */
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 100, // 1분에 100번
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
});

router
    /**
     * @openapi
     * /api/search-keywords/autocomplete
     * searchKeywordPreview
     * http://localhost:3000/api/search-keywords/autocomplete/preview
     * /api/search-keywords/autocomplete/preview
     */
    // .get('/autocomplete/preview', (req, res) => res.send("/autocomplete/preview"));
    .get('/autocomplete/preview', searchKeywordPreview);


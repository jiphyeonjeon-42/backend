import assert from "assert";
import { bigint } from "zod";
import * as Repository from './repository.ts';

// 나중에는 테스트 DB 이용
describe('insertReview', () => {
  test('successfully add', async () => {
    const review = await Repository.insertReview({
      userId: 1547,
      bookInfoId: 1,
      content: 'test',
    });
    assert.equal(typeof review.insertId, bigint);
  });
})

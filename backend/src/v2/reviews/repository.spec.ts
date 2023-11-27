import assert from "assert";
import * as Repository from './repository.ts';

// 나중에는 테스트 DB 이용
describe('insertReview', () => {
  test('successfully add', async () => {
    const insertResult = await Repository.insertReview({
      userId: 1547,
      bookInfoId: 1,
      content: 'test',
    });
    expect(insertResult).toBeDefined();
    expect(typeof insertResult.insertId).toBe('bigint');
  });
});

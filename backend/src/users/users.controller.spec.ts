import { UserSearchRequestQuerySchema } from './users.types';

describe('zod test: UserSearchRequest', () => {
  test('default test', () => {
    const parseResult = UserSearchRequestQuerySchema.safeParse({
      id: 1,
      nicknameOrEmail: 'test',
      page: 1,
      limit: 1,
    });
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data).toEqual({
        id: 1,
        nicknameOrEmail: 'test',
        page: 1,
        limit: 1,
      });
    }
  });
  test('edge test', () => {
    const parseResult = UserSearchRequestQuerySchema.safeParse({
    });
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data).toEqual({
        page: 0,
        limit: 5,
      });
    }
  });
  test('fail test', () => {
    const parseResult = UserSearchRequestQuerySchema.safeParse({
      id: 'abcd',
      nicknameOrEmail: 'test',
      page: 1,
      limit: 1,
    });
    expect(parseResult.success).toBe(false);
  });
});

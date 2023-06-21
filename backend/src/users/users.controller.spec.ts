import { UserSearchRequestQuerySchema } from './users.types';

describe('UserSearchRequest query', () => {
  test('regular query', () => {
    const data = {
      id: 1, nicknameOrEmail: 'test', page: 1, limit: 1,
    };

    expect(UserSearchRequestQuerySchema.safeParse(data)).toEqual({ success: true, data });
  });
  test('default value for empty query', () => {
    expect(UserSearchRequestQuerySchema.safeParse({}))
      .toEqual({ success: true, data: { page: 0, limit: 5 } });
  });
  test('fail test', () => {
    const error = {
      id: 'abcd', nicknameOrEmail: 'test', page: 1, limit: 1,
    };

    const parseResult = UserSearchRequestQuerySchema.safeParse(error);
    expect(parseResult.success).toBe(false);
  });
});

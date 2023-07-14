import { searchSchema } from './users.types';

describe('searchSchema query', () => {
  test('regular query', () => {
    const data = {
      id: 1, nicknameOrEmail: 'test', page: 1, limit: 1,
    };

    expect(searchSchema.safeParse(data)).toEqual({ success: true, data });
  });
  test('default value for empty query', () => {
    expect(searchSchema.safeParse({}))
      .toEqual({ success: true, data: { page: 0, limit: 5 } });
  });
  test('id should be parseable to number', () => {
    const error = {
      id: 'abcd', nicknameOrEmail: 'test', page: 1, limit: 1,
    };

    const parseResult = searchSchema.safeParse(error);
    expect(parseResult.success).toBe(false);
  });
});

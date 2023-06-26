import { searchSchema, createSchema } from './users.types';

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

describe('createSchema body', () => {
  test('regular body', () => {
    const data = {
      email: 'abc@def.example',
      password: 'abcdefg1234$',
    };
    expect(createSchema.safeParse(data)).toEqual({ success: true, data });
  });
  test('email should be valid', () => {
    const error = {
      email: 'abc',
      password: 'abcdefg1234$',
    };
    const parseResult = createSchema.safeParse(error);
    expect(parseResult.success).toBe(false);
  });
  test('password should be 10~42 characters long', () => {
    const error = {
      email: 'test@example.com',
      password: '123456789',
    };
    const parseResult = createSchema.safeParse(error);
    expect(parseResult.success).toBe(false);
  });
  test('password should contain at least one number', () => {
    const error = {
      email: 'test@example.com',
      password: 'abcdefghij$',
    };
    const parseResult = createSchema.safeParse(error);
    expect(parseResult.success).toBe(false);
  });
});

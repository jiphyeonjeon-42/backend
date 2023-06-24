import { z } from 'zod';

/** 양의 10진법 정수로 변환 가능한 문자열 */
export const numeric = z.string().regex(/^\d+$/).transform(Number);

/** 비어있지 않은 문자열 */
export const nonempty = z.string().nonempty();

/**
 * 키 목록으로부터 zod 환경변수 스키마를 생성해주는 헬퍼
 *
 * @param keys 환경변수 키 목록
 */
export const envObject = <T extends readonly string[]>(...keys: T) => {
  type Keys = T[ number ];
  const env = Object.fromEntries(keys.map((key) => [key, nonempty]));

  return z.object(env as Record<Keys, typeof nonempty>);
};

import { sql, type Expression, type RawBuilder } from 'kysely';

/**
 * 현재 시각을 반환합니다.
 *
 * @see {@link https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_now | NOW}
 */
export const dateNow = () => sql<Date>`NOW()`;

/**
 * 주어진 DATETIME을 YYYY-MM-DD 형식 문자열로 변환합니다.
 *
 * @todo(@scarf005): 임의의 날짜 형식을 타입 안전하게 사용
 */
export function dateFormat(expr: Expression<Date>, format: '%Y-%m-%d'): RawBuilder<string>;

export function dateFormat(
  expr: Expression<Date | null>,
  format: '%Y-%m-%d',
): RawBuilder<string | null>;

export function dateFormat(expr: Expression<Date | null>, format: '%Y-%m-%d') {
  return sql<string | null>`DATE_FORMAT(${expr}, ${format})`;
}
/**
 * 주어진 DATETIME에 주어진 일 수를 더합니다.
 *
 * @see {@link https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-add | DATE_ADD}
 */
export function dateAddDays(expr: Expression<Date>, days: number): RawBuilder<Date>;

export function dateAddDays(expr: Expression<Date | null>, days: number) {
  return sql<Date | null>`DATE_ADD(${expr}, INTERVAL ${days} DAY)`;
}

export function dateSubDays(expr: Expression<Date | null>, days: number) {
  return sql<Date | null>`DATE_SUB(${expr}, INTERVAL ${days} DAY)`;
}

/**
 * {@link left} - {@link right}일 수를 반환합니다.
 *
 * @see {@link https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_datediff | DATEDIFF}
 */
export function dateDiff(left: Expression<Date>, right: Expression<Date>): RawBuilder<number>;

export function dateDiff(
  left: Expression<Date | null>,
  right: Expression<Date | null>,
): RawBuilder<number | null>;

export function dateDiff(left: Expression<Date | null>, right: Expression<Date | null>) {
  return sql`DATEDIFF(${left}, ${right})`;
}

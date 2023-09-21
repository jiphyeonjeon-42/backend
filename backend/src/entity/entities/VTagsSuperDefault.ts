import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm/browser';

@ViewEntity('v_tags_super_default', {
  expression: `
  SELECT
    sp1.content AS content,
    (
        SELECT
            COUNT(sb1.id)
        FROM
            sub_tag sb1
        WHERE
            sb1.superTagId = sp1.id
            AND sb1.isDeleted IS FALSE
            AND sb1.isPublic IS TRUE) AS COUNT,
        'super' AS type,
        DATE_FORMAT(sp1.createdAt, '%Y-%m-%d'
    ) AS createdAt
    FROM
        super_tag sp1
    WHERE
        sp1.isDeleted IS FALSE
        AND sp1.content <> 'default'
  UNION
  SELECT
    sb2.content AS content,
    0 AS count,
    'default' AS type,
    DATE_FORMAT(sb2.createdAt, '%Y-%m-%d') AS createdAt
    FROM
    (
        sub_tag sb2
        JOIN super_tag sp2
          ON sb2.superTagId = sp2.id
    )
   WHERE
    sp2.content = 'default'
    AND sb2.isDeleted IS FALSE
    AND sb2.isPublic IS TRUE
    AND NOT EXISTS(
        SELECT
            1
          FROM super_tag sp3
         WHERE sp3.content = sb2.content
         LIMIT 1
         )
  ORDER BY RAND()
  `,
})
export class VTagsSuperDefault {
  @ViewColumn()
  content: string;

  @ViewColumn()
  count: number;

  @ViewColumn()
  type: string;

  @ViewColumn()
  createdAt: string;
}

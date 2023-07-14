import { RowDataPacket } from 'mysql2';

export type StringRows = RowDataPacket & {
  str: string
}

import { RowDataPacket } from 'mysql2';

export interface StringRows extends RowDataPacket {
  str: string
}

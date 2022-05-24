export interface Lending {
  userId: string,
  title: string,
  duedate: Date,
}

export interface User {
  id: number,
  email: string,
  password: string,
  nickName: string,
  intraId: number;
  slack?: string,
  penaltyEndDay?: Date,
  role: number,
  lendingCnt?: number,
  reservations?: [],
  lendings?: Lending[],
}

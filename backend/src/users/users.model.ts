export interface Lending {
  userId: number,
  bookInfoId: number,
  lendDate: Date,
  lendingCondition: string,
  image: string,
  author: string,
  title: string,
  duedate: Date,
  overDueDay: number,
  reservedNum: number,
}

export interface User {
  id: number,
  email: string,
  password: string,
  nickname: string,
  intraId: number,
  slack?: string,
  penaltyEndDate?: Date,
  overDueDay: number,
  role: number,
  reservations?: [],
  lendings?: Lending[],
}

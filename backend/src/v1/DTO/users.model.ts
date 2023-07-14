export type Lending = {
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

export type User = {
  id: number,
  email: string,
  nickname: string,
  intraId: number,
  slack?: string,
  penaltyEndDate?: Date,
  overDueDay: number,
  role: number,
  reservations?: [],
  lendings?: Lending[],
}
export type PrivateUser = User & {
  password: string,
}

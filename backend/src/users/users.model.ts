export interface Lending {
  userId: number,
  title: string,
  duedate: Date,
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

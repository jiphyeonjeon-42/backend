export interface User {
  id: number,
  email: string,
  password: string,
  nickname: string,
  intraId: number;
  slack?: string,
  penaltyEndDay?: Date,
  role: number,
  lendingCnt?: number,
  reservations?: [],
  lendings?: [],
}
export interface Meta {
  totalItems: number,
  itemCount: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number
}

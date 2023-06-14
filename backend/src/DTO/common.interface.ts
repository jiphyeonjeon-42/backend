export type Meta = {
  totalItems: number,
  itemCount: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number
}

export type searchQuery = {
  nickname: string,
  page?: string,
  limit?: string,
}

export type createQuery = {
  email: string,
  password: string,
}

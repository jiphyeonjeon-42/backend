export interface Meta {
  totalItems: number,
  itemCount: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number
}

export interface searchQuery {
  nickname: string,
  page?: string,
  limit?: string,
}

export interface createQuery {
  email: string,
  password: string,
}

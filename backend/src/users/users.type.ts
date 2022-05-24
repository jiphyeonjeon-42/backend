export interface Meta {
  totalItems: number,
  itemCount: number,
  itemsPerPage: number,
  totalPages: number,
  currentPage: number
}

export interface searchQuery {
  nickName: string,
  page?: string,
  limit?: string,
}

export interface createQuery {
  email: string,
  password: string,
}

export interface updateBody {
  id: string,
  email?: string,
  password?: string,
  nickname?: string,
  intraId?: string,
  slack?: string,
  role?: string,
}

export interface updateParam {
  id: string,
}

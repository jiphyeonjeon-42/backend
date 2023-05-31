export interface subDefaultTag {
  bookInfoId: number;
  title: string;
  id: number;
  createdAt: string;
  login: string;
  content: string;
  superContent: string;
  visibility: 'public' | 'private';
}

export interface superDefaultTag {
  id: number;
  content: string;
  login: string;
  count: number;
  type: string;
}

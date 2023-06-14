export type subDefaultTag = {
  bookInfoId: number;
  title: string;
  id: number;
  createdAt: string;
  login: string;
  content: string;
  superContent: string;
  visibility: 'public' | 'private';
}

export type superDefaultTag = {
  id: number;
  content: string;
  login: string;
  count: number;
  type: 'super' | 'default';
}

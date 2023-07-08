export type Review = {
  bookInfoId: number;
  content: string;
  createdAt: Date;
  disabled: boolean;
  intraId: number | null;
  nickname: string | null;
  reviewerId: number;
  reviewsId: number;
  title: string;
};

export class ReviewNotFoundError extends Error {
  declare readonly _tag: 'ReviewNotFoundError';

  constructor(reviewsId: number) {
    super(`리뷰 (id: ${reviewsId})를 찾을 수 없습니다`);
  }
}

export class ReviewDisabledError extends Error {
  declare readonly _tag: 'ReviewDisabledError';

  constructor(reviewsId: number) {
    super(`리뷰 (id: ${reviewsId})는 비공개 상태이므로 수정할 수 없습니다.`);
  }
}

export class ReviewForbiddenAccessError extends Error {
  declare readonly _tag: 'ReviewForbiddenAccessError';

  constructor({ userId, reviewsId }: { userId: number; reviewsId: number }) {
    super(`사용자 (id: ${userId})가 리뷰 (id: ${reviewsId})에 대한 권한을 갖고 있지 않습니다.`);
  }
}

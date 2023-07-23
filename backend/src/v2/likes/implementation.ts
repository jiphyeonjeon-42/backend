import { contract } from '@jiphyeonjeon-42/contracts';
import { initServer } from '@ts-rest/express';

const s = initServer();

// export const likes = s.router(contract.likes, {
//   post: async () =>
//     ({ status: 200, body: { userId: 1234, bookInfoId: 1234 } } as const),
//   get: async () =>
//     ({
//       status: 200,
//       body: { bookInfoId: 1234, isLiked: true, likeNum: 1 },
//     } as const),
//   delete: async () => ({ status: 204, body: null } as const),
// });
export const likes = s.router(contract.likes, {
  post: async () =>
    ({ status: 200, body: { userId: 1234, bookInfoId: 1234 } } as const),
  get: async () =>
    ({
      status: 404,
      body: {
        code: 'BOOK_INFO_NOT_FOUND',
        description: 'bookInfoId가 유효하지 않음',
      },
    } as const),
  delete: async () =>
    ({
      status: 404,
      body: { code: 'LIKE_NOT_FOUND', description: 'like 가 존재하지 않음' },
    } as const),
});

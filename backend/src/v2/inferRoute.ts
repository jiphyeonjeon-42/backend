import type {
  AppRoute,
  ServerInferRequest,
  ServerInferResponses,
} from '@ts-rest/core';

type ServerInferInput<T extends AppRoute> = {input: {req: ServerInferRequest<T>} }
export type ServerInferRoute<T extends AppRoute> =
  (input: ServerInferInput<T>) => Promise<ServerInferResponses<T>>

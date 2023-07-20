import type {
  AppRoute,
  ServerInferRequest,
  ServerInferResponses
} from "@ts-rest/core"

export type ServerInferRoute<T extends AppRoute> = (req: ServerInferRequest<T>) => Promise<ServerInferResponses<T>>

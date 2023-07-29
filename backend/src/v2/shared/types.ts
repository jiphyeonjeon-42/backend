import { AppRoute } from '@ts-rest/core';
import { AppRouteOptions } from '@ts-rest/express';
import { z } from 'zod';

export type HandlerFor<T extends AppRoute> = AppRouteOptions<T>['handler'];

export type Meta = z.infer<typeof meta>;
export const meta = z.object({
  totalItems: z.number().nonnegative(),
  itemCount: z.number().nonnegative(),
  itemsPerPage: z.number().nonnegative(),
  totalPages: z.number().nonnegative(),
  currentPage: z.number().nonnegative(),
});

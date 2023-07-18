import { AppRoute } from '@ts-rest/core';
import { AppRouteOptions } from '@ts-rest/express';

export type HandlerFor<T extends AppRoute> = AppRouteOptions<T>['handler'];

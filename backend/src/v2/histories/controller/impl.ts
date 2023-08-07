import { mkGetMyHistories, mkGetAllHistories } from './controller';
import {
  HistoriesService,
} from '../service';

export const implHistoriesController = (service: HistoriesService) => ({
  getMyHistories: mkGetMyHistories(service),
  getAllHistories: mkGetAllHistories(service),
});

import { mkGetStock, mkPatchStock } from './controller';
import {
  StockService,
} from '../service';

export const implStockController = (service: StockService) => ({
  getStock: mkGetStock(service),
  patchStock: mkPatchStock(service),
});

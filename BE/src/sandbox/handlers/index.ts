import { motoHandlers } from './moto';
import { otoHandlers } from './oto';
import { claimHandlers } from './claim';
import { healthHandlers } from './health';
import { generalHandlers } from './general';
import { aquaHandlers } from './aqua';

export interface HandlerMap {
  [key: string]: (body: any) => any;
}

export const handlers: HandlerMap = {
  ...motoHandlers,
  ...otoHandlers,
  ...claimHandlers,
  ...healthHandlers,
  ...generalHandlers,
  ...aquaHandlers,
};

import { motoHandlers } from './moto';
import { otoHandlers } from './oto';
import { claimHandlers } from './claim';
import { healthHandlers } from './health';
import { generalHandlers } from './general';
import { aquaHandlers } from './aqua';

export type HandlerMap = Record<
  string,
  (body?: Record<string, any>) => unknown
>;

export const handlers: HandlerMap = {
  ...motoHandlers,
  ...otoHandlers,
  ...claimHandlers,
  ...healthHandlers,
  ...generalHandlers,
  ...aquaHandlers,
};

import type {EMA, FasterEMA} from '../EMA/EMA.ts';
import type {FasterWSMA, WSMA} from '../WSMA/WSMA.ts';
import type {FasterSMA, SMA} from '../SMA/SMA.ts';

export type MovingAverageTypes = typeof EMA | typeof SMA | typeof WSMA;
export type FasterMovingAverageTypes = typeof FasterEMA | typeof FasterSMA | typeof FasterWSMA;

import {asserts} from '../../deps.test.ts';
import twoDays from '../test/fixtures/DMA/LTC-USDT-1h-2d.ts';
import {DMA, FasterDMA} from './DMA.ts';
import {EMA, SMA} from '../index.ts';

Deno.test('DMA', async t => {
  await t.step('constructor', async t => {
    await t.step('can be used with simple moving averages', () => {
      const dma = new DMA(3, 6, SMA);
      dma.update(41);
      dma.update(37);
      dma.update(20.9);
      dma.update(100);
      dma.update(30.71);
      dma.update(30);
      asserts.assertEquals(dma.getResult().short.toFixed(8), '53.57000000');
      asserts.assertEquals(dma.getResult().long.toFixed(8), '43.26833333');
    });

    await t.step('can be used with exponential moving averages', () => {
      const dma = new DMA(3, 6, EMA);
      dma.update(41);
      dma.update(37);
      dma.update(20.9);
      dma.update(100);
      dma.update(30.71);
      dma.update(30);
      asserts.assertEquals(dma.getResult().short.toFixed(8), '38.92125000');
      asserts.assertEquals(dma.getResult().long.toFixed(8), '41.96735289');
    });
  });

  await t.step('isStable', async t => {
    await t.step('is dependant on the long interval (SMA)', () => {
      const dma = new DMA(3, 5);
      dma.update(40);
      dma.update(30);
      dma.update(20);
      asserts.assertEquals(dma.isStable, false);
      dma.update(10);
      dma.update(30);
      asserts.assertEquals(dma.isStable, true);
    });

    await t.step('is dependant on the long interval (EMA)', () => {
      const dma = new DMA(3, 5, EMA);
      dma.update(40);
      dma.update(30);
      dma.update(20);
      asserts.assertEquals(dma.isStable, false);
      dma.update(10);
      dma.update(30);
      asserts.assertEquals(dma.isStable, true);
    });
  });

  await t.step('getResult', async t => {
    await t.step('detects uptrends', () => {
      const dma = new DMA(3, 8);
      const fasterDMA = new FasterDMA(3, 8);
      const nineHours = twoDays.slice(0, 9);

      for (const oneHour of nineHours) {
        const price = oneHour.close;
        dma.update(price);
        fasterDMA.update(parseFloat(price));
      }

      const {short, long} = dma.getResult();
      asserts.assertEquals(short.gt(long), true);

      const fasterResult = fasterDMA.getResult();
      asserts.assertEquals(fasterDMA.isStable, true);
      asserts.assertEquals(fasterResult.short > fasterResult.long, true);
    });
  });
});

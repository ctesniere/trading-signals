import {asserts} from '../../deps.test.ts';
import {FasterTR, TR} from './TR.ts';

Deno.test('TR', async t => {
  // Test data verified with:
  // https://tulipindicators.org/tr
  const candles = [
    {close: 81.59, high: 82.15, low: 81.29},
    {close: 81.06, high: 81.89, low: 80.64},
    {close: 82.87, high: 83.03, low: 81.31},
    {close: 83.0, high: 83.3, low: 82.65},
    {close: 83.61, high: 83.85, low: 83.07},
    {close: 83.15, high: 83.9, low: 83.11},
    {close: 82.84, high: 83.33, low: 82.49},
    {close: 83.99, high: 84.3, low: 82.3},
    {close: 84.55, high: 84.84, low: 84.15},
    {close: 84.36, high: 85.0, low: 84.11},
    {close: 85.53, high: 85.9, low: 84.03},
    {close: 86.54, high: 86.58, low: 85.39},
    {close: 86.89, high: 86.98, low: 85.76},
    {close: 87.77, high: 88.0, low: 87.17},
    {close: 87.29, high: 87.87, low: 87.01},
  ];
  const expectations = [
    '0.86',
    '1.25',
    '1.97',
    '0.65',
    '0.85',
    '0.79',
    '0.84',
    '2.00',
    '0.85',
    '0.89',
    '1.87',
    '1.19',
    '1.22',
    '1.11',
    '0.86',
  ];

  await t.step('getResult', async t => {
    await t.step('calculates the True Range (TR)', () => {
      const tr = new TR();
      const fasterTR = new FasterTR();
      for (const candle of candles) {
        tr.update(candle);
        fasterTR.update(candle);
        if (tr.isStable && fasterTR.isStable) {
          const expected = expectations.shift();
          asserts.assertEquals(tr.getResult().toFixed(2), expected!);
          asserts.assertEquals(fasterTR.getResult().toFixed(2), expected!);
        }
      }
      asserts.assertEquals(tr.isStable, true);
      asserts.assertEquals(fasterTR.isStable, true);

      asserts.assertEquals(tr.getResult().toFixed(2), '0.86');
      asserts.assertEquals(fasterTR.getResult().toFixed(2), '0.86');

      asserts.assertEquals(tr.lowest?.toFixed(2), '0.65');
      asserts.assertEquals(fasterTR.lowest?.toFixed(2), '0.65');

      asserts.assertEquals(tr.highest?.toFixed(2), '2.00');
      asserts.assertEquals(fasterTR.highest?.toFixed(2), '2.00');
    });
  });
});

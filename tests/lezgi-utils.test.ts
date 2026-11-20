import { describe, expect, it } from 'vitest';
import {
  CANONICAL_PALOCHKA,
  isLezgiAnswerCorrect,
  normalizeLezgiInputForComparison,
  normalizeLezgiOrthography,
} from '@/lib/lezgi-utils';

describe('Lezgi orthography & palochka normalization', () => {
  it('converts digit 1, Latin I/l, and vertical bar after consonants to canonical palochka Ӏ', () => {
    expect(normalizeLezgiOrthography('ч1ал')).toBe(`ч${CANONICAL_PALOCHKA}ал`);
    expect(normalizeLezgiOrthography('гьикI я?')).toBe(
      `гьик${CANONICAL_PALOCHKA} я?`
    );
    expect(normalizeLezgiOrthography('к|вал')).toBe(`к${CANONICAL_PALOCHKA}вал`);
    expect(normalizeLezgiOrthography('пlини')).toBe(`п${CANONICAL_PALOCHKA}ини`);
  });

  it('accepts keyboard substitutes (1, I, l, |) when checking learner word_input answers', () => {
    const accepted = ['чӀал'];

    expect(isLezgiAnswerCorrect('чӀал', accepted)).toBe(true);
    expect(isLezgiAnswerCorrect('Ч1АЛ', accepted)).toBe(true);
    expect(isLezgiAnswerCorrect('чIал!', accepted)).toBe(true);
    expect(isLezgiAnswerCorrect('чlал', accepted)).toBe(true);
    expect(isLezgiAnswerCorrect('ч|ал', accepted)).toBe(true);
    expect(isLezgiAnswerCorrect('салам', accepted)).toBe(false);
  });

  it('normalizes extra whitespace and punctuation for comparison', () => {
    expect(normalizeLezgiInputForComparison('  Салам,   стха! ')).toBe(
      'салам стха'
    );
  });
});

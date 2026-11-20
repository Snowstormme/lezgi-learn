/**
 * Lezgi orthography utilities.
 *
 * In standard Cyrillic Lezgi orthography, the ejectives and aspiration contrasts
 * use the Cyrillic letter Palochka:
 * - Uppercase: Ӏ (U+04C0)
 * - Lowercase: ӏ (U+04CF)
 *
 * In everyday typing (and non-specialized keyboards), speakers and learners
 * frequently substitute:
 * - Latin capital 'I' (U+0049)
 * - Latin small 'l' (U+006C)
 * - Digit '1' (U+0031)
 * - Vertical bar '|' (U+007C)
 * - Ukrainian/Belarusian 'І' (U+0406) or 'і' (U+0456)
 */

export const CANONICAL_PALOCHKA = 'Ӏ'; // U+04C0 (Standard uppercase/caseless Cyrillic Palochka used in Lezgi print)

/**
 * Normalizes canonical Lezgi text for storage in the database / seed pipeline.
 * Replaces lowercase palochka (U+04CF), Ukrainian І/і, vertical bar |, digit 1, or Latin I/l
 * immediately following a Cyrillic consonant with canonical U+04C0 `Ӏ`.
 */
export function normalizeLezgiOrthography(input: string): string {
  return input
    .normalize('NFC')
    .replace(/\u04CF/g, CANONICAL_PALOCHKA)
    .replace(/([КкПпТтЦцЧч])[1Iil|Іі]/g, `$1${CANONICAL_PALOCHKA}`)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a learner's answer in `word_input` exercises so they aren't penalized
 * for typing `1`, `I`, `l`, or `|` instead of `Ӏ`, or for casing/punctuation differences.
 */
export function normalizeLezgiInputForComparison(input: string): string {
  const normalizedPalochka = normalizeLezgiOrthography(input)
    .replace(/[1Iil|Іі\u04C0\u04CF]/g, CANONICAL_PALOCHKA);

  return normalizedPalochka
    .toLowerCase()
    .replace(/\u04cf/g, CANONICAL_PALOCHKA.toLowerCase())
    .replace(/[.,!?;:"'«»()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a user's input matches any of the accepted Lezgi answers.
 */
export function isLezgiAnswerCorrect(
  userInput: string,
  acceptedAnswers: string[]
): boolean {
  const candidate = normalizeLezgiInputForComparison(userInput);
  if (!candidate) return false;

  return acceptedAnswers.some(
    (answer) => normalizeLezgiInputForComparison(answer) === candidate
  );
}

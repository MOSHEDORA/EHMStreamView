/**
 * Telugu text detection and font resolution helpers
 * Supports Telugu script Unicode range: U+0C00 - U+0C7F
 */

export const isTeluguText = (text?: string): boolean => {
  if (!text) return false;
  return /[\u0C00-\u0C7F]/.test(text);
};

/**
 * Returns the CSS font-family string.
 * If text contains Telugu characters, defaults to Ramabhadra font.
 */
export const getEffectiveFontFamily = (
  text: string | undefined,
  baseFont: string,
  teluguFont: string = 'Ramabhadra'
): string => {
  if (isTeluguText(text)) {
    return `"${teluguFont || 'Ramabhadra'}", 'Gautami', 'Vani', sans-serif`;
  }
  return `"${baseFont}", sans-serif`;
};

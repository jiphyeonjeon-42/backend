import hangul from 'hangul-js';

export const disassembleHangul = (original: string | undefined) => {
  if (!original) return '';
  return hangul.d(original).join('');
};

export const extractHangulInitials = (original: string | undefined) => {
  if (!original) return '';
  return hangul
    .d(original, true)
    .map((letter) => letter[0])
    .join('');
};

import hangul from 'hangul-js';

export const disassembleHangul = (original: string) =>
  hangul.d(original).join('');

export const extractHangulInitials = (original: string) =>
  hangul
    .d(original, true)
    .map((letter) => letter[0])
    .join('');

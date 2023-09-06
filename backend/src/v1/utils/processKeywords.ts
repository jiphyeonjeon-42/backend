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

export const removeSpecialCharacters = (input: string) => {
  const regex = /[^a-zA-Z0-9가-힣\s]/g;
  // 문자열에서 특수 문자를 공백으로 대체합니다.
  return input.replace(regex, '');
};

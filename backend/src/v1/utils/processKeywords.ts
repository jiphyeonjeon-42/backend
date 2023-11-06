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
  const regex = /[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/g;
  return input.replace(regex, '');
};


export const addEscapeSignToSpecialCharacters = (input: string, esacpeSign: string) => {
  const regex = /[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/g;
  const modifiedText = input.replace(regex, (match) => `${esacpeSign}${match}`);
  return modifiedText;
};

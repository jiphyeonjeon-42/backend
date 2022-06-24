/* eslint-disable import/prefer-default-export */
/* 추후 여러 utils 함수들이 추가될 거 생각해서, default export를 안 넣어둠 */
export const isLibrian = (role : number):boolean => {
  if (role === 2) return true;
  return false;
};

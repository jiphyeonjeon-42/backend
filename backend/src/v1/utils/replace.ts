export const replaceAll = (inputString: string, origin: string, replacement: string) =>
  inputString.replace(new RegExp(origin, 'g'), replacement);

export class PubdateFormatError extends Error {
	declare readonly _tag: 'FormatError';
  
	constructor(exp: string) {
	  super(`${exp}가 지정된 포맷과 일치하지 않습니다.`);
	}
  }
export const enum role {
    user = 0,
    cadet,
    librarian,
    staff,
}

export const roleSet = {
  all: [role.user, role.cadet, role.librarian, role.staff],
  service: [role.cadet, role.librarian, role.staff],
  librarian: [role.librarian],
};

export const enum errCode {
    unknownError = '0',
    queryExecutionFailed = '1',
    noAuthorization = '100',
    noUser = '101',
    noToken = '102',
    noInput = '103',
    wrongPassword = '104',
    alreadyAuthenticated = '105',
    noId = '107',
    expirationToken = '108',
    tokenNotValid = '109',
}

export const enum errMsg {
    unknownError = '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    queryExecutionFailed = '쿼리 실행 실패',
    noAuthorization = '권한이 없습니다',
    noUser = '유저를 찾을 수 없습니다',
    noToken = '토큰이 발급되지 않았습니다',
    noInput = '입력된 값이 없습니다',
    wrongPassword = '비밀번호가 일치하지 않습니다',
    alreadyAuthenticated = '이미 인증된 회원입니다',
    noId = '해당 ID는 존재하지 않습니다',
    expirationToken = '토큰이 만료되었습니다',
    tokenNotValid = '토큰이 유효하지 않습니다',
}

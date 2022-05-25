export class FtError {
    public code: number;

    public message: string;

    constructor(code: number, message: string) {
      this.code = code;
      this.message = message;
    }
}

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

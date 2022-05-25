export class FtError {
    public code: number;

    public message: string;

    constructor(code: number, message: string) {
      this.code = code;
      this.message = message;
    }
}

export enum Role {
    User = 0,
    Cadet,
    Librarian,
    Staff,
}

export const RoleSet = {
  All: [Role.User, Role.Cadet, Role.Librarian, Role.Staff],
  Service: [Role.Cadet, Role.Librarian, Role.Staff],
  Admin: [Role.Librarian],
};

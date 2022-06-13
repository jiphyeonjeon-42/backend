/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

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

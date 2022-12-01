import { Request, Response } from 'express';
import authValidate from './auth.validate';
import { role } from './auth.type';

const authValidateDefaultNullUser = (roles: role[]) => async (
  req: Request,
  res: Response,
  next: Function,
) : Promise<void> => {
  if (!req.cookies.access_token) {
    req.user = { intraProfile: req.user, id: null, role: null };
    next();
  } else {
    authValidate(roles);
  }
};

export default authValidateDefaultNullUser;

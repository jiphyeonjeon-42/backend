import {
  NextFunction, Request, Response,
} from 'express';
import { getAccessToken } from '../auth/auth.service';
import { getProjectsInfo, saveProjects } from './cursus.service';

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = req.query.page as string;
  const mode = req.query.mode as string;
  const accessToken = await getAccessToken();
  let projects: object[] = [];
  try {
    projects = await getProjectsInfo(accessToken, page);
  } catch (error) {
    return next(error);
  }
  if (projects.length !== 0) { saveProjects(projects, mode); }
  return res.status(200).send({ projects });
};

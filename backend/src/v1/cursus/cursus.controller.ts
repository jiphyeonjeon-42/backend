import {
  NextFunction, Request, Response,
} from 'express';
import axios from 'axios';
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
  const projects = await getProjectsInfo(accessToken, page);
  saveProjects(projects, mode);
  res.status(200).send({ projects });
};

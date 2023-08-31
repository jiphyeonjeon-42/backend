import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '~/v1/utils/error/errorCode';
import { getAccessToken } from '../auth/auth.service';
import * as CursusService from './cursus.service';
import { BookListWithSubject, Project, ProjectInfo } from '../DTO/cursus.model';
import ErrorResponse from '../utils/error/errorResponse';

let accessToken: string;

export const recommandBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { nickname: login } = req.user as any;
  const limit = Number(req.query.limit);
  let bookList: BookListWithSubject[] = [];
  let meta: string[] = [];
  let userProject: Project[] = [];
  let userId: string;
  if (login !== null && login !== undefined) {
    userId = await CursusService.getIntraId(login);
    try {
      userProject = await CursusService.getUserProjectFrom42API(accessToken, userId);
    } catch (error: any) {
      if (error.status === 401) {
        accessToken = await getAccessToken();
        userProject = await CursusService.getUserProjectFrom42API(accessToken, userId);
      } else {
        next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
      }
    }
    const projectIds: number[] = await CursusService.getRecommendedProject(userProject);
    const bookIds: number[] = await CursusService.getRecommendedBookIds(projectIds);
    bookList = await CursusService.getBookListByIds(bookIds, limit);
    meta = await CursusService.getRecommendMeta();
  }
  res.status(status.OK).json({ bookList, meta });
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = req.query.page as string;
  const mode = req.query.mode as string;

  accessToken = await getAccessToken();
  let projects: ProjectInfo[] = [];
  try {
    projects = await CursusService.getProjectsInfo(accessToken, page);
  } catch (error) {
    return next(error);
  }
  if (projects.length !== 0) { CursusService.saveProjects(projects, mode); }
  return res.status(200).send({ projects });
};

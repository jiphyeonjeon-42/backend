import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '~/v1/utils/error/errorCode';
import { getAccessToken } from '~/v1/auth/auth.service';
import { RecommendedBook, UserProject, ProjectInfo } from '~/v1/DTO/cursus.model';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as CursusService from './cursus.service';
import { boolean } from 'zod';

let accessToken: string;

export const recommendBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { nickname: login } = req.user as any;
  const limit = Number(req.query.limit);
  const project = req.query.project as string;
  let shuffle: boolean = false;
  let bookInfoIds: number[] = [];
  let bookList: RecommendedBook[] = [];
  let meta: string[] = [];
  CursusService.readFiles();
  if (login === null || login === undefined) {
    bookInfoIds = await CursusService.getBookInfoIdsByProjectName(project);
    shuffle = true;
  } else if (project !== undefined) {
    bookInfoIds = await CursusService.getBookInfoIdsByProjectName(project);
  } else {
    let userProject: UserProject[] = [];
    let userProjectIds: number[] = [];
    const userId: string = await CursusService.getIntraId(login);
    try {
      userProject = await CursusService.getUserProjectFrom42API(accessToken, userId);
    } catch (error: any) {
      if (error.status === 401) {
        accessToken = await getAccessToken();
        userProject = await CursusService.getUserProjectFrom42API(accessToken, userId);
      } else {
        next(new ErrorResponse(errorCode.UNKNOWN_ERROR, status.INTERNAL_SERVER_ERROR));
      }
      userProjectIds = await CursusService.getRecommendedProject(userProject);
    }
    bookInfoIds = await CursusService.getRecommendedBookInfoIds(userProjectIds);
  }
  bookList = await CursusService.getBookListByIds(bookInfoIds, limit, shuffle);
  meta = await CursusService.getRecommendMeta();
  return res.status(status.OK).json({ items: bookList, meta });
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

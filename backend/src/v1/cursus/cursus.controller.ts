import {
  NextFunction, Request, Response,
} from 'express';
import * as status from 'http-status';
import * as errorCode from '~/v1/utils/error/errorCode';
import { getAccessToken } from '~/v1/auth/auth.service';
import { RecommendedBook, UserProject, ProjectInfo } from '~/v1/DTO/cursus.model';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as CursusService from './cursus.service';

export const recommendBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { nickname: login } = req.user as any;
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const project = req.query.project as string;
  let shuffle: boolean = false;
  let bookInfoIds: number[] = [];

  CursusService.readFiles();
  if (project !== undefined) {
    bookInfoIds = await CursusService.getBookInfoIdsByProjectName(project);
  } else if (login === null || login === undefined) {
    bookInfoIds = await CursusService.getBookInfoIdsByProjectName(project);
    shuffle = true;
  } else {
    let userProject: UserProject[] = [];
    const userId: string = await CursusService.getIntraId(login);
    try {
      const accessToken: string = await getAccessToken();
      userProject = await CursusService.getUserProjectFrom42API(accessToken, userId);
    } catch (error: any) {
      return next(error);
    }
    const userProjectIds: number[] = await CursusService.getRecommendedProject(userProject);
    bookInfoIds = await CursusService.getRecommendedBookInfoIds(userProjectIds);
  }
  const bookList: RecommendedBook[] = await CursusService.getBookListByIds(
    bookInfoIds,
    limit,
    shuffle,
  );
  const meta: string[] = await CursusService.getRecommendMeta();
  return res.status(status.OK).json({ items: bookList, meta });
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = req.query.page as string;
  const mode = req.query.mode as string;

  const accessToken:string = await getAccessToken();
  let projects: ProjectInfo[] = [];
  try {
    projects = await CursusService.getProjectsInfo(accessToken, page);
  } catch (error) {
    return next(error);
  }
  if (projects.length !== 0) { CursusService.saveProjects(projects, mode); }
  return res.status(200).send({ projects });
};

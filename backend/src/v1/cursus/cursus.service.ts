import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import * as errorCode from '~/v1/utils/error/errorCode';
import {
  BookListWithSubject,
  BooksWithProjectInfo,
  Project,
  ProjectFrom42,
  ProjectInfo,
  ProjectWithCircle,
  RawProject,
} from '../DTO/cursus.model';
import UsersRepository from '../users/users.repository';
import BooksRepository from '../books/books.repository';

export const getIntraId = async (
  login: string,
): Promise<string> => {
  const usersRepo = new UsersRepository();
  const user = (await usersRepo.searchUserBy({ nickname: login }, 1, 0))[0];
  return user[0].intraId.toString();
};

export const getUserProjectFrom42API = async (
  accessToken: string,
  userId: string,
): Promise<Project[]> => {
  const projectURL = `https://api.intra.42.fr/v2/users/${userId}/projects_users`;
  const userProject: Array<Project> = [];
  await axios(projectURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    const rawData: RawProject[] = response.data;
    rawData.forEach((data: RawProject) => {
      userProject.push({
        id: data.id,
        status: data.status,
        validated: data['validated?'],
        project: data.project,
        cursus_ids: data.cursus_ids,
        marked: data.marked,
        marked_at: data.marked_at,
        updated_at: data.updated_at,
      });
    });
  }).catch((error) => {
    if (error.response.status === 401) {
      throw new ErrorResponse(errorCode.NO_TOKEN, 401);
    } else {
      throw new ErrorResponse(errorCode.UNKNOWN_ERROR, 500);
    }
  });
  return userProject;
};

/**
 * cursus 객체에서 projectId가 포함된 서클 번호를 찾는 함수.
 * Inner circle은 0 부터 6까지이며, Outer circle은 null이다.
 * @param cursus 키가 서클 번호, 값이 프로젝트 id 배열인 객체
 * @param projectId 프로젝트 id
 * @returns projectId가 포함된 서클 번호 문자열
 */
const findCircle = (
  cursus: ProjectWithCircle,
  projectId: number,
) => {
  let circle: string | null = null;
  Object.keys(cursus).forEach((key) => {
    const projectIds = cursus[key].project_ids;
    if (projectIds.includes(projectId)) {
      circle = key;
      return true; // 순회 중단
    }
    return false;
  });
  return circle;
};

/**
 * 아우터 서클에 있는 프로젝트 id 배열을 반환하는 함수.
 * 사용자가 진행한 프로젝
 * @param cursus 서클 번호를 키로, 프로젝트 id 배열을 값으로 갖는 객체
 * @param projectList 사용자가 진행한 프로젝트 목록
 * @returns 아우터 서클에 있는 프로젝트 id 배열
 */
const getOuterProjectIds = (
  cursus: ProjectWithCircle,
  projectList: Project[] | null,
) => {
  const filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const project42: ProjectInfo[] = JSON.parse(fs.readFileSync(path.join(filePath), { encoding: 'utf8', flag: 'r' }));
  let outerProjectIds: number[] = [];
  for (let i = 0; i < project42.length; i += 1) {
    const projectId = project42[i].id;
    const circle = findCircle(cursus, projectId);
    if (circle === null) {
      outerProjectIds.push(project42[i].id);
    }
  }
  if (projectList) {
    const projectIds = projectList.map((project) => project.project.id);
    outerProjectIds = outerProjectIds.filter((id) => !projectIds.includes(id));
  }
  return outerProjectIds;
};

/**
 * 추천할 프로젝트 id 배열을 반환하는 함수. 만약 현재 서클 내에 추천할 프로젝트가 없다면 다음 서클에서 추천할 프로젝트를 반환한다.
 * @param cursus 키가 서클 번호, 값이 프로젝트 id 배열인 객체
 * @param circle 서클 번호
 * @returns 추천할 프로젝트 id 배열
 */
const getNextProjectIds = (
  cursus: ProjectWithCircle,
  circle: string,
) => {
  const projectIds = cursus[circle].project_ids;
  let innerProjectIds = projectIds.filter((id) => id !== 0);
  if (innerProjectIds.length === 0) {
    const nextCircle = Number(circle) + 1;
    if (nextCircle > 6) {
      innerProjectIds = getOuterProjectIds(cursus, null);
    }
    innerProjectIds = cursus[nextCircle].project_ids;
  }
  return innerProjectIds;
};

/**
 *
 * @param userProject 사용자의 프로젝트 정보
 * @returns 사용자에게 추천할 프로젝트
 */
export const getRecommendedProject = async (
  userProject: Project[],
) => {
  const projectList = userProject.sort((prev, post) =>
    new Date(post.updated_at).getTime() - new Date(prev.updated_at).getTime())
    .filter((item: Project) => !item.project.name.includes('Exam Rank'));
  const recommendedProject = projectList.filter((project) =>
    project.status === 'in_progress');
  if (recommendedProject.length > 0) {
    return recommendedProject.map((project) => project.project.id);
  }
  // 최근에 진행한 프로젝트를 바탕으로 추천할 프로젝트를 찾는다.
  const filePath: string = path.join(__dirname, '../../assets', 'cursus_info.json');
  const cursus: ProjectWithCircle = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  const userProjectId = userProject[0].project.id;
  const circle: string | null = findCircle(cursus, userProjectId);
  let nextProjectIds: number[] = [];
  if (circle) { // Inner Circle
    nextProjectIds = getNextProjectIds(cursus, circle);
  } else { // Outer Circle
    nextProjectIds = getOuterProjectIds(cursus, projectList);
  }
  return nextProjectIds;
};

/**
 * books_with_project_info.json 파일에서 추천할 책 id 배열을 반환하는 함수.
 * @param projectIds 추천할 프로젝트 id 배열
 * @returns 추천할 책 id 배열
 */
export const getRecommendedBookIds = async (
  projectIds: number[],
) => {
  let filePath = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithCursusInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'cursus_info.json');
  const recommendedBookIds: number[] = [];
  for (let i = 0; i < booksWithCursusInfo.length; i += 1) {
    const { projects } = booksWithCursusInfo[i];
    for (let j = 0; j < projects.length; j += 1) {
      const { id } = projects[j];
      if (projectIds.includes(id)) {
        recommendedBookIds.push(booksWithCursusInfo[i].book_info_id);
      }
    }
  }
  recommendedBookIds.filter(( // 중복 제거
    bookInfoId,
    index,
  ) => recommendedBookIds.indexOf(bookInfoId) === index);
  return recommendedBookIds;
};

/**
 * 추천 도서의 기존 book_info 정보에 프로젝트 정보를 추가하여 반환하는 함수.
 * @param bookInfoIds 추천 도서의 id 배열
 * @param limit 추천 도서의 개수
 * @returns 추천 도서의 정보
 */
export const getBookListByIds = async (
  bookInfoIds: number[],
  limit: number,
) => {
  const booksRepository = new BooksRepository();
  const bookList = await booksRepository.findBooksByIds(bookInfoIds);
  const bookListWithProject: BookListWithSubject[] = [];
  let filePath = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithCursusInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const projectInfo: ProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  for (let i = 0; i < bookList.length; i += 1) {
    const { id } = bookList[i];
    const projectId = booksWithCursusInfo.find((book) => book.book_info_id === id)?.projects[0].id;
    if (projectId) {
      const project = projectInfo.find((item) => item.id === projectId);
      if (project) {
        const { name } = project;
        bookListWithProject.push({ ...bookList[i], project: [name] });
      }
    }
  }
  return bookListWithProject.slice(0, limit);
};

/**
 * books_with_project_info.json 파일에 저장된 추천 도서의 프로젝트 정보를 반환하는 함수.
 * @returns 추천 도서의 프로젝트 정보
 */
export const getRecommendMeta = async () => {
  let filePath: string = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  const booksWithProjectInfo: BooksWithProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  const cursus: ProjectInfo[] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  const meta: string[] = [];
  for (let i = 0; i < booksWithProjectInfo.length; i += 1) {
    const { projects } = booksWithProjectInfo[i];
    for (let j = 0; j < projects.length; j += 1) {
      let projectName = cursus.find((project) => project.id === projects[j].id)?.name;
      if (projectName === undefined) {
        projectName = '기타';
      }
      let circle = projects[j].circle.toString();
      if (circle === '-1') { circle = '아우터 '; }
      meta.push(`${circle}서클 | ${projectName}`);
    }
  }
  return [...new Set(meta)];
};

/**
 * 42 API에서 받아온 프로젝트 정보를 가공하는 함수. 42서울에서 진행하는 프로젝트만 필터링한다.
 * 42서울에서 진행하는 프로젝트는 campus id가 29이고 cursus id가 21인 프로젝트이다.
 * @param data 42 API에서 받아온 프로젝트 정보
 * @returns
 */
const processData = async (
  data: ProjectFrom42[],
) => {
  const ftSeoulData = data.filter((project) => {
    for (let i = 0; i < project.campus.length; i += 1) {
      if (project.campus[i].id === 29) {
        for (let j = 0; j < project.cursus.length; j += 1) {
          if (project.cursus[j].id === 21) {
            return (true);
          }
        }
      }
    }
    return (false);
  });
  const processedData: ProjectInfo[] = ftSeoulData.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    parent: project.parent,
    cursus: project.cursus.map((cursus) => ({
      id: cursus.id,
      name: cursus.name,
      slug: cursus.slug,
    })),
  }));
  return (processedData);
};

/**
 * 42 API에서 프로젝트 정보를 받아오는 함수.
 * @param accessToken 42 API에 접근하기 위한 access token
 * @param pageNumber 프로젝트 정보를 가져올 페이
 */
export const getProjectsInfo = async (
  accessToken: string,
  pageNumber: string,
) => {
  const uri: string = 'https://api.intra.42.fr/v2/projects';
  const queryString: string = 'sort=id&filter[exam]=false&filter[visible]=true&filter[has_mark]=true&page[size]=100';
  const pageQuery: string = `&page[number]=${pageNumber}`;
  const response = await axios.get(`${uri}?${queryString}${pageQuery}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch((error) => {
    if (error.status === 401) { throw new ErrorResponse(status[401], 401, 'Unauthorized'); } else { throw new ErrorResponse(status[500], 500, 'Internal Server Error'); }
  });
  const processedData = await processData(response.data);
  return (processedData);
};

export const saveProjects = async (
  projects: ProjectInfo[],
  mode: string,
) => {
  const filePath: string = path.join(__dirname, '../../assets', 'projects_info.json');
  const jsonString = JSON.stringify(projects, null, 2);
  if (mode === 'overwrite') {
    await fs.writeFileSync(filePath, jsonString);
  } else {
    await fs.appendFileSync(filePath, jsonString);
  }
};

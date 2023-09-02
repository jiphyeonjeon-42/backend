import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import ErrorResponse from '~/v1/utils/error/errorResponse';
import * as status from 'http-status';
import {
  RecommendedBook,
  BooksWithProjectInfo,
  UserProject,
  ProjectFrom42,
  ProjectInfo,
  ProjectWithCircle,
  UserProjectFrom42,
} from '~/v1/DTO/cursus.model';
import UsersRepository from '~/v1/users/users.repository';
import BooksRepository from '~/v1/books/books.repository';

let booksWithProjectInfo: BooksWithProjectInfo[];
let cursusInfo: ProjectWithCircle;
let projectsInfo: ProjectInfo[];

/**
 * books_with_project_info.json, cursus_info.json, projects_info.json 파일을 읽어서 변수에 저장하는 함수.
 */
export const readFiles = async () => {
  let filePath = path.join(__dirname, '../../assets', 'books_with_project_info.json');
  booksWithProjectInfo = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'cursus_info.json');
  cursusInfo = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
  filePath = path.join(__dirname, '../../assets', 'projects_info.json');
  projectsInfo = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
};

/**
 * 사용자의 닉네임을 받아서 intra id를 반환하는 함수.
 * @param login 사용자의 닉네임
 * @returns 사용자의 intra id
 */
export const getIntraId = async (
  login: string,
): Promise<string> => {
  const usersRepo = new UsersRepository();
  const user = (await usersRepo.searchUserBy({ nickname: login }, 1, 0))[0];
  return user[0].intraId.toString();
};

/**
 * 42 API에서 사용자의 프로젝트 정보를 받아오는 함수.
 * @param accessToken 42 API에 접근하기 위한 access token
 * @param userId 42 API에서 사용자를 식별하기 위한 id
 * @returns 사용자의 프로젝트 정보
 */
export const getUserProjectFrom42API = async (
  accessToken: string,
  userId: string,
): Promise<UserProject[]> => {
  const projectURL = `https://api.intra.42.fr/v2/users/${userId}/projects_users`;
  const userProject: Array<UserProject> = [];
  await axios(projectURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    const rawData: UserProjectFrom42[] = response.data;
    rawData.forEach((data: UserProjectFrom42) => {
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
      throw new ErrorResponse('401', 401);
    } else {
      throw new ErrorResponse('500', 500);
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
  projectList: UserProject[] | null,
) => {
  let outerProjectIds: number[] = [];
  for (let i = 0; i < projectsInfo.length; i += 1) {
    const projectId = projectsInfo[i].id;
    const circle = findCircle(cursus, projectId);
    if (circle === null) {
      outerProjectIds.push(projectsInfo[i].id);
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
  userProject: UserProject[],
) => {
  const projectList = userProject.sort((prev, post) =>
    new Date(post.updated_at).getTime() - new Date(prev.updated_at).getTime())
    .filter((item: UserProject) => !item.project.name.includes('Exam Rank'));
  const recommendedProject = projectList.filter((project) =>
    project.status === 'in_progress');
  if (recommendedProject.length > 0) {
    return recommendedProject.map((project) => project.project.id);
  }
  // 최근에 진행한 프로젝트를 바탕으로 추천할 프로젝트를 찾는다.
  const userProjectId = userProject[0].project.id;
  const circle: string | null = findCircle(cursusInfo, userProjectId);
  let nextProjectIds: number[] = [];
  if (circle) { // Inner Circle
    nextProjectIds = getNextProjectIds(cursusInfo, circle);
  } else { // Outer Circle
    nextProjectIds = getOuterProjectIds(cursusInfo, projectList);
  }
  return nextProjectIds;
};

/**
 * books_with_project_info.json 파일에서 추천할 책 id 배열을 반환하는 함수.
 * @param projectIds 추천할 프로젝트 id 배열
 * @returns 추천할 책 id 배열
 */
export const getRecommendedBookInfoIds = async (
  userProjectIds: number[],
) => {
  if (userProjectIds.length === 0) {
    return (booksWithProjectInfo.map((book) => book.book_info_id));
  }
  const recommendedBookIds: number[] = [];
  for (let i = 0; i < booksWithProjectInfo.length; i += 1) {
    const projectIds: number[] = booksWithProjectInfo[i].projects.map((project) => project.id);
    for (let j = 0; j < projectIds.length; j += 1) {
      const id = projectIds[j];
      if (userProjectIds.includes(id)) {
        recommendedBookIds.push(booksWithProjectInfo[i].book_info_id);
      }
    }
  }
  return [...new Set(recommendedBookIds)];
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
  const bookListWithSubject: RecommendedBook[] = [];
  for (let i = 0; i < bookList.length; i += 1) {
    const { id } = bookList[i];
    const projectId = booksWithProjectInfo.find((book) => book.book_info_id === id)?.projects[0].id;
    if (projectId) {
      const project = projectsInfo.find((item) => item.id === projectId);
      if (project) {
        const { name } = project;
        bookListWithSubject.push({ ...bookList[i], project: [name] });
      }
    }
  }
  return bookListWithSubject.slice(0, limit);
};

/**
 * books_with_project_info.json 파일에 저장된 추천 도서의 프로젝트 정보를 반환하는 함수.
 * @returns 추천 도서의 프로젝트 정보
 */
export const getRecommendMeta = async () => {
  const meta: string[] = [];
  for (let i = 0; i < booksWithProjectInfo.length; i += 1) {
    const { projects } = booksWithProjectInfo[i];
    for (let j = 0; j < projects.length; j += 1) {
      let projectName = projectsInfo.find((project) => project.id === projects[j].id)?.name;
      if (projectName === undefined) {
        projectName = '기타';
      }
      let circle = projects[j].circle.toString();
      if (circle === '-1') { circle = '아우터 '; }
      meta.push(`${circle}서클 | ${projectName}`);
    }
  }
  meta.unshift('사용자 지정');
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
    if (error.status === 401) { throw new ErrorResponse(status[401], 401, 'Unauthorized'); } else { throw new ErrorResponse('500', 500, 'Internal Server Error'); }
  });
  const processedData = await processData(response.data);
  return (processedData);
};

/**
 * 프로젝트 정보를 json 파일에 저장하는 함수.
 * @param projects 저장할 프로젝트 정보 배열
 * @param mode 저장할 모드. append면 기존에 저장된 정보에 추가로 저장하고, overwrite면 기존에 저장된 정보를 덮어쓴다.
 */
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

/**
 * 프로젝트 이름을 받아서 추천 도서의 bookInfoId 배열을 반환하는 함수.
 * @param projectName 추천 도서를 필터링할 프로젝트 이름
 * @returns 추천 도서의 bookInfoId 배열
 */
export function getBookInfoIdsByProjectName(projectName: string | null) {
  if (projectName === null || projectName === undefined) {
    return booksWithProjectInfo.map((book) => book.book_info_id);
  }
  const projectInfo = projectsInfo.find((project) => project.name === projectName);
  if (projectInfo === undefined) {
    throw new ErrorResponse('404', 404, 'Not Found');
  }
  const projectId = projectInfo.id;
  const bookInfoList = booksWithProjectInfo.filter((book) => {
    const projectIds = book.projects.map((project) => project.id);
    return projectIds.includes(projectId);
  });
  return bookInfoList.map((book) => book.book_info_id);
}

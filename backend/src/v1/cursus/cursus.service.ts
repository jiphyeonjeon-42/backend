import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import ErrorResponse from '~/v1/utils/error/errorResponse';

/**
 * 42 API에서 받아온 프로젝트 정보를 가공하는 함수. 42서울에서 진행하는 프로젝트만 필터링한다.
 * @param data 42 API에서 받아온 프로젝트 정보
 * @returns
 */
const processData = async (
  data: [],
) => {
  const ftSeoulData = data.filter((project) => {
    for (let i = 0; i < project.campus.length; i += 1) {
      if (project.campus[i].id === 29) {
        return (true);
      }
    }
    return (false);
  });
  const processedData = ftSeoulData.map((project) => ({
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
  const path: string = 'https://api.intra.42.fr/v2/projects';
  const queryString: string = 'sort=id&filter[exam]=false&filter[visible]=true&filter[has_mark]=true&page[size]=100';
  const pageQuery: string = `&page[number]=${pageNumber}`;
  const response = await axios.get(`${path}?${queryString}${pageQuery}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch((error) => {
    if (error.status === 401) { throw new ErrorResponse('Unauthorized', 401); } else { throw new ErrorResponse('Internal Server Error', 500); }
  });
  const processedData = await processData(response.data);
  return (processedData);
};

export const saveProjects = async (
  projects: object[],
  pageNumber: string,
) => {
  const filePath: string = path.join(__dirname, '../../assets', 'projects_info.json');
  const jsonString = JSON.stringify(projects);
  if (pageNumber === '1') {
    await fs.writeFileSync(filePath, jsonString, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully wrote file');
      }
    });
  } else {
    await fs.appendFileSync(filePath, jsonString, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully wrote file');
      }
    });
  }
};

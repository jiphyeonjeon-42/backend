import { envObject } from './envObject';

export const nationalIsbnApiSchema = envObject('NATION_LIBRARY_KEY');

export const getNationalIsbnApiOption = (processEnv: NodeJS.ProcessEnv) => {
  const { NATION_LIBRARY_KEY: key } = nationalIsbnApiSchema.parse(processEnv);

  return key;
};

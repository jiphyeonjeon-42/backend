/* eslint no-console: "off" */
import { FtTypes } from '../auth/auth.service';
import { createUser, identifyUserById } from '../users/users.service';

const usersTest = async () => {
  console.log(await identifyUserById(3));

  const ftUserInfo: FtTypes = {
    intra: 44444,
    login: 'test',
    imageURL: 'http://localhost:3000/img',
  };
  console.log(await createUser(ftUserInfo));
};

export default usersTest;

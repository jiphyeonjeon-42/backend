import { findOneById } from '../users/users.service';

const usersTest = async () => {
  console.log(await findOneById(3));

};

export default usersTest
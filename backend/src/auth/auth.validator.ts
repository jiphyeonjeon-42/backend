const CLIENT_DEV_URL = 'http://localhost:3000';
const CLIENT_PRODUCTION_URL = 'https://42library.kr';

const clientValidator = (value: any) => {
  if (value !== CLIENT_DEV_URL && value !== CLIENT_PRODUCTION_URL) {
    return false;
  }
  return value;
};

export default clientValidator;

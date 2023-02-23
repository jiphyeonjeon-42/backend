import dotenv from 'dotenv';

dotenv.config();

let hostName;
let username;
let password;
let database;

switch (process.env.MODE) {
  case 'local':
    hostName = 'local';
    username = process.env.MYSQL_USER;
    password = process.env.MYSQL_PASSWORD;
    database = process.env.MYSQL_DATABASE;
    break;
  case 'RDS':
    hostName = process.env.RDS_HOSTNAME;
    username = process.env.RDS_USERNAME;
    password = process.env.RDS_PASSWORD;
    database = process.env.RDS_DB_NAME;
    break;
  default:
    hostName = 'database';
}

const config = {
  nodeEnv: process.env.NODE_ENV,
  mode: process.env.MODE,
  database: {
    host: hostName,
    port: 3306,
    username,
    password,
    dbName: database,
  },
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    redirectURL: process.env.REDIRECT_URL ?? 'https://server.42library.kr',
    clientURL: process.env.CLIENT_URL ?? 'https://42library.kr',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'secret',
  },
};

export default config;

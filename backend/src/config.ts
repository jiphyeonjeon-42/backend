import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  mode: process.env.MODE,
  database: {
    host: process.env.MODE === 'local' ? 'database-1.cspdeqcahl3r.ap-northeast-2.rds.amazonaws.com' : 'database',
    port: 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    dbName: process.env.MYSQL_DATABASE,
    // username: process.env.RDS_USERNAME,
    // password: process.env.RDS_PASSWORD,
    // dbName: process.env.RDS_DB_NAME,
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

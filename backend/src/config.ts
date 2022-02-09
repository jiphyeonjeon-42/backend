import dotenv from 'dotenv';

dotenv.config();

const config = {
  database: {
    host: process.env.MODE ? 'database' : 'localhost',
    port:  process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    dbName: process.env.MYSQL_DATABASE,
  },
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    redirectURL: process.env.REDIRECT_URL,
  },
};

export default config;
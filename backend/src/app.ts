import express, { Request, Response } from 'express';

const app = express();

app.get('/welcome', (req: Request, res: Response) => {
  res.send('welcome!');
});

app.listen('1234', () => {
  console.log(`
################################################
🛡️  Server listening on port: 1234🛡️
################################################
  `);
});

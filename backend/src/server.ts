import app from './app';
import scheduler from './utils/scheduler';

const port = '3000';

app.listen(port, () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: ${port}🛡️
  ################################################
    `);
  scheduler();
});

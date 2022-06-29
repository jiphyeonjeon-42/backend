import app from './app';
import scheduler from './utils/scheduler';

app.listen('3000', () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 3000🛡️
  ################################################
    `);
  scheduler();
});

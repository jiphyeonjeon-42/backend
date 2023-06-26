import app from './app';
import scheduler from './utils/scheduler';

const port = '3000';

app.listen(port, () => {
  // console.log(`
  // ################################################
  // 🛡️  Server listening on port: ${port}🛡️
  // ################################################
  //   `);
  // console.log('server loaded, shutting off');
  // process.exit(0);
  // scheduler();
});

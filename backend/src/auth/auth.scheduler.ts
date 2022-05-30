import * as schedule from 'node-schedule';
import slack from './auth.slack';

export const midnightScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 0;
  rule.minute = 0;
  schedule.scheduleJob(rule, async () => {
    await slack.updateSlackID();
  });
};

export default midnightScheduler;

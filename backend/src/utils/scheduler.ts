import * as schedule from 'node-schedule';
import * as slack from '../slack/slack.service';

export const midnightScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 0;
  rule.minute = 0;
  schedule.scheduleJob(rule, async () => {
    await slack.updateSlackId();
  });
};

export default midnightScheduler;

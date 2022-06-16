import * as schedule from 'node-schedule';
import * as slack from '../slack/slack.service';
import * as notifications from '../notifications/notifications.service';

import * as lendingsService from '../lendings/lendings.service';

const midnightScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 0;
  rule.minute = 0;
  schedule.scheduleJob(rule, async () => {
    await slack.updateSlackId();
  });
};

const noonScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 12;
  rule.minute = 0;
  schedule.scheduleJob(rule, async () => {
    await notifications.notifyReservation();
  });
};

const testScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 20;
  rule.minute = 33;
  schedule.scheduleJob(rule, async () => {
    lendingsService.create(1447, 76, 1440, '이상없음');
  });
};

export const scheduler = () => {
  midnightScheduler();
  noonScheduler();
  testScheduler();
};

export default scheduler;

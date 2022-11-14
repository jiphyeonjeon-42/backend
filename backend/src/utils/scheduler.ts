import * as schedule from 'node-schedule';
import * as slack from '../slack/slack.service';
import * as notifications from '../notifications/notifications.service';

const midnightScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 0;
  rule.minute = 42;
  rule.tz = 'Asia/Seoul';
  schedule.scheduleJob(rule, async () => {
    await slack.updateSlackId();
    await notifications.notifyReservationOverdue();
  });
};

const morningScheduler = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 9;
  rule.minute = 42;
  rule.tz = 'Asia/Seoul';
  schedule.scheduleJob(rule, async () => {
    await notifications.notifyReservation();
    await notifications.notifyReturningReminder();
    await notifications.notifyOverdue();
  });
};

export const scheduler = () => {
  midnightScheduler();
  morningScheduler();
};

export default scheduler;

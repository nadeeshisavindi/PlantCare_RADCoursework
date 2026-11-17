import cron from 'node-cron';
import { env } from '../config/env';
import { isEmailConfigured } from './email.service';
import { runReminderCheck } from './reminder.service';

export const startReminderScheduler = (): void => {
  if (!cron.validate(env.reminders.cron)) {
    console.error(`Invalid REMINDER_CRON "${env.reminders.cron}". Reminders are NOT scheduled.`);
    return;
  }

  const check = async (): Promise<void> => {
    try {
      const s = await runReminderCheck();
      if (s.created > 0) {
        console.log(`[reminders] created ${s.created} notification(s), emails sent ${s.sent}, failed ${s.failed}`);
      }
    } catch (err) {
      console.error('[reminders] check failed:', err);
    }
  };

  cron.schedule(env.reminders.cron, check);
  void check(); // also run once at startup so nothing waits for the first tick

  console.log(
    `Reminder scheduler started (${env.reminders.cron}). Emails ${isEmailConfigured() ? 'on' : 'off (in-app notifications only)'}`
  );
};

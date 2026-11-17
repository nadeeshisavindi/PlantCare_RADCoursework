import { env } from '../config/env';
import { CareTask } from '../models/careTask.model';
import { Notification } from '../models/notification.model';
import { Plant } from '../models/plant.model';
import { User } from '../models/user.model';
import { EmailStatus, NotificationType, TaskStatus } from '../types/enums';
import { isEmailConfigured, sendEmail } from './email.service';

const HOUR = 60 * 60 * 1000;
const MAX_LEAD_HOURS = 168; // matches the max allowed in user.notificationSettings
const OVERDUE_WINDOW_HOURS = 24 * 7; // do not email about tasks that are weeks old

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatWhen = (d: Date): string =>
  d.toLocaleString('en-GB', { timeZone: env.reminders.timezone, dateStyle: 'medium', timeStyle: 'short' });

export interface ReminderSummary {
  checked: number;
  created: number;
  sent: number;
  failed: number;
  skipped: number;
}

let running = false; // stops two runs overlapping if one is slow

export const runReminderCheck = async (now: Date = new Date()): Promise<ReminderSummary> => {
  const summary: ReminderSummary = { checked: 0, created: 0, sent: 0, failed: 0, skipped: 0 };
  if (running) return summary;
  running = true;

  try {
    // 1. Pending tasks that are overdue (recently) or due within the largest possible lead time
    const tasks = await CareTask.find({
      status: TaskStatus.PENDING,
      dueDate: {
        $gte: new Date(now.getTime() - OVERDUE_WINDOW_HOURS * HOUR),
        $lte: new Date(now.getTime() + MAX_LEAD_HOURS * HOUR),
      },
    }).lean();
    summary.checked = tasks.length;
    if (tasks.length === 0) return summary;

    // 2. Load the owners and plants in one query each (no N+1)
    const [users, plants] = await Promise.all([
      User.find({ _id: { $in: tasks.map((t) => t.owner) } }).lean(),
      Plant.find({ _id: { $in: tasks.map((t) => t.plant) } }).lean(),
    ]);
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const plantMap = new Map(plants.map((p) => [String(p._id), p]));

    for (const task of tasks) {
      const user = userMap.get(String(task.owner));
      const plant = plantMap.get(String(task.plant));
      if (!user || !plant) continue;

      const settings = user.notificationSettings;
      const leadHours = settings?.reminderLeadHours ?? env.reminders.defaultLeadHours;
      const isOverdue = task.dueDate.getTime() < now.getTime();
      const isUpcoming = !isOverdue && task.dueDate.getTime() - now.getTime() <= leadHours * HOUR;
      if (!isOverdue && !isUpcoming) continue;

      const type = isOverdue ? NotificationType.OVERDUE : NotificationType.UPCOMING;
      const when = formatWhen(task.dueDate);
      const title = isOverdue ? `Overdue: ${task.title}` : `Reminder: ${task.title}`;
      const message = isOverdue
        ? `${task.title} for ${plant.name} was due on ${when}.`
        : `${task.title} for ${plant.name} is due on ${when}.`;

      // 3. Duplicate protection: the unique index (task, type, dueDate) makes a second insert fail
      let notification;
      try {
        notification = await Notification.create({
          user: user._id,
          task: task._id,
          plant: plant._id,
          type,
          title,
          message,
          dueDate: task.dueDate,
          emailStatus: EmailStatus.PENDING,
        });
      } catch (err) {
        if ((err as { code?: number }).code === 11000) continue; // already reminded
        throw err;
      }
      summary.created += 1;

      // 4. Send the email (or record why we did not)
      if (settings?.emailEnabled === false || !isEmailConfigured()) {
        notification.emailStatus = EmailStatus.SKIPPED;
        notification.emailError = settings?.emailEnabled === false ? 'User turned emails off' : 'Email not set up (in-app only)';
        await notification.save();
        summary.skipped += 1;
        continue;
      }

      try {
        const heading = isOverdue ? 'Care task overdue' : 'Care task reminder';
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:480px">
            <h2 style="color:#166534">${heading}</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p><strong>${escapeHtml(task.title)}</strong> for <strong>${escapeHtml(plant.name)}</strong>
               ${isOverdue ? 'was due on' : 'is due on'} <strong>${escapeHtml(when)}</strong>.</p>
            ${task.notes ? `<p style="color:#555">Note: ${escapeHtml(task.notes)}</p>` : ''}
            <p style="color:#888;font-size:12px">PlantCare reminder</p>
          </div>`;
        await sendEmail(user.email, title, html, `Hi ${user.name},\n\n${message}\n\n- PlantCare`);
        notification.emailStatus = EmailStatus.SENT;
        notification.emailSentAt = new Date();
        summary.sent += 1;
      } catch (err) {
        notification.emailStatus = EmailStatus.FAILED;
        notification.emailError = (err instanceof Error ? err.message : 'Email failed').slice(0, 500);
        summary.failed += 1;
        console.error(`Reminder email failed for ${user.email}:`, notification.emailError);
      }
      await notification.save();
    }

    return summary;
  } finally {
    running = false;
  }
};

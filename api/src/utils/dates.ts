import { RecurrenceUnit } from '../types/enums';

// Adds `interval` days / weeks / months to a date (UTC).
// Months are clamped, so Jan 31 + 1 month = Feb 28/29 (not Mar 3).
export const addInterval = (date: Date, unit: RecurrenceUnit, interval: number): Date => {
  const result = new Date(date.getTime());

  switch (unit) {
    case RecurrenceUnit.DAILY:
      result.setUTCDate(result.getUTCDate() + interval);
      break;
    case RecurrenceUnit.WEEKLY:
      result.setUTCDate(result.getUTCDate() + 7 * interval);
      break;
    case RecurrenceUnit.MONTHLY: {
      const day = result.getUTCDate();
      result.setUTCDate(1);
      result.setUTCMonth(result.getUTCMonth() + interval);
      const lastDayOfMonth = new Date(
        Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
      ).getUTCDate();
      result.setUTCDate(Math.min(day, lastDayOfMonth));
      break;
    }
    default:
      break;
  }

  return result;
};

// Next due date of a recurring task. If the task was completed very late, missed
// occurrences are skipped so the next task is always in the future.
export const nextDueDate = (
  from: Date,
  unit: RecurrenceUnit,
  interval: number,
  now: Date = new Date()
): Date => {
  let next = addInterval(from, unit, interval);
  let guard = 0;
  while (next.getTime() <= now.getTime() && guard < 1000) {
    next = addInterval(next, unit, interval);
    guard += 1;
  }
  return next;
};

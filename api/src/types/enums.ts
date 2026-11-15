export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum CareType {
  WATERING = 'watering',
  FERTILIZING = 'fertilizing',
  PRUNING = 'pruning',
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum RecurrenceUnit {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum NotificationType {
  UPCOMING = 'upcoming',
  OVERDUE = 'overdue',
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum LightRequirement {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

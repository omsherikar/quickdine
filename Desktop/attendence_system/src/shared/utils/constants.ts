export const REDIS_KEYS = {
  ATTENDANCE: (date: string, classId: string) => `attendance:${date}:${classId}`,
  SYNC_QUEUE: (userId: string) => `sync:queue:${userId}`,
  LAST_SYNC: (userId: string) => `sync:last:${userId}`,
};

export const WEBSOCKET_EVENTS = {
  JOIN_CLASS: 'joinClass',
  LEAVE_CLASS: 'leaveClass',
  MARK_ATTENDANCE: 'markAttendance',
  SYNC_REQUEST: 'syncRequest',
  ATTENDANCE_UPDATE: 'attendanceUpdate',
  ERROR: 'error',
};

export const CACHE_TTL = {
  ATTENDANCE: 24 * 60 * 60, // 24 hours in seconds
  SYNC_QUEUE: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const SYNC_CONFIG = {
  MAX_RETRY_ATTEMPTS: 5,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 30000, // 30 seconds
};

export enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

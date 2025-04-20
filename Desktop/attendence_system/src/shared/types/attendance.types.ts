export interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  name: string;
  attendancePercentage: number;
} 
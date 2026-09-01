import { AttendanceStatus } from '../../constants/content.enum.js';

export interface IMarkAttendanceDTO {
  studentId: string;
  status: AttendanceStatus;
  attendanceMinutes?: number;
  joinedAt?: Date;
  leftAt?: Date;
  notes?: string;
}

export interface IBulkMarkAttendanceDTO {
  attendanceRecords: IMarkAttendanceDTO[];
}

export interface IProgramAttendanceSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalEligibleSessions: number;
  attendedSessions: number; // present + late
  absentSessions: number;
  excusedSessions: number;
  attendancePercentage: number;
}

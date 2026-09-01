import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class AttendanceController {
  public static markAttendance = async (req: Request, res: Response): Promise<Response> => {
    const sessionId = req.params.sessionId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const records = Array.isArray(req.body.attendanceRecords)
      ? req.body.attendanceRecords
      : [req.body];

    const result = await AttendanceService.markSessionAttendance(
      sessionId,
      userId,
      userRole,
      records
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Attendance marked/updated successfully',
      result,
      { count: result.length }
    );
  };

  public static getSessionAttendance = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const sessionId = req.params.sessionId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const attendances = await AttendanceService.getSessionAttendance(
      sessionId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live session attendance records retrieved successfully',
      attendances,
      { count: attendances.length }
    );
  };

  public static getMySessionAttendance = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const sessionId = req.params.sessionId as string;
    const studentId = req.user!.id;

    const attendance = await AttendanceService.getMySessionAttendance(
      sessionId,
      studentId
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      attendance
        ? 'Session attendance status retrieved successfully'
        : 'No attendance record found for this session',
      attendance
    );
  };

  public static getMyAttendanceAll = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const studentId = req.user!.id;
    const attendances = await AttendanceService.getMyAttendanceAll(studentId);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student attendance history retrieved successfully',
      attendances,
      { count: attendances.length }
    );
  };

  public static getProgramAttendanceSummary = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const summary = await AttendanceService.getProgramAttendanceSummary(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program student attendance summary calculated successfully',
      summary,
      { count: summary.length }
    );
  };
}

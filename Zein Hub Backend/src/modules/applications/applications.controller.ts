import { Request, Response } from 'express';
import { ApplicationsService } from './applications.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { ApplicationStatus } from '../../constants/applicationStatus.enum.js';

export class ApplicationsController {
  // Student Controllers
  public static submit = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const application = await ApplicationsService.submitApplication(studentId, req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Application submitted successfully. It is currently under review.',
      application
    );
  };

  public static getMyApplications = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const applications = await ApplicationsService.getMyApplications(studentId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'My applications retrieved successfully',
      applications,
      { count: applications.length }
    );
  };

  public static getMyApplicationById = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const applicationId = req.params.id as string;
    const application = await ApplicationsService.getMyApplicationById(studentId, applicationId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Application details retrieved successfully',
      application
    );
  };

  // Super Admin Controllers
  public static getAllAdmin = async (req: Request, res: Response): Promise<Response> => {
    const query = {
      programId: req.query.programId as string | undefined,
      studentId: req.query.studentId as string | undefined,
      status: req.query.status as ApplicationStatus | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const { applications, meta } = await ApplicationsService.getAllApplicationsAdmin(query);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Applications retrieved successfully',
      applications,
      meta
    );
  };

  public static getByIdAdmin = async (req: Request, res: Response): Promise<Response> => {
    const applicationId = req.params.id as string;
    const application = await ApplicationsService.getApplicationByIdAdmin(applicationId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Application details retrieved successfully',
      application
    );
  };

  public static review = async (req: Request, res: Response): Promise<Response> => {
    const applicationId = req.params.id as string;
    const reviewerId = req.user!.id;
    const result = await ApplicationsService.reviewApplication(
      applicationId,
      reviewerId,
      req.body
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Application status updated to '${req.body.status}' successfully`,
      result
    );
  };
}

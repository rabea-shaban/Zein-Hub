import { Request, Response } from 'express';
import { CertificatesService } from './certificates.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class CertificatesController {
  public static getMyCertificates = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const certificates = await CertificatesService.getMyCertificates(studentId);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student certificates retrieved successfully',
      certificates,
      { count: certificates.length }
    );
  };

  public static getCertificateById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const certificate = await CertificatesService.getCertificateById(
      id,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Certificate details retrieved successfully',
      certificate
    );
  };

  public static verifyCertificate = async (req: Request, res: Response): Promise<Response> => {
    const certificateNumber = req.params.certificateNumber as string;

    const verificationResult = await CertificatesService.verifyCertificatePublic(
      certificateNumber
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Certificate successfully verified and authenticated',
      verificationResult
    );
  };

  public static getAllAdmin = async (req: Request, res: Response): Promise<Response> => {
    const certificates = await CertificatesService.getAllCertificatesAdmin({
      search: req.query.search as string | undefined,
      isRevoked: req.query.isRevoked !== undefined ? req.query.isRevoked === 'true' : undefined,
    });

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Admin certificates list retrieved successfully',
      certificates,
      { count: certificates.length }
    );
  };

  public static issueCertificate = async (req: Request, res: Response): Promise<Response> => {
    const cert = await CertificatesService.issueCertificateByAdmin({
      studentId: req.body.studentId,
      programId: req.body.programId,
      finalGrade: req.body.finalGrade,
    });

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Certificate issued successfully',
      cert
    );
  };

  public static toggleRevoke = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const cert = await CertificatesService.toggleRevokeCertificate(id, req.body.reason);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      cert.isRevoked ? 'Certificate revoked successfully' : 'Certificate restored successfully',
      cert
    );
  };
}

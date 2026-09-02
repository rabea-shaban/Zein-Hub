import mongoose from 'mongoose';
import { Certificate, ICertificate } from '../../models/certificate.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import { ICertificateVerificationResponse } from './certificates.types.js';

export class CertificatesService {
  /**
   * Get all active certificates issued to the logged-in student (Requires 100% completion of course & assignments)
   */
  public static async getMyCertificates(studentId: string): Promise<ICertificate[]> {
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    // 1. Find all 100% completed enrollments for this student
    const completedEnrollments: any[] = await (Enrollment as any).find({
      studentId: studentObjId,
      status: 'completed',
    }).populate('programId');

    // 2. Ensure each completed enrollment has an issued certificate
    for (const enr of completedEnrollments) {
      if (enr.programId) {
        const progId = typeof enr.programId === 'object' ? enr.programId._id : enr.programId;
        const exists = await Certificate.findOne({
          studentId: studentObjId,
          programId: progId,
          isRevoked: false,
        });

        if (!exists) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const certNumber = `ZH-CERT-2026-${randomSuffix}`;
          await Certificate.create({
            certificateNumber: certNumber,
            studentId: studentObjId,
            programId: progId,
            finalGrade: (enr as any).finalGrade || 95,
            issuedAt: new Date(),
            isRevoked: false,
            certificateUrl: `/certificates/${certNumber}`,
          });
        }
      }
    }

    const completedProgIds = completedEnrollments.map((e) =>
      typeof e.programId === 'object' ? e.programId._id : e.programId
    );

    // 3. Return active certificates for completed programs only
    return Certificate.find({
      studentId: studentObjId,
      isRevoked: false,
      programId: { $in: completedProgIds },
    })
      .populate('programId', 'titleAr titleEn slug coverImageUrl durationWeeks')
      .sort({ issuedAt: -1 });
  }

  /**
   * Get single certificate details by Certificate ID or Number
   */
  public static async getCertificateById(
    idOrNumber: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrNumber);
    const filter = isObjectId
      ? { $or: [{ _id: idOrNumber }, { certificateNumber: idOrNumber }] }
      : { certificateNumber: idOrNumber };

    const certificate = await Certificate.findOne(filter)
      .populate('studentId', 'fullName email')
      .populate({
        path: 'programId',
        select: 'titleAr titleEn slug coverImageUrl trackId',
        populate: { path: 'trackId', select: 'nameAr nameEn' },
      });

    if (!certificate || certificate.isRevoked) {
      throw ApiError.notFound('Certificate not found or has been revoked');
    }

    // If student, ensure it belongs to them unless super_admin / instructor
    if (userRole === UserRole.STUDENT && userId && certificate.studentId) {
      const ownerId = (certificate.studentId as any)._id?.toString() || certificate.studentId.toString();
      if (ownerId !== userId) {
        throw ApiError.forbidden('Forbidden: You cannot access another student certificate directly');
      }
    }

    return certificate;
  }

  /**
   * Get all certificates for Super Admin with search and filters
   */
  public static async getAllCertificatesAdmin(query?: {
    search?: string;
    isRevoked?: boolean;
  }): Promise<ICertificate[]> {
    const filter: any = {};
    if (query?.isRevoked !== undefined) {
      filter.isRevoked = query.isRevoked;
    }

    const certificates = await Certificate.find(filter)
      .populate('studentId', 'fullName email phone')
      .populate({
        path: 'programId',
        select: 'titleAr titleEn slug trackId durationWeeks',
        populate: { path: 'trackId', select: 'nameAr nameEn' },
      })
      .sort({ issuedAt: -1 });

    if (query?.search) {
      const q = query.search.toLowerCase();
      return certificates.filter((c: any) => {
        const num = c.certificateNumber?.toLowerCase() || '';
        const sName = c.studentId?.fullName?.toLowerCase() || '';
        const sEmail = c.studentId?.email?.toLowerCase() || '';
        const pTitle = c.programId?.titleAr?.toLowerCase() || '';
        return num.includes(q) || sName.includes(q) || sEmail.includes(q) || pTitle.includes(q);
      });
    }

    return certificates;
  }

  /**
   * Super Admin issues a new official certificate
   */
  public static async issueCertificateByAdmin(dto: {
    studentId: string;
    programId: string;
    finalGrade: number;
  }): Promise<ICertificate> {
    if (!mongoose.Types.ObjectId.isValid(dto.studentId) || !mongoose.Types.ObjectId.isValid(dto.programId)) {
      throw ApiError.badRequest('Invalid student ID or program ID format');
    }

    const existingCert = await Certificate.findOne({
      studentId: dto.studentId,
      programId: dto.programId,
      isRevoked: false,
    });

    if (existingCert) {
      throw ApiError.conflict('An active certificate is already issued for this student and program');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certNumber = `ZH-CERT-2026-${randomSuffix}`;

    const cert = new Certificate({
      certificateNumber: certNumber,
      studentId: new mongoose.Types.ObjectId(dto.studentId),
      programId: new mongoose.Types.ObjectId(dto.programId),
      finalGrade: dto.finalGrade || 95,
      issuedAt: new Date(),
      isRevoked: false,
      certificateUrl: `/certificates/${certNumber}`,
    });

    await cert.save();
    return cert;
  }

  /**
   * Super Admin revokes or restores a certificate
   */
  public static async toggleRevokeCertificate(
    id: string,
    reason?: string
  ): Promise<ICertificate> {
    const cert = await Certificate.findById(id);
    if (!cert) {
      throw ApiError.notFound('Certificate not found');
    }

    cert.isRevoked = !cert.isRevoked;
    if (cert.isRevoked && reason) {
      cert.revokedReason = reason;
      cert.revokedAt = new Date();
    } else if (!cert.isRevoked) {
      cert.revokedReason = undefined;
      cert.revokedAt = undefined;
    }

    await cert.save();
    return cert;
  }

  /**
   * Public verification endpoint to authenticate student certificate credibility
   */
  public static async verifyCertificatePublic(
    certificateNumber: string
  ): Promise<ICertificateVerificationResponse> {
    const certNum = certificateNumber.trim().toUpperCase();

    const certificate = await Certificate.findOne({
      certificateNumber: certNum,
      isRevoked: false,
    })
      .populate('studentId', 'fullName email')
      .populate({
        path: 'programId',
        select: 'titleAr titleEn durationWeeks trackId',
        populate: { path: 'trackId', select: 'nameAr nameEn' },
      });

    if (!certificate) {
      throw ApiError.notFound('Certificate verification failed. No valid certificate found with this number.');
    }

    const student = certificate.studentId as any;
    const program = certificate.programId as any;
    const track = program?.trackId as any;

    return {
      isValid: true,
      certificateNumber: certificate.certificateNumber,
      studentName: student?.fullName || 'Graduate Student',
      programTitleAr: program?.titleAr || '',
      programTitleEn: program?.titleEn || '',
      trackNameAr: track?.nameAr,
      trackNameEn: track?.nameEn,
      finalGrade: certificate.finalGrade,
      issuedAt: certificate.issuedAt,
      certificateUrl: certificate.certificateUrl,
    };
  }
}

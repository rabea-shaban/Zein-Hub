export interface ICertificateVerificationResponse {
  isValid: boolean;
  certificateNumber: string;
  studentName: string;
  programTitleAr: string;
  programTitleEn: string;
  trackNameAr?: string;
  trackNameEn?: string;
  finalGrade: number;
  issuedAt: Date;
  certificateUrl: string;
}

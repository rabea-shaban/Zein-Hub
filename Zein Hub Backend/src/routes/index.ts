import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import tracksRoutes from '../modules/tracks/tracks.routes.js';
import programsRoutes from '../modules/programs/programs.routes.js';
import instructorsRoutes from '../modules/instructors/instructors.routes.js';
import applicationsRoutes from '../modules/applications/applications.routes.js';
import enrollmentsRoutes from '../modules/enrollments/enrollments.routes.js';
import courseModulesRoutes from '../modules/courseModules/courseModules.routes.js';
import lessonsRoutes from '../modules/lessons/lessons.routes.js';
import quizzesRoutes from '../modules/quizzes/quizzes.routes.js';
import assignmentsRoutes from '../modules/assignments/assignments.routes.js';
import submissionsRoutes from '../modules/assignments/submissions.routes.js';
import progressRoutes from '../modules/progress/progress.routes.js';
import certificatesRoutes from '../modules/certificates/certificates.routes.js';
import liveSessionsRoutes from '../modules/liveSessions/liveSessions.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import reviewsRoutes from '../modules/reviews/reviews.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';

const router = Router();

// Mount modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.use('/programs', programsRoutes);
router.use('/instructors', instructorsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/course-modules', courseModulesRoutes);
router.use('/modules', courseModulesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/progress', progressRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/sessions', liveSessionsRoutes);
router.use('/live-sessions', liveSessionsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/admin', analyticsRoutes);
router.use('/contact', contactRoutes);

export default router;

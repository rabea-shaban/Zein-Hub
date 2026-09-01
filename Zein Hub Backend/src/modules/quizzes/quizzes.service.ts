import mongoose from 'mongoose';
import { Quiz, IQuiz } from '../../models/quiz.model.js';
import { Question, IQuestion } from '../../models/question.model.js';
import { QuizAttempt } from '../../models/quizAttempt.model.js';
import { Lesson } from '../../models/lesson.model.js';
import { Progress } from '../../models/progress.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { QuestionType } from '../../constants/content.enum.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateQuizDTO,
  IUpdateQuizDTO,
  ICreateQuestionDTO,
  IUpdateQuestionDTO,
  ISubmitQuizDTO,
} from './quizzes.types.js';

export class QuizzesService {
  /**
   * Create a new quiz for a lesson
   */
  public static async createQuiz(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateQuizDTO
  ): Promise<IQuiz> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    const quiz = new Quiz({
      lessonId: lesson._id,
      programId: lesson.programId,
      title: dto.title.trim(),
      description: dto.description?.trim() || undefined,
      passingScore: dto.passingScore ?? 70,
      maxAttempts: dto.maxAttempts ?? 3,
      durationMinutes: dto.durationMinutes ?? 30,
      isPublished: dto.isPublished ?? true,
    });

    await quiz.save();
    return quiz;
  }

  /**
   * Get Quiz by ID with questions (Hides isCorrect & explanation from students before submission)
   */
  public static async getQuizById(
    quizId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw ApiError.badRequest('Invalid quiz ID format');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    // Access check: User must be Super Admin, Assigned Instructor, or Enrolled Student
    const hasAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    if (!hasAccess) {
      throw ApiError.forbidden('Active enrollment required to access this quiz');
    }

    const isPrivileged = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.INSTRUCTOR;
    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1, createdAt: 1 });

    const sanitizedQuestions = questions.map((q) => {
      if (isPrivileged) {
        return q.toObject();
      }

      // Hide isCorrect and explanation for students taking the quiz
      const sanitizedOptions = q.options.map((opt: any, index: number) => ({
        index,
        text: opt.text,
      }));

      return {
        _id: q._id,
        quizId: q.quizId,
        prompt: q.prompt,
        type: q.type,
        points: q.points,
        order: q.order,
        options: sanitizedOptions,
      };
    });

    return {
      quiz: quiz.toObject(),
      totalQuestions: questions.length,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Update quiz settings
   */
  public static async updateQuiz(
    quizId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateQuizDTO
  ): Promise<IQuiz> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw ApiError.badRequest('Invalid quiz ID format');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    if (dto.title) quiz.title = dto.title.trim();
    if (dto.description !== undefined) quiz.description = dto.description?.trim() || undefined;
    if (dto.passingScore !== undefined) quiz.passingScore = dto.passingScore;
    if (dto.maxAttempts !== undefined) quiz.maxAttempts = dto.maxAttempts;
    if (dto.durationMinutes !== undefined) quiz.durationMinutes = dto.durationMinutes;
    if (dto.isPublished !== undefined) quiz.isPublished = dto.isPublished;

    await quiz.save();
    return quiz;
  }

  /**
   * Delete quiz and associated questions
   */
  public static async deleteQuiz(
    quizId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw ApiError.badRequest('Invalid quiz ID format');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    await Question.deleteMany({ quizId: quiz._id });
    await QuizAttempt.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(quizId);

    return { deleted: true };
  }

  /**
   * Add a question to a quiz
   */
  public static async addQuestion(
    quizId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateQuestionDTO
  ): Promise<IQuestion> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw ApiError.badRequest('Invalid quiz ID format');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    let order = dto.order;
    if (order === undefined) {
      const count = await Question.countDocuments({ quizId: quiz._id } as any);
      order = count + 1;
    }

    const question = new Question({
      quizId: quiz._id,
      prompt: dto.prompt.trim(),
      type: dto.type || QuestionType.MCQ,
      options: dto.options.map((opt) => ({
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      })),
      explanation: dto.explanation?.trim() || undefined,
      points: dto.points ?? 1,
      order,
    });

    await question.save();
    return question;
  }

  /**
   * Update question
   */
  public static async updateQuestion(
    questionId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateQuestionDTO
  ): Promise<IQuestion> {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw ApiError.badRequest('Invalid question ID format');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    const quiz = await Quiz.findById(question.quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    if (dto.prompt) question.prompt = dto.prompt.trim();
    if (dto.type) question.type = dto.type;
    if (dto.explanation !== undefined) question.explanation = dto.explanation?.trim() || undefined;
    if (dto.points !== undefined) question.points = dto.points;
    if (dto.order !== undefined) question.order = dto.order;
    if (dto.options) {
      question.options = dto.options.map((opt) => ({
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      }));
    }

    await question.save();
    return question;
  }

  /**
   * Delete question
   */
  public static async deleteQuestion(
    questionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw ApiError.badRequest('Invalid question ID format');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    const quiz = await Quiz.findById(question.quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      quiz.programId.toString()
    );

    await Question.findByIdAndDelete(questionId);
    return { deleted: true };
  }

  /**
   * Student submits quiz answers: Auto-grading, QuizAttempt record, and Progress integration
   */
  public static async submitQuiz(
    quizId: string,
    studentId: string,
    dto: ISubmitQuizDTO
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw ApiError.badRequest('Invalid quiz ID format');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    // Check active enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      programId: quiz.programId,
      status: { $in: ['active', 'completed'] },
    } as any);

    if (!enrollment) {
      throw ApiError.forbidden('Active enrollment required to submit this quiz');
    }

    // Check attempt limits
    const previousAttemptsCount = await QuizAttempt.countDocuments({
      studentId,
      quizId: quiz._id,
    } as any);

    if (quiz.maxAttempts && previousAttemptsCount >= quiz.maxAttempts) {
      throw ApiError.badRequest(
        `Maximum attempt limit (${quiz.maxAttempts}) reached for this quiz`
      );
    }

    const questions = await Question.find({ quizId: quiz._id });
    if (questions.length === 0) {
      throw ApiError.badRequest('This quiz currently has no questions');
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const answerBreakdown: any[] = [];

    for (const question of questions) {
      totalPoints += question.points;
      const submittedAnswer = dto.answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );

      const selectedIndices = submittedAnswer?.selectedOptionIndices || [];
      const correctIndices = question.options
        .map((opt, idx) => (opt.isCorrect ? idx : -1))
        .filter((idx) => idx !== -1);

      const isCorrect =
        selectedIndices.length === correctIndices.length &&
        selectedIndices.every((idx) => correctIndices.includes(idx));

      const pointsEarned = isCorrect ? question.points : 0;
      earnedPoints += pointsEarned;

      answerBreakdown.push({
        questionId: question._id,
        prompt: question.prompt,
        selectedOptionIndices: selectedIndices,
        correctOptionIndices: correctIndices,
        isCorrect,
        pointsEarned,
        maxPoints: question.points,
        explanation: question.explanation,
      });
    }

    const scorePercentage = Math.round((earnedPoints / (totalPoints || 1)) * 100);
    const passed = scorePercentage >= quiz.passingScore;
    const attemptNumber = previousAttemptsCount + 1;

    // 1. Record QuizAttempt
    const attempt = new QuizAttempt({
      studentId: new mongoose.Types.ObjectId(studentId),
      quizId: quiz._id,
      programId: quiz.programId,
      answers: answerBreakdown.map((b) => ({
        questionId: b.questionId,
        selectedOptionIds: b.selectedOptionIndices.map((i: number) => i.toString()),
        isCorrect: b.isCorrect,
        pointsEarned: b.pointsEarned,
      })),
      score: scorePercentage,
      pointsEarned: earnedPoints,
      totalPoints,
      passed,
      attemptNumber,
      submittedAt: new Date(),
    });
    await attempt.save();

    // 2. Update Student Progress
    let progress = await Progress.findOne({ studentId, programId: quiz.programId } as any);
    if (!progress) {
      progress = new Progress({
        studentId: new mongoose.Types.ObjectId(studentId),
        programId: quiz.programId,
        completedLessons: [],
        quizProgress: [],
        completionPercentage: 0,
        lastActivityAt: new Date(),
      });
    }

    const existingQuizProgress = progress.quizProgress.find(
      (qp) => qp.quizId.toString() === quiz._id.toString()
    );

    if (existingQuizProgress) {
      existingQuizProgress.highestScore = Math.max(
        existingQuizProgress.highestScore,
        scorePercentage
      );
      existingQuizProgress.passed = existingQuizProgress.passed || passed;
      existingQuizProgress.attemptsCount += 1;
      existingQuizProgress.lastAttemptAt = new Date();
    } else {
      progress.quizProgress.push({
        quizId: quiz._id,
        highestScore: scorePercentage,
        passed,
        attemptsCount: 1,
        lastAttemptAt: new Date(),
      });
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    return {
      attemptId: attempt._id,
      attemptNumber,
      totalQuestions: questions.length,
      totalPoints,
      earnedPoints,
      scorePercentage,
      passingScore: quiz.passingScore,
      passed,
      detailedResults: answerBreakdown,
    };
  }
}

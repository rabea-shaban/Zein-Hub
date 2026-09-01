import { Request, Response } from 'express';
import { QuizzesService } from './quizzes.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class QuizzesController {
  public static createQuiz = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.lessonId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const quiz = await QuizzesService.createQuiz(
      lessonId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Quiz created successfully',
      quiz
    );
  };

  public static getQuizById = async (req: Request, res: Response): Promise<Response> => {
    const quizId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const quizData = await QuizzesService.getQuizById(
      quizId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Quiz retrieved successfully',
      quizData
    );
  };

  public static updateQuiz = async (req: Request, res: Response): Promise<Response> => {
    const quizId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const quiz = await QuizzesService.updateQuiz(
      quizId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Quiz settings updated successfully',
      quiz
    );
  };

  public static deleteQuiz = async (req: Request, res: Response): Promise<Response> => {
    const quizId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await QuizzesService.deleteQuiz(
      quizId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Quiz and associated questions deleted successfully',
      result
    );
  };

  public static addQuestion = async (req: Request, res: Response): Promise<Response> => {
    const quizId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const question = await QuizzesService.addQuestion(
      quizId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Question added to quiz successfully',
      question
    );
  };

  public static updateQuestion = async (req: Request, res: Response): Promise<Response> => {
    const questionId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const question = await QuizzesService.updateQuestion(
      questionId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Question updated successfully',
      question
    );
  };

  public static deleteQuestion = async (req: Request, res: Response): Promise<Response> => {
    const questionId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await QuizzesService.deleteQuestion(
      questionId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Question deleted successfully',
      result
    );
  };

  public static submitQuiz = async (req: Request, res: Response): Promise<Response> => {
    const quizId = req.params.id as string;
    const studentId = req.user!.id;

    const result = await QuizzesService.submitQuiz(
      quizId,
      studentId,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      result.passed
        ? `Congratulations! You passed the quiz with ${result.scorePercentage}%`
        : `Quiz submitted. Score: ${result.scorePercentage}%. Passing score is ${result.passingScore}%`,
      result
    );
  };
}

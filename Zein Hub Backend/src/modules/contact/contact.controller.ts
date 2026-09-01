import { Request, Response } from 'express';
import { ContactService } from './contact.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { ContactMessageStatus } from '../../models/contactMessage.model.js';

export class ContactController {
  /**
   * Public: Submit contact message
   */
  public static createContactMessage = async (req: Request, res: Response): Promise<Response> => {
    const message = await ContactService.createMessage(req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'تم إرسال استفسارك بنجاح، سيقوم الفريق بالتواصل معك',
      message
    );
  };

  /**
   * Super Admin: Get all messages
   */
  public static getAllContactMessages = async (req: Request, res: Response): Promise<Response> => {
    const { status, search, page, limit } = req.query;
    const result = await ContactService.getAllMessages({
      status: status as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Contact messages retrieved successfully',
      result.messages,
      result.meta
    );
  };

  /**
   * Super Admin: Get single message
   */
  public static getContactMessageById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const message = await ContactService.getMessageById(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Contact message details retrieved',
      message
    );
  };

  /**
   * Super Admin: Update status & notes
   */
  public static updateContactMessageStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const { status, adminNotes } = req.body;
    const message = await ContactService.updateStatus(id, status as ContactMessageStatus, adminNotes);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Message status updated successfully',
      message
    );
  };

  /**
   * Super Admin: Delete message
   */
  public static deleteContactMessage = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    await ContactService.deleteMessage(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Message deleted successfully',
      null
    );
  };
}

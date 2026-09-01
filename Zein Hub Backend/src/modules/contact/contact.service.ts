import {
  ContactMessage,
  IContactMessage,
  ContactMessageStatus,
} from '../../models/contactMessage.model.js';
import { ApiError } from '../../utils/apiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export interface ICreateContactDTO {
  fullName: string;
  email: string;
  phone: string;
  governorate: string;
  inquiryType: string;
  message: string;
}

export class ContactService {
  /**
   * Generate a unique ticket ID: ZH-INQ-XXXX
   */
  private static generateTicketId(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ZH-INQ-${random}`;
  }

  /**
   * Submit a new contact inquiry
   */
  public static async createMessage(data: ICreateContactDTO): Promise<IContactMessage> {
    let ticketId = this.generateTicketId();

    // Ensure uniqueness
    let exists = await ContactMessage.findOne({ ticketId });
    while (exists) {
      ticketId = this.generateTicketId();
      exists = await ContactMessage.findOne({ ticketId });
    }

    const message = await ContactMessage.create({
      ...data,
      ticketId,
      status: ContactMessageStatus.NEW,
    });

    return message;
  }

  /**
   * Get all messages with filtering and pagination for Admin Dashboard
   */
  public static async getAllMessages(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    messages: IContactMessage[];
    meta: { total: number; page: number; limit: number; totalPages: number; unreadCount: number };
  }> {
    const filter: Record<string, any> = {};

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { ticketId: regex },
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { inquiryType: regex },
        { message: regex },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [messages, total, unreadCount] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContactMessage.countDocuments(filter),
      ContactMessage.countDocuments({ status: ContactMessageStatus.NEW }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      messages,
      meta: {
        total,
        page,
        limit,
        totalPages,
        unreadCount,
      },
    };
  }

  /**
   * Get a single message by ID
   */
  public static async getMessageById(id: string): Promise<IContactMessage> {
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    }
    return message;
  }

  /**
   * Update message status and admin notes
   */
  public static async updateStatus(
    id: string,
    status: ContactMessageStatus,
    adminNotes?: string
  ): Promise<IContactMessage> {
    const message = await ContactMessage.findById(id);
    if (!message) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    }

    message.status = status;
    if (adminNotes !== undefined) {
      message.adminNotes = adminNotes;
    }
    if (status === ContactMessageStatus.REPLIED && !message.repliedAt) {
      message.repliedAt = new Date();
    }

    await message.save();
    return message;
  }

  /**
   * Delete a message
   */
  public static async deleteMessage(id: string): Promise<void> {
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contact message not found');
    }
  }
}

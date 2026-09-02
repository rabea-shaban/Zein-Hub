import { Request, Response } from 'express';
import { StorageService } from '../../services/storage.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new ApiError('Image file is required (field name: image or file)', HTTP_STATUS.BAD_REQUEST);
    }

    const folder = (req.query.folder as string) || (req.body.folder as string) || 'programs';
    const result = await StorageService.uploadImage(file, folder);

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Image uploaded to Supabase Storage successfully',
      {
        url: result.url,
        image: result.url,
        path: result.path,
        fileName: result.fileName,
        size: result.size,
        mimeType: result.mimeType,
      }
    );
  }

  static async deleteImage(req: Request, res: Response) {
    const path = (req.body.path as string) || (req.query.path as string);
    if (!path) {
      throw new ApiError('File path is required to delete', HTTP_STATUS.BAD_REQUEST);
    }

    const deleted = await StorageService.deleteFile(path);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      deleted ? 'File deleted successfully from Supabase' : 'Failed to delete file',
      { deleted, path }
    );
  }
}

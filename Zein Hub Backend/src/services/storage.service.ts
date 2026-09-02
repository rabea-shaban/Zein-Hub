import crypto from 'crypto';
import { supabase } from '../config/supabase.config.js';
import { ENV } from '../config/env.config.js';
import { ApiError } from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export interface UploadResult {
  path: string;
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private static bucketName = ENV.SUPABASE_BUCKET || 'zein-hub-images';

  /**
   * Upload an image buffer directly to Supabase Storage
   */
  static async uploadImage(file: Express.Multer.File, folder = 'programs'): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No file buffer provided for upload');
    }

    const extension = file.originalname.split('.').pop() || 'webp';
    const cleanExt = extension.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${cleanExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error('[StorageService] Supabase Upload Error:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Supabase Storage Upload failed: ${error.message}`);
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrlData.publicUrl,
      fileName,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete a file from Supabase Storage by path
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) return false;
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('[StorageService] Supabase Delete Error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('[StorageService] Delete Exception:', e);
      return false;
    }
  }
}

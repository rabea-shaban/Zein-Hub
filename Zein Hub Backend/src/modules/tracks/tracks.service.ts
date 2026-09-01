import mongoose from 'mongoose';
import { Track, ITrack } from '../../models/track.model.js';
import { Program } from '../../models/program.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ICreateTrackDTO, IUpdateTrackDTO, ITrackFilterQuery } from './tracks.types.js';

export class TracksService {
  /**
   * Helper to generate a slug from English name if not provided
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get all active/filtered tracks with program statistics
   */
  public static async getAllTracks(query: ITrackFilterQuery = {}): Promise<any[]> {
    const filter: Record<string, any> = {};

    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { nameAr: searchRegex },
        { nameEn: searchRegex },
        { descriptionAr: searchRegex },
        { descriptionEn: searchRegex },
      ];
    }

    const tracks = await Track.find(filter).sort({ order: 1, createdAt: 1 });

    // Attach program count to each track
    const tracksWithStats = await Promise.all(
      tracks.map(async (track) => {
        const totalPrograms = await Program.countDocuments({ trackId: track._id, isActive: true } as any);
        const openPrograms = await Program.countDocuments({ trackId: track._id, status: 'open', isActive: true } as any);

        return {
          ...track.toObject(),
          stats: {
            totalPrograms,
            openPrograms,
          },
        };
      })
    );

    return tracksWithStats;
  }

  /**
   * Get single track by MongoDB ObjectId or Slug, including its programs
   */
  public static async getTrackByIdOrSlug(idOrSlug: string): Promise<any> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter: any = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] }
      : { slug: idOrSlug.toLowerCase() };

    const track = await Track.findOne(filter);
    if (!track) {
      throw ApiError.notFound(`Track with identifier '${idOrSlug}' not found`);
    }

    // Get programs under this track
    const programs = await Program.find({ trackId: track._id, isActive: true } as any)
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    return {
      track: track.toObject(),
      programs,
    };
  }

  /**
   * Create a new track (Super Admin only)
   */
  public static async createTrack(dto: ICreateTrackDTO): Promise<ITrack> {
    const slug = dto.slug ? dto.slug.toLowerCase().trim() : this.generateSlug(dto.nameEn);

    const existingSlug = await Track.findOne({ slug });
    if (existingSlug) {
      throw ApiError.conflict(`Track with slug '${slug}' already exists`);
    }

    const track = new Track({
      nameAr: dto.nameAr.trim(),
      nameEn: dto.nameEn.trim(),
      slug,
      descriptionAr: dto.descriptionAr?.trim(),
      descriptionEn: dto.descriptionEn?.trim(),
      iconUrl: dto.iconUrl?.trim() || null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    await track.save();
    return track;
  }

  /**
   * Update an existing track (Super Admin only)
   */
  public static async updateTrack(id: string, dto: IUpdateTrackDTO): Promise<ITrack> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid track ID format');
    }

    const track = await Track.findById(id);
    if (!track) {
      throw ApiError.notFound('Track not found');
    }

    if (dto.slug && dto.slug.toLowerCase() !== track.slug) {
      const existingSlug = await Track.findOne({ slug: dto.slug.toLowerCase(), _id: { $ne: id } });
      if (existingSlug) {
        throw ApiError.conflict(`Track with slug '${dto.slug}' already exists`);
      }
      track.slug = dto.slug.toLowerCase().trim();
    }

    if (dto.nameAr) track.nameAr = dto.nameAr.trim();
    if (dto.nameEn) track.nameEn = dto.nameEn.trim();
    if (dto.descriptionAr !== undefined) track.descriptionAr = dto.descriptionAr?.trim() || undefined;
    if (dto.descriptionEn !== undefined) track.descriptionEn = dto.descriptionEn?.trim() || undefined;
    if (dto.iconUrl !== undefined) track.iconUrl = dto.iconUrl?.trim() || undefined;
    if (dto.order !== undefined) track.order = dto.order;
    if (dto.isActive !== undefined) track.isActive = dto.isActive;

    await track.save();
    return track;
  }

  /**
   * Delete or deactivate a track (Super Admin only)
   */
  public static async deleteTrack(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid track ID format');
    }

    const track = await Track.findById(id);
    if (!track) {
      throw ApiError.notFound('Track not found');
    }

    // Check if there are programs linked to this track
    const linkedProgramsCount = await Program.countDocuments({ trackId: id } as any);
    if (linkedProgramsCount > 0) {
      // Soft-delete / deactivate track instead of hard delete to preserve relational integrity
      track.isActive = false;
      await track.save();
      return { deleted: true };
    }

    await Track.findByIdAndDelete(id);
    return { deleted: true };
  }
}

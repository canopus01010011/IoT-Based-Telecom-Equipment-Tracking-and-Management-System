import type { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/uploadService.js';
import { AIService } from '../services/aiService.js';
import { Equipment, Mission } from '../models/index.js';

export class UploadController {
  /**
   * POST /api/upload/equipment/:equipmentId
   * Upload photo for equipment
   */
  static async uploadEquipmentPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No photo uploaded' });
      }

      // Check if equipment exists
      const equipment = await Equipment.findByPk(equipmentId as string);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Validate photo with AI
      const validation = await AIService.validatePhoto(file.buffer, file.originalname);

      if (!validation.valid) {
        return res.status(400).json({
          error: 'Photo validation failed',
          issues: validation.issues,
          score: validation.score,
        });
      }

      // Upload to Cloudinary
      const uploadResult = await UploadService.uploadEquipmentPhoto(file.buffer, equipmentId as string);

      // Update equipment with photo URL
      await equipment.update({
        avatar_url: uploadResult.secure_url,
      } );

      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          validation: validation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/upload/delivery/:missionId
   * Upload delivery proof photo
   */
  static async uploadDeliveryPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No photo uploaded' });
      }

      // Check if mission exists
      const mission = await Mission.findByPk(missionId as string);
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }

      // Validate photo with AI
      const validation = await AIService.validatePhoto(file.buffer, file.originalname);

      if (!validation.valid) {
        return res.status(400).json({
          error: 'Photo validation failed',
          issues: validation.issues,
          score: validation.score,
        });
      }

      // Upload to Cloudinary
      const uploadResult = await UploadService.uploadDeliveryPhoto(file.buffer, missionId as string);

      res.json({
        success: true,
        message: 'Delivery proof uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          validation: validation,
          missionId: missionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/upload/validate-only
   * Only validate photo without uploading
   */
  static async validateOnly(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No photo provided' });
      }

      const validation = await AIService.validatePhoto(file.buffer, file.originalname);

      res.json({
        success: true,
        validation: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/upload/multiple
   * Upload multiple photos
   */
  static async uploadMultiplePhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const { missionId } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No photos uploaded' });
      }

      const uploads = [];
      const validationResults = [];

      for (const file of files) {
        // Validate each photo
        const validation = await AIService.validatePhoto(file.buffer, file.originalname);
        validationResults.push(validation);

        if (validation.valid) {
          // Upload to Cloudinary
          const uploadResult = await UploadService.uploadDeliveryPhoto(file.buffer, missionId || 'general');
          uploads.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          });
        }
      }

      res.json({
        success: true,
        message: `${uploads.length} of ${files.length} photos uploaded successfully`,
        data: {
          uploaded: uploads,
          validation: validationResults,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
import Joi from 'joi';

export const createMissionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  started_at: Joi.date().required(),
  technician_id: Joi.string().uuid().required(),
  driver_id: Joi.string().uuid().required(),
  equipment_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).default(1),  // ✅ ADD THIS
  site_id: Joi.string().uuid().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  qr_code: Joi.string().uuid().required(),
});

export const updateMissionSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  started_at: Joi.date().optional(),
  technician_id: Joi.string().uuid().optional(),
  driver_id: Joi.string().uuid().optional(),
  equipment_id: Joi.string().uuid().optional(),
  quantity: Joi.number().integer().min(1).optional(),  // ✅ ADD THIS
  site_id: Joi.string().uuid().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  qr_code: Joi.string().uuid().required(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('in_transit', 'driver_scanned', 'delivered', 'cancelled')
    .required(),
});
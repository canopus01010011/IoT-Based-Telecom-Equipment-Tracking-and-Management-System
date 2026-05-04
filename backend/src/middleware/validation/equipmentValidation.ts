import Joi from 'joi';

export const createEquipmentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  serial_number: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),  // ✅ ADD THIS
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'lost').default('available'),
  device_id: Joi.string().optional(),
  site_id: Joi.string().uuid().optional(),
});

export const updateEquipmentSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().optional(),
  serial_number: Joi.string().optional(),
  quantity: Joi.number().integer().min(1).optional(),  // ✅ ADD THIS
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'lost').optional(),
  device_id: Joi.string().optional(),
  site_id: Joi.string().uuid().optional(),
});
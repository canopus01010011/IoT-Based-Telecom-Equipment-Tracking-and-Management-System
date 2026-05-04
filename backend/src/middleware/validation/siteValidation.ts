import Joi from 'joi';

export const createSiteSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  contact_person: Joi.string().required(),
  contact_phone: Joi.string().required(),
});

export const updateSiteSchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  contact_person: Joi.string().optional(),
  contact_phone: Joi.string().optional(),
});
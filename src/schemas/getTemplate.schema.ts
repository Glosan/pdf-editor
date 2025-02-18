import Joi from "joi";

export const getTemplateSchema = Joi.number().positive().required();

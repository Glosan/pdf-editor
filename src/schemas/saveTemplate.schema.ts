import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     SaveTemplate:
 *       type: object
 *       required:
 *         - name
 *         - template
 *         - sql
 *         - archived
 *       properties:
 *         id:
 *           type: number
 *           description: Template identifier
 *         name:
 *           type: string
 *           description: Name of the template
 *         template:
 *           type: ReportBro object
 *           description: The template content exported by ReportBro
 *         sql:
 *           type: string
 *           description: SQL for receiving data
 *         archived:
 *           type: boolean
 *           description: is archived 1/0
 */

export const saveTemplateSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required().min(3),
  template: Joi.object().required(),
  sql: Joi.string().allow("").required(),
  archived: Joi.boolean().required(),
});

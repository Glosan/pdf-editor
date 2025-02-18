import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     SaveNewTemplate:
 *       type: object
 *       required:
 *         - name
 *         - template
 *         - sql
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the template
 *         template:
 *           type: ReportBro object
 *           description: The template content exported by ReportBro
 *         sql:
 *           type: string
 *           description: SQL for receiving data
 */

export const saveNewTemplateSchema = Joi.object({
  name: Joi.string().min(3).required(),
  template: Joi.object().required(),
  sql: Joi.string().allow("").required(),
});

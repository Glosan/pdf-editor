import Router from "koa-router";
import { GeneratorController } from "../controllers/GeneratorController.js";
import { ApiErrorCode, ApplicationError } from "../ApplicationError.js";
import { generatorSchema } from "../schemas/generator.schema.js";
import fs from "fs";

export function generatorRoutes(
  router: Router,
  generatorController: GeneratorController
) {
  /**
   * @openapi
   * /api/generatepdf:
   *   get:
   *     tags:
   *       - Generator
   *     description: Return generated PDF
   *     parameters:
   *       - in: query
   *         name: templateID
   *         required: true
   *         schema:
   *           type: number
   *         description: The ID of the template to generate
   *       - in: query
   *         name: sqlParams
   *         required: false
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *               format: binary
   *               description: Generated pdf
   *       400:
   *         description: Bad parameter
   *       404:
   *         description: Template not Found
   *       500:
   *         description: Internal Server Error
   */
  router.get("/api/generatepdf", async (ctx) => {
    const { query } = ctx;
    const { value, error } = generatorSchema.validate(query);
    if (error) {
      throw new ApplicationError({
        apiErrorCode: ApiErrorCode.BAD_PARAMETER,
        httpStatusCode: 400,
        publicMessage: error.message,
      });
    }
    const pdfBuffer = await generatorController.generateInvoice(
      value.sqlParams,
      value.templateID
    );
    ctx.set("Content-Type", "application/pdf");
    ctx.body = pdfBuffer;
    ctx.status = 200;
  });
}

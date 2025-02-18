import Router from "koa-router";
import { ParameterizedContext } from "koa";
import { SaveNewTemplateOptions, SaveTemplateOptions } from "../utils/types.js";
import { ApiErrorCode, ApplicationError } from "../ApplicationError.js";
import { EditorController } from "../controllers/EditorController.js";
import { saveTemplateSchema } from "../schemas/saveTemplate.schema.js";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { DBController } from "../controllers/DBController.js";
import { saveNewTemplateSchema } from "../schemas/saveNewTemplate.schema.js";
import { previewSqlSchema } from "../schemas/previewSql.schema.js";
import { getTemplateSchema } from "../schemas/getTemplate.schema.js";

export function editorRoutes(
  router: Router,
  editorController: EditorController,
  dbController: DBController
) {
  /**
   * @openapi
   * /api/saveNewTemplate:
   *   post:
   *     tags:
   *       - Template
   *     description: Save the provided template. Send everything in JSON
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SaveNewTemplate'
   *     responses:
   *       200:
   *         description: Template saved successfully
   *       400:
   *         description: Bad Parameter
   *       500:
   *         description: Internal Server Error
   */
  router.post("/api/saveNewTemplate", async (ctx) => {
    const body = ctx.request.body as SaveNewTemplateOptions;
    const { value, error } = saveNewTemplateSchema.validate(body);
    if (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.BAD_PARAMETER,
        privateMessage: "User sent request with bad parameter",
        publicMessage: "Invalid parameter",
        httpStatusCode: 400,
      });
    }
    ctx.body = await editorController.saveNewTemplate(value);
    ctx.status = 200;
  });
  /**
   * @openapi
   * /api/saveTemplate:
   *   post:
   *     tags:
   *       - Template
   *     description: Rewrite saved template with provided template
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SaveTemplate'
   *     responses:
   *       200:
   *         description: Template saved successfully
   *       400:
   *         description: Bad Parameter
   *       500:
   *         description: Internal Server Error
   */

  router.post("/api/saveTemplate", async (ctx) => {
    const body = ctx.request.body as SaveTemplateOptions;
    const { value, error } = saveTemplateSchema.validate(body);
    if (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.BAD_PARAMETER,
        privateMessage: "User sent request with bad parameter",
        publicMessage: "Invalid parameter",
        httpStatusCode: 400,
      });
    }
    editorController.saveTemplate(value);
    ctx.status = 200;
  });

  /**
   * @openapi
   * /api/getTemplateNames:
   *   get:
   *     tags:
   *       - Template
   *     description: Return names of all templates
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               required:
   *                 - names
   *                 - id
   *                 - archived
   *               properties:
   *                 names:
   *                   type: string
   *                   description: Name of template
   *                 id:
   *                   type: number
   *                   description: ID of template
   *                 archived:
   *                   type: boolean
   *                   description: Is archived true/false
   *       500:
   *         description: Internal Server Error
   */

  router.get("/api/getTemplateNames", async (ctx) => {
    const names = await editorController.getTemplateNames();
    ctx.status = 200;
    ctx.body = names;
  });

  /**
   * @openapi
   * /api/getTemplate:
   *   get:
   *     tags:
   *       - Template
   *     description: Return demanded template
   *     parameters:
   *       - in: query
   *         id: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the template to retrieve
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required:
   *                 - ID
   *                 - Name
   *                 - params
   *                 - templateDef
   *                 - sql
   *                 - archived
   *               properties:
   *                 ID:
   *                   type: number
   *                   description: Template identifier
   *                 Name:
   *                   type: string
   *                   description: Name of the template
   *                 params:
   *                   type: string
   *                   description: Parameter of the template
   *                 templateDef:
   *                   type: ReportBro object
   *                   description: Definition of the template ReportBro
   *                 sql:
   *                   type: string
   *                   description: Sql for data retrieving
   *                 archived:
   *                   type: boolean
   *                   description: Is archived 0/1
   *       400:
   *         description: Missing Parameter
   *       404:
   *         description: Template not Found
   *       500:
   *         description: Internal Server Error
   */

  router.get("/api/getTemplate", async (ctx) => {
    const { id } = ctx.query;
    const { value, error } = getTemplateSchema.validate(id);
    if (error) {
      throw new ApplicationError({
        publicMessage: "Invalid ID",
        httpStatusCode: 400,
        apiErrorCode: ApiErrorCode.BAD_PARAMETER,
      });
    }
    const template = await editorController.getTemplate(id);
    ctx.body = template;
    ctx.status = 200;
  });

  /**
   * @openapi
   * /api/previewsql:
   *   get:
   *     tags:
   *       - Preview
   *     description: Returns output of provided SQL query
   *     parameters:
   *       - in: query
   *         name: sql
   *         required: true
   *         schema:
   *           type: string
   *         description: SQL query for receiving data
   *       - in: query
   *         name: params
   *         required: false
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *         description: Parameters for the SQL query
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *             description: Output of provided SQL query
   *       500:
   *         description: Internal Server Error
   */

  router.get("/api/previewsql", async (ctx) => {
    const { query } = ctx;
    const { value, error } = previewSqlSchema.validate(query);
    if (error) {
      throw new ApplicationError({
        apiErrorCode: ApiErrorCode.BAD_PARAMETER,
        httpStatusCode: 400,
        publicMessage: error.message,
      });
    }

    const res = await dbController.getDataset(value.params, value.sql);
    ctx.body = res;
    ctx.status = 200;
  });

  // Endpoints for ReportBro designer
  // PUT uploads report definition -> generates pdf -> stores it in variable
  // Only one report at time

  let reportStore = [];

  router.put("/api/preview", async (ctx) => {
    const { report } = ctx.request.body;
    const { data } = ctx.request.body;
    let errorMessage = "";

    const pythonProcess = spawn("python3", [
      "src/pythonScripts/previewGen.py",
      //JSON.stringify(report),
      JSON.stringify(data),
    ]);

    pythonProcess.stdin.write(JSON.stringify(report));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      reportStore.push(data);
    });

    pythonProcess.stderr.on("data", (data) => {
      errorMessage = data.toString();
    });

    const exitCode = await new Promise((resolve, reject) => {
      pythonProcess.on("close", resolve);
      pythonProcess.on("error", reject);
    });

    if (exitCode !== 0) {
      throw new ApplicationError({
        httpStatusCode: 400,
        publicMessage: errorMessage,
        privateMessage: `Python exit code: ${exitCode}. Error message: ${errorMessage}`,
      });
    }

    ctx.status = 200;
    ctx.body = `key: unknown`;
  });

  // GET sends back the pdf file in variable

  router.get("/api/preview", async (ctx) => {
    if (reportStore.length === 0) {
      throw new ApplicationError({
        httpStatusCode: 400,
        publicMessage: "Report was not uploaded",
        privateMessage: "reportStore is empty",
      });
    }
    ctx.set("Content-Type", "application/pdf");
    ctx.set("Content-Disposition", 'inline; filename="report.pdf"');
    ctx.set("Content-Length", reportStore.length.toString());
    ctx.body = Buffer.concat(reportStore);
  });
}

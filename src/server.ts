import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ApiErrorCode, ApplicationError } from "./ApplicationError.js";
import serve from "koa-static";
import path from "path";
import { EditorController } from "./controllers/EditorController.js";
import { editorRoutes } from "./routes/editorRoutes.js";
import { swaggerDocs } from "./utils/swagger.js";
import { logger } from "./utils/logger.js";
import { generatorRoutes } from "./routes/generatorRoutes.js";
import { GeneratorController } from "./controllers/GeneratorController.js";
import { DBController } from "./controllers/DBController.js";
import { json } from "stream/consumers";
import fs from "fs";

process.on("uncaughtException", (err) => {
  console.error(err);
});

const server = new Koa();
const router = new Router();
const dbController = new DBController();
const editorController = new EditorController(dbController);
const generatorController = new GeneratorController(dbController);

server.use(async (ctx, next) => {
  try {
    await next();
    const rt = ctx.response.get("X-Response-Time");
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  } catch (ex) {
    const appError = ApplicationError.wrap(ex);
    appError.usedEndpoint = ctx.url;
    appError.usedMethod = ctx.method;
    ctx.status = appError.httpStatusCode;
    ctx.body = appError.toJSON();

    if (appError.httpStatusCode >= 500) {
      console.error(`Internal error:\n${appError}`);
    } else {
      console.debug(`Request error:\n${appError}`);
    }
    if (appError.apiErrorCode !== ApiErrorCode.BAD_PARAMETER) {
      logger.error({
        status: appError.httpStatusCode,
        method: appError.usedMethod,
        url: appError.usedEndpoint,
        message: appError.toString(),
      });
    }
  }
});

router.get("/api/test", async (ctx) => {});

server.use(bodyParser());
server.use(router.routes());
server.use(router.allowedMethods());

server.use(serve(path.join("editor")));

server.listen(3000, "0.0.0.0", () => {
  editorRoutes(router, editorController, dbController);
  generatorRoutes(router, generatorController);
  swaggerDocs(server);
});

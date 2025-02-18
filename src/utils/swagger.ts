import swaggerJsdoc from "swagger-jsdoc";
import Koa from "koa";
import { koaSwagger } from "koa2-swagger-ui";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Report Server API",
      version: "1.0.0",
      description: "API documentation for Report Server",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/schemas/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(server: Koa) {
  server.use(
    koaSwagger({
      routePrefix: "/docs",
      swaggerOptions: { spec: swaggerSpec },
    })
  );
}

import MSSQL from "mssql";
import { ApiErrorCode, ApplicationError } from "../ApplicationError.js";
import fs from "fs";
import { arch } from "os";

export class DBController {
  private config: MSSQL.config = {
    server: "",
    port: 0,
    user: "",
    password: "",
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  };
  public pool: any;

  public constructor() {
    if (!this.pool) {
      this.connectPool();
    }
  }

  public async connectPool(): Promise<void> {
    if (!this.pool || !this.pool.connected) {
      try {
        this.pool = new MSSQL.ConnectionPool(this.config);
        await this.pool.connect();

        if (this.pool.connected) {
          console.log("Database connected successfully");
        } else {
          throw new ApplicationError({
            publicMessage: "Database connection failed",
            apiErrorCode: ApiErrorCode.DB_FAIL,
          });
        }
      } catch (error) {
        throw ApplicationError.wrap(error, {
          publicMessage: "Database connection failed",
          apiErrorCode: ApiErrorCode.DB_FAIL,
        });
      }
    }
  }

  public async getDataset(
    params: Array<string>,
    sqlQuery: string
  ): Promise<Array<object>> {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      console.log(params);
      for (let i = 0; i < params.length; i++) {
        request.input("param" + i, MSSQL.VarChar(50), params[i].toString());
      }
      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        httpStatusCode: 500,
        apiErrorCode: ApiErrorCode.DB_FAIL,
        privateMessage: "Query fail getDataset",
        publicMessage: `Database error ${error}`,
      });
    }
  }

  public async getTemplate(templateId: number) {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      request.input("templateId", MSSQL.Int(), templateId);
      const query = `SELECT t.ID, t.Name, t.params, t.templateDef, s.sql, t.archived FROM nePohoda.dbo.templatesSql s INNER JOIN nePohoda.dbo.reportTemplates t ON s.ID = t.sqlRef WHERE t.ID = @templateId`;
      const response = await request.query(query);
      if (response.recordset.length === 0) {
        throw new ApplicationError({
          apiErrorCode: ApiErrorCode.NOT_FOUND,
          httpStatusCode: 404,
          publicMessage: "Template not found",
        });
      }
      return response.recordset[0];
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database update",
      });
    }
  }

  public async getSqlID(templateId: number) {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      const query = `SELECT sqlRef FROM  nePohoda.dbo.reportTemplates WHERE ID=@param`;
      request.input("param", MSSQL.Int(), templateId);
      const response = await request.query(query);
      console.log(response.recordset);
      return response.recordset[0].sqlRef;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database select",
      });
    }
  }

  public async setNewTemplate(
    name: string,
    params: string,
    template: string,
    sqlref: number
  ) {
    if (!this.pool.connected) {
      await this.connectPool();
    }

    try {
      const request = this.pool.request();
      request.input("name", MSSQL.NVarChar(50), name);
      request.input("params", MSSQL.NVarChar(MSSQL.MAX), params);
      request.input("template", MSSQL.NVarChar(MSSQL.MAX), template);
      request.input("sqlref", MSSQL.Int, sqlref);

      const query = `INSERT INTO nePohoda.dbo.reportTemplates (Name, params, templateDef, sqlRef) VALUES (@name, @params, @template, @sqlref); SELECT SCOPE_IDENTITY() as lastID`;
      const response = await request.query(query);
      return response.recordset[0].lastID;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database select",
      });
    }
  }

  public async updateTemplate(
    id: number,
    name: string,
    template: string,
    params: string,
    archived: number
  ) {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      request.input("params", MSSQL.NVarChar(MSSQL.MAX), params);
      request.input("template", MSSQL.NVarChar(MSSQL.MAX), template);
      request.input("id", MSSQL.Int(), id);
      request.input("name", MSSQL.NVarChar(50), name);
      request.input("archived", MSSQL.Int, archived);

      const query = `UPDATE nePohoda.dbo.reportTemplates SET params = @params, templateDef = @template, Name = @name, archived = @archived WHERE ID = @id`;
      const response = await request.query(query);
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database select",
      });
    }
  }

  public async setNewTemplateSql(sql: string) {
    if (!this.pool.connected) {
      await this.connectPool();
    }

    try {
      const request = this.pool.request();
      request.input("val", MSSQL.VarChar(MSSQL.MAX), sql);

      const query = `INSERT INTO nePohoda.dbo.templatesSql (sql) VALUES (@val); SELECT SCOPE_IDENTITY() as lastID`;
      const response = await request.query(query);
      const lastID = response.recordset[0].lastID;
      return lastID;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database insertion",
      });
    }
  }

  public async updateTemplateSql(sqlId: number, sql: string) {
    if (!this.pool.connected) {
      await this.connectPool();
    }

    try {
      const request = this.pool.request();
      request.input("id", MSSQL.Int(), sqlId);
      request.input("sql", MSSQL.VarChar(MSSQL.MAX), sql);

      const query = `UPDATE nePohoda.dbo.templatesSql SET sql = @sql WHERE id=@id`;
      const response = await request.query(query);
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database update",
      });
    }
  }

  public async getTemplateNames() {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      const query = `SELECT id, name, archived FROM  nePohoda.dbo.reportTemplates`;
      const response = await request.query(query);
      return response.recordset;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database select",
      });
    }
  }

  public async previewSql(sql: string, param: string) {
    if (!this.pool.connected) {
      await this.connectPool();
    }
    try {
      const request = this.pool.request();
      request.input("param", MSSQL.VarChar(MSSQL.MAX), param);
      const response = await request.query(sql);
      return response.recordset;
    } catch (error) {
      throw ApplicationError.wrap(error, {
        apiErrorCode: ApiErrorCode.DB_FAIL,
        publicMessage: "Failed database select",
      });
    }
  }
}

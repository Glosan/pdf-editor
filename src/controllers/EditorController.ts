import { ApiErrorCode, ApplicationError } from "../ApplicationError.js";
import { SaveNewTemplateOptions, SaveTemplateOptions } from "../utils/types.js";
import fs from "fs";
import { getParams } from "../utils/utils.js";
import { DBController } from "./DBController.js";

export class EditorController {
  private dbController;

  public constructor(dbController: DBController) {
    this.dbController = dbController;
  }

  public async saveNewTemplate(params: SaveNewTemplateOptions) {
    const templateParams = params.template.parameters;

    const sqlID = await this.dbController.setNewTemplateSql(params.sql);
    const tempID = await this.dbController.setNewTemplate(
      params.name,
      JSON.stringify(templateParams),
      JSON.stringify(params.template),
      sqlID
    );
    return await this.dbController.getTemplate(tempID);
  }

  public async saveTemplate(params: SaveTemplateOptions) {
    const templateParams = params.template.parameters;

    const sqlID = await this.dbController.getSqlID(params.id);
    this.dbController.updateTemplateSql(sqlID, params.sql);
    this.dbController.updateTemplate(
      params.id,
      params.name,
      JSON.stringify(params.template),
      JSON.stringify(templateParams),
      params.archived
    );
    return;
  }

  public async getTemplateNames() {
    const names = await this.dbController.getTemplateNames();
    const stripNames = names.map((elem) => {
      return {
        name: elem.name,
        id: elem.id,
        archived: elem.archived,
      };
    });
    return stripNames;
  }

  public async getTemplate(id: number) {
    const template = await this.dbController.getTemplate(id);
    template.templateDef = JSON.parse(template.templateDef);
    return template;
  }
}

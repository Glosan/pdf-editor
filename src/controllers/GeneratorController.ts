import { spawn } from "child_process";
import { ApplicationError } from "../ApplicationError.js";
import { RBParameters, ReportBroObject, Template } from "../utils/types.js";
import { DBController } from "./DBController.js";

export class GeneratorController {
  private dbController: DBController;
  public constructor(dbController: DBController) {
    this.dbController = dbController;
  }
  public async generateInvoice(dataParam: Array<string>, templateID: number) {
    const template = (await this.dbController.getTemplate(
      templateID
    )) as Template;
    template.templateDef = JSON.parse(template.templateDef as string);
    const { parameters } = template.templateDef as ReportBroObject;

    const rawDataset = await this.dbController.getDataset(
      dataParam,
      template.sql
    );
    const preparedDataset = this.prepareDataset(rawDataset, parameters);
    let pdfBuffer: Buffer;
    let errorMessage: string;

    const pythonProcess = spawn("python3", [
      "src/pythonScripts/generator.py",
      //JSON.stringify(report),
      JSON.stringify(preparedDataset),
    ]);

    pythonProcess.stdin.write(JSON.stringify(template.templateDef));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      pdfBuffer = data;
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
    return pdfBuffer;
  }

  private prepareDataset(
    rawDataset: Array<object>,
    templateParams: Array<object>
  ) {
    const row = rawDataset[0];
    const keys: Set<string> = new Set(Object.keys(row));
    let dataset = {};
    templateParams.forEach((obj: RBParameters) => {
      const name = obj.name;
      if (
        name === "page_count" ||
        name === "page_number" ||
        name == "row_number"
      ) {
        return;
      }
      if (obj.type === "array") {
        let arr = [];
        for (let i = 0; i < rawDataset.length; i++) {
          arr.push(this.prepareDataset([rawDataset[i]], obj.children));
        }
        dataset[name] = arr;
        return;
      }
      if (!keys.has(name) && name !== "table") {
        return;
      }

      if (obj.type === "date") {
        dataset[name] = row[name].toISOString().split("T")[0];
        return;
      }

      dataset[name] = row[name];
    });
    return dataset;
  }
}

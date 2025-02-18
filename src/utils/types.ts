export interface SaveNewTemplateOptions {
  name: string;
  template: ReportBroObject;
  sql: string;
}

export interface SaveTemplateOptions {
  id: number;
  name: string;
  template: ReportBroObject;
  sql: string;
  archived: number;
}

export interface ReportBroObject {
  docElements: Array<object>;
  documentProperties: object;
  parameters: Array<object>;
  styles: Array<object>;
  version: number;
  watermarks: Array<object>;
}

export interface Template {
  ID: number;
  Name: string;
  params: string;
  templateDef: string | ReportBroObject;
  sql: string;
}

export interface RBParameters {
  id: number;
  name: string;
  type: string;
  arrayItemType: string;
  eval: boolean;
  nullable: boolean;
  pattern: string;
  expression: string;
  showOnlyNameType: boolean;
  testData: string;
  testDataBoolean: boolean;
  testDataImage: string;
  testDataImageFilename: string;
  testDataRichText: string;
  children?: Array<RBParameters>;
}

import { SaveTemplateOptions } from "./types.js";

export function getParams(template: any) {
  console.log(template.parameters);
  let allParams = [];

  template.parameters.forEach((element) => {
    allParams.push(element.name);
  });
  return allParams;
}

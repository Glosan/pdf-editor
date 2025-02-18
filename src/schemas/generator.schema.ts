import Joi from "joi";

export const generatorSchema = Joi.object({
  templateID: Joi.number().required().positive().message("Invalid templateID"),
  sqlParams: Joi.any()
    .custom((value, helpers) => {
      console.log(value);
      if (value === "" || value === undefined) return []; // Return empty array if value is empty string
      try {
        const parsed = JSON.parse(value); // Parse the JSON string
        if (!Array.isArray(parsed)) throw new Error("params are not an Array");
        if (!parsed.every((item) => typeof item === "string"))
          throw new Error("params items must be strings");
        return parsed; // Return parsed array
      } catch (error) {
        return helpers.error("string.custom", { message: error.message });
      }
    })
    .default([])
    .messages({
      "string.custom": "{{#message}}",
    }),
});

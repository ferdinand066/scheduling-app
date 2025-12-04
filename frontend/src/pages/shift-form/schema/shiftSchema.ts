import Joi from "joi";

export const shiftSchema = Joi.object({
  name: Joi.string().required(),
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required().invalid(Joi.ref("startTime")).messages({
    "any.invalid": "End time cannot be the same as start time",
  }),
});

export interface IFormInput {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

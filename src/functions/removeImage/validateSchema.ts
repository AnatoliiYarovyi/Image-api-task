import Joi from 'joi';

const validateSchema = Joi.object({
  // accessToken: Joi.string().token().required(),
  // imageName: Joi.string().required(),
});

export default validateSchema;

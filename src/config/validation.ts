import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    PORT: Joi.number().required(),
    STAGE: Joi.string().valid('dev', 'prod', 'staging', 'test').required(),
    HOST_API: Joi.string().uri().required(),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
});

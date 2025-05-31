import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    PORT: Joi.number().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'staging', 'test').required(),
    HOST_API: Joi.string().uri().required(),
    FRONTEND_BASE_URL: Joi.string().uri().required(),
    
    DATABASE_URL: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION: Joi.string().required(),

    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().required(),

    GMAIL_CLIENT_ID: Joi.string().required(),
    GMAIL_CLIENT_SECRET: Joi.string().required(),
    GMAIL_REFRESH_TOKEN: Joi.string().required(),
    GMAIL_EMAIL: Joi.string().required(),
});

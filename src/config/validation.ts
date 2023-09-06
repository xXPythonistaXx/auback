import * as Joi from 'joi';
import { CONFIG } from './configuration.enum';

export const validationSchema = Joi.object({
  [CONFIG.NODE_ENV]: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  [CONFIG.API_HOST]: Joi.string().default('http://localhost'),
  [CONFIG.FRONTEND_URL]: Joi.string().required(),
  [CONFIG.PORT]: Joi.number().default(3000),
  [CONFIG.MONGODB_URI]: Joi.string().required(),
  [CONFIG.TOKEN_SECRET]: Joi.string().required(),
  [CONFIG.TOKEN_EXPIRES_IN]: Joi.string().default('60s'),
  [CONFIG.REFRESH_TOKEN_SECRET]: Joi.string().required(),
  [CONFIG.REFRESH_TOKEN_EXPIRES_IN]: Joi.string().default('120s'),
  [CONFIG.ENCRYPT_SECRET]: Joi.string().required(),
  [CONFIG.RESET_PASSWORD_TOKEN_EXPIRATION]: Joi.number().default(120),
  [CONFIG.EMAIL_CONFIRMATION_TOKEN_EXPIRATION]: Joi.number().default(120),
  [CONFIG.GOOGLE_CLIENT_ID]: Joi.string().required(),
  [CONFIG.GOOGLE_CLIENT_SECRET]: Joi.string().required(),
  [CONFIG.SMTP_HOST]: Joi.string().required(),
  [CONFIG.SMTP_PORT]: Joi.number().required(),
  [CONFIG.SMTP_USER]: Joi.string().required(),
  [CONFIG.SMTP_SECRET]: Joi.string().required(),
  [CONFIG.SMTP_FROM_EMAIL]: Joi.string().required(),
  [CONFIG.AWS_REGION]: Joi.string().required(),
  [CONFIG.AWS_PUBLIC_BUCKET_NAME]: Joi.string().required(),
  [CONFIG.AWS_ACCESS_KEY_ID]: Joi.string().required(),
  [CONFIG.AWS_SECRET_ACCESS_KEY]: Joi.string().required(),
  [CONFIG.RD_STATION_CLIENT_ID]: Joi.string().required(),
  [CONFIG.RD_STATION_CLIENT_SECRET]: Joi.string().required(),
  [CONFIG.REDIS_HOST]: Joi.string().required(),
  [CONFIG.REDIS_PORT]: Joi.string().required(),
  [CONFIG.RD_STATION_CLIENT_SECRET]: Joi.string().required(),
  [CONFIG.RD_STATION_CLIENT_SECRET]: Joi.string().required(),
  [CONFIG.SEND_GRID_KEY]: Joi.string().required(),
});

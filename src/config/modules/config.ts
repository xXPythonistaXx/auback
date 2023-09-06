import { validationSchema } from '@config/index';

export const configModule = {
  validationSchema: validationSchema,
  validationOptions: {
    abortEarly: true,
  },
  isGlobal: true,
  expandVariables: true,
  envFilePath: ['.env', '.env.local', `.production.env`],
};

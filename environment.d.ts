declare namespace NodeJS {
  export interface ProcessEnv {
    API_HOST: string;
    PORT: string;
    FRONTEND_URL: string;
    MONGODB_URI: string;
    TOKEN_SECRET: string;
    TOKEN_EXPIRES_IN?: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRES_IN?: string;
    ENCRYPT_SECRET: string;
    RESET_PASSWORD_TOKEN_EXPIRATION: number;
    EMAIL_CONFIRMATION_TOKEN_EXPIRATION: number;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    FACEBOOK_CLIENT_ID: string;
    FACEBOOK_CLIENT_SECRET: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_SECRET: string;
  }
}

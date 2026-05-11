import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT),
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  PG_DUMP_PATH: process.env.PG_DUMP_PATH || "pg_dump",
  PSQL_PATH: process.env.PSQL_PATH || "psql",
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || "local",
  STORAGE_LOCAL_ROOT: process.env.STORAGE_LOCAL_ROOT || "storage/private",
  STORAGE_MAX_FILE_SIZE_MB: Number(process.env.STORAGE_MAX_FILE_SIZE_MB || 10),
};
